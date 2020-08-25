/* tslint:disable:no-any */
import { Plugin, State } from '@hookstate/core';
import { PluginCallbacks } from '@hookstate/core/dist';

export const ValidationId = Symbol('Validation');

type ValidateFn<T> = (value: T) => boolean;
type Path = readonly (string | number | symbol)[];

interface CommonValidator<T> {
    valid(): boolean;

    errors(): string[];

    required(message?: string): void;

    isRequired(): boolean;
}

interface SingleValidator<T> extends CommonValidator<T> {
    validate: (validator: ValidateFn<T>, message?: string) => void;
}

type NestedValidator<Root, T> = T extends string ? SingleValidator<T> :
    T extends any[] ? ArrayValidator<Root, T[0]> : ObjectValidator<Root, T>;

type ObjectValidator<Root, T> = {
    [Key in keyof T]: NestedValidator<Root, T[Key]>
} & CommonValidator<T> & {
    valid(fields?: (keyof T)[]): boolean;

    when(fn: (value: T, root: Root) => boolean): ObjectValidator<Root, T>;
};

type ArrayValidator<Root, T> = CommonValidator<T> & ObjectValidator<Root, T> & {
    validate(validator: ValidateFn<T[]>, message?: string): void;

    forEach(fn: (validator: NestedValidator<Root, T>) => void): void;
};

interface Condition {
    fn: (value: any, root: any) => boolean;
    state: State<any>;
    path: Path;
}

interface Validator {
    fn: ValidateFn<any>;
    path: Path;
    message?: string;
    required?: boolean;
    condition?: Condition;
}

type ReturnType<Root, T> = ObjectValidator<Root, T> | ArrayValidator<Root, T> | SingleValidator<T>;

class ValidatorInstance<T> {
    validators: Validator[] = [];

    isRequired(state: State<T>) {
        return this.matchValidators(state).some(s => !!s.validator.required);
    }

    valid(state: State<T>) {
        return this.errors(state).length === 0;
    }

    errors(state: State<T>) {
        const validators = this.matchValidators(state);

        let errors: string[] = [];

        for (const { paths, validator } of validators) {
            if (paths.length && isArrayState(state)) {
                state.forEach((item, index) => {
                    if (!this.conditionalValid(validator, item)) {
                        return;
                    }

                    errors = [...errors, ...this.validNested(paths, item, validator)];
                });
            } else {
                if (!this.conditionalValid(validator, state)) {
                    continue;
                }

                errors = [...errors, ...this.validNested(paths, state, validator)];
            }
        }

        return errors;
    }

    private conditionalValid(validator: Validator, state: State<any>): boolean {
        if (!validator.condition) {
            return true;
        }

        if (isArrayState(state)) {
            return state.every((t, index) => this.conditionalValid(validator, t));
        }

        if (state.path.filter(p => typeof p !== 'number').length > validator.condition.path.length) {
            // the property getting validated is too deep, need to use validator state
            return this.conditionalValid(validator, validator.condition.state);
        }

        // always skip first, they are the same as target state
        const statePaths = state.path.slice(0);
        const conditionPath = validator.condition.path.slice(0);

        // normalize paths
        while (statePaths.length) {
            if (typeof statePaths[0] === 'string') {
                if (!conditionPath.length) {
                    break;
                }

                if (statePaths[0] === conditionPath[0]) {
                    conditionPath.shift();
                    statePaths.shift();

                    continue;
                }

                // paths do not match, ignore conditional validator
                return true;
            }

            // assume it is an index and continue
            statePaths.shift();
        }

        if (conditionPath.length > 1) {
            return this.conditionalValid(validator, state.nested(conditionPath[0]));
        }

        let target = state;

        if (conditionPath.length === 1) {
            target = state.nested(conditionPath[0]);

            if (isArrayState(target)) {
                return target.every((t, index) => this.conditionalValid(validator, t));
            }
        }

        return validator.condition.fn(target.get(), validator.condition.state.get());
    }

    private matchValidators(state: State<any>) {
        return this.validators.map(validator => {
            const paths = [...validator.path];

            let match = true;

            for (const path of state.path) {
                if (typeof path === 'string') {
                    if (paths.length === 0) {
                        break;
                    }

                    if (paths.shift() !== path) {
                        match = false;
                        break;
                    }
                } else if (typeof path === 'number') {
                    if (paths.length === 0) {
                        match = false;

                        break;
                    }
                }
            }

            return {
                paths,
                match,
                validator,
            };
        }).filter(v => !!v.match);
    }

    private validNested(paths: Path, state: State<any>, validator: Validator): string[] {
        if (isArrayState(state)) {
            return state.map((item, index) => {
                return this.validNested(paths, state[index], validator);
            }).flat();
        }

        if (paths.length) {
            // drill down any unmatched paths
            const nested = paths.slice(0);
            const path = nested.shift();

            if (!path) {
                throw new Error('Should not happen.');
            }

            return this.validNested(nested, state.nested(path), validator);
        }

        if (isPrimitiveState(state)) {
            if (!validator.fn(state.get())) {
                return [validator.message || 'This field is not valid.'];
            }
        } else if (!validator.fn(state.get())) {
            return [validator.message || 'This field is not valid.'];
        }

        return [];
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
    condition?: Condition,
): any {
    return new Proxy({}, {
        apply(t: (fieldValidator: ValidateFn<any>) => void, thisArg: any, argArray?: any): any {
            t.apply(thisArg, argArray);
        },
        get(_: any, nestedProp: PropertyKey, receiver: any) {
            if (nestedProp === 'when') {
                return (when: ValidateFn<any>) => {
                    condition = {
                        fn: when,
                        state,
                        path,
                    };

                    return receiver;
                };
            }

            if (nestedProp === 'isRequired') {
                return () => instance.isRequired(state);
            }

            if (nestedProp === 'required') {
                return (message?: string) => {
                    instance.validators.push({
                        fn: (value => Array.isArray(value) ? value.length > 0 : !!value),
                        path,
                        required: true,
                        message: message || 'This field is required',
                        condition,
                    });
                };
            }

            if (nestedProp === 'errors') {
                return (fields?: any[]) => {
                    if (fields === undefined) {
                        return instance.errors(state);
                    }

                    let errors: string[] = [];

                    for (const field of fields) {
                        errors = [...errors, ...instance.errors(state.nested(field))];
                    }

                    return errors;
                };
            }

            if (nestedProp === 'valid') {
                return (fields?: any[]) => {
                    if (fields === undefined) {
                        return instance.valid(state);
                    }

                    for (const field of fields) {
                        return instance.valid(state.nested(field));
                    }

                    return true;
                };
            }

            if (nestedProp === 'validate') {
                return (nestedValidator: ValidateFn<any>, message?: string) => {
                    instance.validators.push({
                        fn: nestedValidator,
                        path,
                        message,
                        condition,
                    });
                };
            }

            if (nestedProp === 'forEach') {
                return (fn: (validator: any) => void) => {
                    fn(buildProxy(instance, path, state));
                };
            }

            // user is chaining down properties
            return buildProxy(instance, [...path, nestedProp], state, condition);
        },
    });
}

export function Validation(): Plugin;
export function Validation(input: State<string>): SingleValidator<string>;
export function Validation(input: State<number>): SingleValidator<number>;
export function Validation<T>(input: State<T[]>): ArrayValidator<T[], T>;
export function Validation<T>(input: State<T>): ObjectValidator<T, T>;
export function Validation<T>(input?: State<T>): Plugin | ReturnType<T, T> {
    if (input === undefined) {
        return {
            id: ValidationId,
            init: () => {
                return new ValidatorInstance() as PluginCallbacks;
            },
        };
    }

    const [instance] = input.attach(ValidationId);

    if (instance instanceof Error) {
        throw new Error(`Forgot to run state.attach(Validation())`);
    }

    if (!(instance instanceof ValidatorInstance)) {
        throw new Error('Expected plugin to be of ValidatorInstance');
    }

    return buildProxy(instance, input.path, input);
}
