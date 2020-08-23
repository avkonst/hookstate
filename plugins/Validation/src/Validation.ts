/* tslint:disable:no-any */
import { Plugin, State } from '@hookstate/core';
import { Downgraded, PluginCallbacks, useState, } from '@hookstate/core/dist';

export const ValidationId = Symbol('Validation');

type ValidateFn<T> = (value: T) => boolean;
type Path = readonly (string | number | symbol)[];

interface CommonValidator<T> {
    valid(): boolean;

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

    isRequired(state: State<T>, downgraded: State<T>) {
        return this.matchValidators(state, downgraded).some(s => !!s.validator.required);
    }

    valid(state: State<T>, downgraded: State<T>) {
        const validators = this.matchValidators(state, downgraded);

        for (const { paths, validator } of validators) {
            if (paths.length && isArrayState(state)) {
                const allValid = state.every((item, index) => {
                    if (validator.condition) {
                        const value = downgraded[index].get();
                        const root = validator.condition.state.get();

                        if (!validator.condition.fn(value, root)) {
                            return true;
                        }
                    }

                    return this.validNested(paths, item, downgraded[index], validator);
                });

                // if an array, run validation through each
                if (!allValid) {
                    return false;
                }
            } else {
                if (validator.condition) {
                    let target = validator.condition.state;

                    // always skip first, they are the same as target state
                    const statePaths = [...state.path.slice(1)];
                    const conditionPaths = [...validator.condition.path.slice(1)];

                    for (const path of statePaths) {
                        if (typeof path === 'string') {
                            if (conditionPaths.length === 0) {
                                break;
                            }

                            target = target.nested(path);

                            conditionPaths.shift();
                        } else if (typeof path === 'number') {
                            target = target[path];
                        }
                    }

                    if (!validator.condition.fn(target.get(), validator.condition.state.get())) {
                        continue;
                    }
                }

                if (!this.validNested(paths, state, downgraded, validator)) {
                    return false;
                }
            }
        }

        return true;
    }

    private matchValidators(state: State<any>, downgraded: State<T>) {
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

    private validNested(paths: Path, state: State<any>, downgrade: State<any>, validator: Validator) {
        let data: State<any> = downgrade;
        let target: State<any> = state;

        // drill down any unmatched paths
        for (const path of paths) {
            data = data.nested(path);
            target = target.nested(path);
        }

        if (isPrimitiveState(target)) {
            if (!validator.fn(target.get())) {
                return false;
            }
        } else if (!validator.fn(data.get())) {
            return false;
        }

        return true;
    }
}

function isPrimitiveState<T>(state: any): state is State<T> {
    return state.keys === undefined;
}

function isObjectState<T>(state: State<T>, keys: any): keys is ReadonlyArray<keyof T> {
    return Array.isArray(state.keys) && state.keys.length > 0 && state.keys.every(k => typeof k === 'string');
}

function isArrayState<T>(state: any): state is ReadonlyArray<State<T>> {
    return !isPrimitiveState(state) && !isObjectState(state, state.keys);
}

function buildInnerProxy(
    target: any,
    instance: ValidatorInstance<any>,
    path: Path,
    state: State<any>,
    downgraded: State<any>,
    condition?: Condition
): any {
    return new Proxy(target, {
        apply(t: (fieldValidator: ValidateFn<any>) => void, thisArg: any, argArray?: any): any {
            t.apply(thisArg, argArray);
        },
        get(_: any, nestedProp: PropertyKey, receiver: any) {
            if (nestedProp === 'when') {
                return (when: ValidateFn<any>) => {
                    condition = {
                        fn: when,
                        state: downgraded,
                        path,
                    };

                    return receiver;
                };
            }

            if (nestedProp === 'isRequired') {
                return instance.isRequired(state, downgraded);
            }

            if (nestedProp === 'required') {
                return (message?: string) => {
                    instance.validators.push({
                        fn: (value => Array.isArray(value) ? value.length > 0 : !!value),
                        path,
                        required: true,
                        message,
                        condition,
                    });
                };
            }

            if (nestedProp === 'valid') {
                return () => instance.valid(state, downgraded);
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
                return forEach(instance, state, downgraded, path);
            }

            // user is chaining down properties
            return buildInnerProxy(target, instance, [...path, nestedProp], state, downgraded, condition);
        },
    });
}

function buildProxy(instance: ValidatorInstance<any>, path: Path, state: State<any>, downgraded: State<any>) {
    let condition: Condition;

    return new Proxy({}, {
        get(target: any, prop: PropertyKey, receiver: any) {
            if (prop === 'when') {
                return (when: ValidateFn<any>) => {
                    condition = {
                        fn: when,
                        state: downgraded,
                        path,
                    };

                    return receiver;
                };
            }

            const getter = (fieldValidator: ValidateFn<any>, message?: string) => {
                instance.validators.push({
                    fn: fieldValidator,
                    path: [...path, prop],
                    message,
                    condition,
                });
            };

            return buildInnerProxy(getter, instance, path, state, downgraded, condition);
        },
    });
}

function forEach(instance: ValidatorInstance<any>, state: State<any>, downgraded: State<any>, path?: Path) {
    return (fn: (validator: any) => void) => {
        fn(buildProxy(instance, path || state.path, state, downgraded));
    };
}

function stateToApi<T>(
    instance: ValidatorInstance<any>,
    state: State<any>,
    downgraded: State<any>,
    condition?: (value: T) => boolean
): ReturnType<any, T> {
    if (isPrimitiveState(state)) {
        return {
            validate: (fn: ValidateFn<any>, message?: string) => {
                instance.validators.push({
                    fn,
                    path: state.path,
                    message,
                });
            },
            valid: () => instance.valid(state, downgraded),
            isRequired: () => instance.isRequired(state, downgraded),
            required(message?: string) {
                instance.validators.push({
                    fn: (value => Array.isArray(value) ? value.length > 0 : !!value),
                    path: state.path,
                    message,
                    required: true,
                });
            },
        } as SingleValidator<any>;
    }

    if (isObjectState(state, state.keys)) {
        // object field type
        const api = {
            valid: (fields: (keyof T)[]) => {
                if (fields === undefined) {
                    return instance.valid(state, downgraded);
                }

                for (const field of fields) {
                    return instance.valid(state.nested(field), downgraded.nested(field));
                }

                return true;
            },
            when(fn: (value: T) => boolean) {
                return stateToApi<T>(instance, state, downgraded, fn);
            },
        } as ObjectValidator<any, T>;

        for (const field of state.keys) {
            api[field] = stateToApi(instance, state.nested(field), downgraded.nested(field));
        }

        return api;
    }

    return buildInnerProxy({}, instance, state.path, state, downgraded);
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

    const downgraded: State<T> = useState(input);
    downgraded.attach(Downgraded);

    return stateToApi<T>(instance, input, downgraded);
}
