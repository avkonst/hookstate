/* tslint:disable:no-any */
import { Path, PluginCallbacks, StateValueAtRoot, State } from '@hookstate/core';

const ValidationId = Symbol('Validation');

type ValidateFn<T> = (value: T, ...depends: State<any>[]) => boolean;

interface NestedState {
    state: State<any>;
    parent?: NestedState;
}

interface SingleValidator<T> {
    required(message?: string): void;

    validate(validator: ValidateFn<T>, message?: string): void;
}

type DetectValidator<T> = T extends string | number | boolean ? SingleValidator<T> :
    T extends any[] ? ArrayValidator<T> : ObjectValidator<T>;

type FieldValidator<T> = {
    [Key in keyof T]: DetectValidator<T[Key]>
};

type Depends<T> = { [P in keyof T]: DetectValidator<T[P]> };

type Dependency<T> = { [P in keyof T]: T[P] extends any[] ? ReadonlyArray<State<T[P][0]>> : State<T[P]> };

type ObjectValidator<T> = SingleValidator<T> & FieldValidator<T> & {
    whenType<K extends keyof T, V extends T[K]>(key: K, value: V):
        ObjectValidator<T & { [Key in keyof Pick<T, K>]: V }>;
};

type ArrayValidator<T extends any[]> = SingleValidator<T> & FieldValidator<T[0]> & {
    whenType<K extends keyof T[0], V extends T[0][K]>(key: K, value: V):
        ArrayValidator<(T[0] & { [Key in keyof Pick<T[0], K>]: V })[]>;

    when<D extends unknown[]>(
        fn: (value: State<T[0]>, ...dependencies: Dependency<D>) => boolean,
        ...depends: Depends<D>
    ): ArrayValidator<T>;
};

interface Condition {
    fn: (value: any, root: any) => boolean;
    path: Path;
    root: State<any>;
}

interface Validator {
    fn: ValidateFn<any>;
    path: Path;
    message?: string;
    required?: boolean;
    conditions: Condition[];
}

class ValidatorInstance<T> {
    validators: Validator[] = [];

    constructor(public root: State<StateValueAtRoot>) {
    }

    isRequired(state: State<T>) {
        return this.validators.filter(v => v.required).some(v => this.pathToTargets(v.path, state).length > 0);
    }

    valid(state: State<T>) {
        return this.errors(state).length === 0;
    }

    errors(state: State<T>) {
        const errors: string[] = [];

        for (const validator of this.validators) {
            const targets = this.pathToTargets(validator.path, state);

            for (const target of targets) {
                let valid = true;

                // use traditional loop to ensure all subscriptions occur in when functions
                for (const condition of validator.conditions) {
                    if (!this.conditionalValid(validator.path, condition, target)) {
                        valid = false;
                    }
                }

                if (!valid) {
                    continue;
                }

                if (!validator.fn(target.state.get())) {
                    errors.push(validator.message || 'This field is not valid.');
                }
            }
        }

        return errors;
    }

    public pathToTargets(path: Path, state: State<any>, iterate: boolean = true, parent?: NestedState): NestedState[] {
        const target = { state, parent };

        if (Array.isArray(state)) {
            if (!iterate) {
                return [target];
            }

            let items: NestedState[] = [];

            state.forEach((item, index) => {
                items = [...items, ...this.pathToTargets(path, item, iterate, target)];
            });

            return items;
        }

        const statePaths = state.path.slice(0);
        const requestedPaths = path.slice(0);

        while (requestedPaths.length) {
            if (!statePaths.length) {
                const next = requestedPaths.shift();

                if (!next) {
                    throw new Error('should not happen');
                }

                return this.pathToTargets(path, state.nested(next), iterate, target);
            }

            if (typeof statePaths[0] === 'string') {
                if (statePaths[0] === requestedPaths[0]) {
                    requestedPaths.shift();
                    statePaths.shift();

                    continue;
                }

                // paths do not match, skip
                return [];
            }

            statePaths.shift();
        }

        return [target];
    }

    private conditionalValid(path: Path, condition: Condition, nested: NestedState): boolean {
        if (Array.isArray(nested.state)) {
            return nested.state.every((t) => this.conditionalValid(path, condition, { state: t, parent: nested }));
        }

        let target;

        if (!nested.parent) {
            target = this.root;

            const paths = nested.state.path.slice(0);
            let stop = condition.root.path.length;

            if (Array.isArray(condition.root)) {
                stop += 1;
            }

            while (target.path.length < stop) {
                const next = paths.shift();

                if (next !== undefined) {
                    target = target.nested(next);
                }
            }
        } else {
            target = nested.parent;

            while (target.state.path.filter(f => typeof f !== 'number').toString() !== condition.path.toString()) {
                if (target.parent) {
                    target = target.parent;
                } else {
                    throw new Error('not sure how to handle');
                }
            }

            target = target.state;
        }

        return condition.fn(target, condition.root);
    }
}

function buildProxy(
    instance: ValidatorInstance<any>,
    path: Path,
    state: State<any>,
    conditions: Condition[],
): any {
    return new Proxy({}, {
        apply(t: (fieldValidator: ValidateFn<any>) => void, thisArg: any, argArray?: any): any {
            t.apply(thisArg, argArray);
        },
        get(_: any, nestedProp: PropertyKey) {
            if (typeof nestedProp === 'symbol') {
                throw new Error('Symbols are not supported.');
            }

            const cleanPath = path.filter(p => typeof p !== 'number');

            if (nestedProp === 'path') {
                return cleanPath;
            }

            if (nestedProp === 'whenType') {
                return (key: any, value: any) => buildProxy(instance, path, state, [
                    ...conditions,
                    {
                        fn: (s) => s[key].get() === value,
                        path: cleanPath,
                        root: instance.pathToTargets(cleanPath, instance.root, false)[0].state,
                    },
                ]);
            }

            if (nestedProp === 'when') {
                return (when: ValidateFn<any>, ...depends: any[]) => {
                    const dependStates = depends.map(d => {
                        return instance.pathToTargets(d.path, instance.root, false)[0].state;
                    });

                    return buildProxy(instance, path, state, [
                        ...conditions,
                        {
                            fn: (value) => {
                                return when(value, ...dependStates);
                            },
                            path: cleanPath,
                            root: instance.pathToTargets(cleanPath, instance.root, false)[0].state,
                        },
                    ]);
                };
            }

            if (nestedProp === 'required') {
                return (message?: string) => {
                    instance.validators.push({
                        fn: (value => Array.isArray(value) ? value.length > 0 : !!value),
                        path: cleanPath,
                        required: true,
                        message: message || 'This field is required',
                        conditions,
                    });
                };
            }

            if (nestedProp === 'validate') {
                return (nestedValidator: ValidateFn<any>, message?: string) => {
                    instance.validators.push({
                        fn: nestedValidator,
                        path: cleanPath,
                        message,
                        conditions,
                    });
                };
            }

            return buildProxy(instance, [...path, nestedProp], state, conditions.slice(0));
        },
    });
}

type PathFields<S> = (keyof S)[] | ((s: State<S extends (infer T)[] ? T : S>) => boolean);

interface PathValidator<S> {
    valid(fields?: PathFields<S>): boolean;

    required(): boolean;

    errors(fields?: PathFields<S>): string[];
}

export function Validation<T>(input: State<T>): PathValidator<T> {
    const [instance] = input.attach(ValidationId);

    if (instance instanceof Error) {
        throw new Error(`Forgot to run ValidationAttach()`);
    }

    if (!(instance instanceof ValidatorInstance)) {
        throw new Error('Expected plugin to be of ValidatorInstance');
    }

    return {
        valid(fields: PathFields<T>): boolean {
            return this.errors(fields).length === 0;
        },
        required(): boolean {
            return instance.isRequired(input);
        },
        errors(fields: PathFields<T>): string[] {
            if (fields === undefined) {
                return instance.errors(input);
            }

            let errors: string[] = [];

            if (typeof fields === 'function') {
                if (Array.isArray(input)) {
                    input.forEach(item => {
                        // @ts-ignore
                        if (fields(item)) {
                            errors = [...errors, ...instance.errors(item)];
                        }
                    });
                }
            } else {
                for (const field of fields) {
                    errors = [...errors, ...instance.errors(input.nested(field))];
                }
            }

            return errors;
        },
    };
}

export function ValidationAttach<T>(state: State<T>, config: ((validator: DetectValidator<T>) => void)) {
    state.attach(() => ({
        id: ValidationId,
        init: (root) => {
            const instance = new ValidatorInstance(root);

            const api = buildProxy(instance, state.path, state, []);

            config(api);

            return instance as PluginCallbacks;
        },
    }));
}
