/* tslint:disable:no-any */
import { State } from '@hookstate/core';
import { PluginCallbacks, StateValueAtRoot } from '@hookstate/core/dist';

export const ValidationId = Symbol('Validation');

type ValidateFn<T> = (value: T) => boolean;
type Path = readonly (string | number | symbol)[];

interface NestedState {
    state: State<any>;
    parent?: NestedState;
}

interface SingleValidator<T> {
    required(message?: string): void;

    when(fn: (value: State<T>) => boolean): this;

    validate(validator: ValidateFn<T>, message?: string): void;
}

type NestedValidator<Root, T> = T extends string ? SingleValidator<T> :
    T extends any[] ? ArrayValidator<Root, T[0]> : ObjectValidator<Root, T>;

type ObjectNestedValidator<Root, T> = {
    [Key in keyof T]: NestedValidator<Root, T[Key]>
};

interface ObjectRootValidator<Root, T> extends SingleValidator<T> {
    when(fn: (value: State<T>, root: Root) => boolean): this;
}

type ObjectValidator<Root, T> = ObjectNestedValidator<Root, T> & ObjectRootValidator<Root, T> & {
    whenType<K extends keyof T, V extends T[K]>(key: K, value: V):
        ObjectValidator<Root, T & { [Key in keyof Pick<T, K>]: V }>;
};

type ArrayValidator<Root, T> = ObjectValidator<Root, T> & {
    validate(validator: ValidateFn<T[]>, message?: string): void;
};

interface Condition {
    fn: (value: any, root: any) => boolean;
    path: Path;
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

    constructor(private root: State<StateValueAtRoot>) {
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
                for (const conditions of validator.conditions) {
                    if (!this.conditionalValid(validator.path, conditions, target)) {
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

    private pathToTargets(path: Path, state: State<any>, parent?: NestedState): NestedState[] {
        const target = { state, parent };

        if (isArrayState(state)) {
            const items: NestedState[] = [];

            state.forEach((item, index) => {
                const nested = this.pathToTargets(path, item, target);

                if (nested.length > 1) {
                    throw new Error('nested arrays not supported.');
                }

                if (nested.length === 1) {
                    items.push({ state: nested[0].state, parent: nested[0].parent });
                }
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

                return this.pathToTargets(path, state.nested(next), target);
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
        if (isArrayState(nested.state)) {
            return nested.state.every((t) => this.conditionalValid(path, condition, { state: t, parent: nested }));
        }

        let conditionRoot;
        let target;

        if (!nested.parent) {
            conditionRoot = this.pathToTargets(condition.path, this.root)[0];

            target = this.root;

            const paths = nested.state.path.slice(0);
            let stop = conditionRoot.state.path.length;

            if (isArrayState(conditionRoot.state)) {
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
            conditionRoot = nested.parent;

            while (conditionRoot.state.path.toString() !== condition.path.toString()) {
                if (conditionRoot.parent) {
                    conditionRoot = conditionRoot.parent;
                }
            }

            while (target.state.path.filter(f => typeof f !== 'number').toString() !== condition.path.toString()) {
                if (target.parent) {
                    target = target.parent;
                }
            }

            target = target.state;
        }

        return condition.fn(target, conditionRoot.state);
    }
}

function isPrimitiveState<T>(state: any): state is State<T> {
    return state.keys === undefined;
}

function isObjectState<T>(state: State<T>, keys: any): keys is ReadonlyArray<keyof T> {
    return Array.isArray(state.keys) && state.keys.length > 0 && state.keys.every(k => typeof k === 'string');
}

function isArrayState<T>(state: any): state is ReadonlyArray<State<T>> {
    return !isPrimitiveState(state) && !isObjectState(state, state.keys) && typeof state.map === 'function';
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
            const cleanPath = path.filter(p => typeof p !== 'number');

            if (nestedProp === 'whenType') {
                return (key: any, value: any) => buildProxy(instance, path, state, [
                    ...conditions,
                    {
                        fn: (s) => s[key].get() === value,
                        path: cleanPath,
                    },
                ]);
            }

            if (nestedProp === 'when') {
                return (when: ValidateFn<any>) => buildProxy(instance, path, state, [
                    ...conditions,
                    {
                        fn: when,
                        path: cleanPath,
                    },
                ]);
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

export function Validation<T>(input: State<T>) {
    const [instance] = input.attach(ValidationId);

    if (instance instanceof Error) {
        throw new Error(`Forgot to run ValidationAttach()`);
    }

    if (!(instance instanceof ValidatorInstance)) {
        throw new Error('Expected plugin to be of ValidatorInstance');
    }

    return {
        valid(fields?: any[]): boolean {
            return this.errors(fields).length === 0;
        },
        required(): boolean {
            return instance.isRequired(input);
        },
        errors(fields?: any[]): string[] {
            if (fields === undefined) {
                return instance.errors(input);
            }

            let errors: string[] = [];

            for (const field of fields) {
                errors = [...errors, ...instance.errors(input.nested(field))];
            }

            return errors;
        },
    };
}

export function ValidationAttach<T>(state: State<T>, config: ((validator: NestedValidator<T, T>) => void)) {
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
