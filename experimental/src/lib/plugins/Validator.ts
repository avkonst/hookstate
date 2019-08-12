
import { Plugin, PluginTypeMarker, Path, StateLink, StateValueAtPath } from '../UseStateLink';

export enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}

export interface ValidationErrorMessage {
    readonly message: string;
    readonly severity: ValidationSeverity;
}

export interface ValidationRule extends ValidationErrorMessage {
    rule: (v: StateValueAtPath) => boolean
}

export interface ValidationError extends ValidationErrorMessage {
    readonly path: Path;
}

// export type ValidationResult =
//     string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;

// interface ValueProcessingHooksCallable<S, E extends {}> {
//     (currentValue: S, link: ReadonlyStateLink<S, E>): ValidationResult | undefined;
// }

// export type ValidateFunction<S, E extends {}> = (currentValue: S, link: ReadonlyStateLink<S, E>) => ValidationResult | undefined;

// export interface ValueProcessingHooks<S, E extends {}> {
//     readonly __validate?: ValidateFunction<S, E>
// }

// export function Validate<S, E extends {}, T extends (S extends (infer U)[] ? {
//     readonly [K in number]?: InferredProcessingHooks<U, E>;
// } : S extends (number | string | boolean | null | undefined | symbol) ? never : {
//     readonly [K in (keyof S)]?: InferredProcessingHooks<S[K], E>;
// })>(validate: ValidateFunction<S, E>, arg?: T) {
//     return new ValueProcessingHooksClass(validate, arg)
// }

// export class ValueProcessingHooksClass<S, E extends {}, T> {
//     constructor(validate: ValidateFunction<S, E>, arg: T) {
//         // super('...args', 'return this.__call__(...args)');
//         // return this.bind(this);
//     }

//     // Example `__call__` met hod.
//     // __call__(a: number, b: number, c: number) {
//     //     return [a, b, c];
//     // }
// }

// // (new ValueProcessingHooksClass())(1, 2, 3)

// // export type ValueProcessingHooks<S, E extends {}> = ValueProcessingHooksOld<S, E> | (ValueProcessingHooksOld<S, E> & ValueProcessingHooksCallable<S, E>);

// // export function Validate<S, E extends {}, N>(
// //     validator: (currentValue: S, link: ReadonlyStateLink<S, E>) => ValidationResult | undefined,
// //     nested: N
// // )

// // export type ValidateInterface<S, E extends {}, N> =
// //     (validator: (currentValue: S, link: ReadonlyStateLink<S, E>) => ValidationResult | undefined, nested: N) => InferredProcessingHooks<S, E extends {}>

// // export type ValueProcessingHooks<S, E extends {}> = (currentValue: S, link: ReadonlyStateLink<S, E>) => ValidationResult | undefined;

// export type ObjectProcessingHook<S, E extends {}> = {
//     readonly [K in keyof S]?: InferredProcessingHooks<S[K], E>;
// } | ValueProcessingHooksClass<S, E, {
//     readonly [K in keyof S]?: InferredProcessingHooks<S[K], E>;
// }>;

// export type ArrayProcessingHooks<U, E extends {}> = {
//     readonly [K in number | '*']?: InferredProcessingHooks<U, E>;
// } | ValueProcessingHooksClass<U[], E, {
//     readonly [K in number | '*']?: InferredProcessingHooks<U, E>;
// }>;

// export type ReadonlyArrayProcessingHooks<U, E extends {}> = {
//     readonly [K in number | '*']?: InferredProcessingHooks<U, E>;
// } | ValueProcessingHooksClass<ReadonlyArray<U>, E, {
//     readonly [K in number | '*']?: InferredProcessingHooks<U, E>;
// }>;

// export type InferredProcessingHooks<S, E extends {}> =
//     // TODO add other types like Map, Set
//     S extends (infer Y)[] ? ArrayProcessingHooks<Y, E> :
//     S extends ReadonlyArray<(infer U)> ? ReadonlyArrayProcessingHooks<U, E> :
//     // TODO add other types like RegExp, Date, etc.
//     S extends number | string | boolean | null | undefined | symbol ? ValueProcessingHooksClass<S, E, {}> :
//     ObjectProcessingHook<S, E>;

export interface ValidationExtensions {
    // validate(rule: (target: S, targetLink: StateLink<S, E>) => boolean, message: string): void,
    readonly valid: boolean,
    readonly invalid: boolean,
    readonly errors: ReadonlyArray<ValidationError>,
    readonly firstError: (condition?: (e: ValidationError) => boolean) => ValidationError | undefined,
    readonly firstPartial: (condition?: (e: ValidationError) => boolean) => Partial<ValidationError>,
}

const PluginID = Symbol('Validate');

// tslint:disable-next-line: function-name
export function Validation<S, E extends {}>(
    attachRule: (value: S) => boolean,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR
): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>) {

    // const defaultProcessingHooks: ValueProcessingHooks<any, {}> = { };
    // const hooksStore = defaultProcessingHooks

    return () => {
        const storeRules = {};
        function getRules(path: Path): Map<string, ValidationRule> | undefined {
            let result = storeRules;
            path.forEach(p => {
                result = result && result[p];
            });
            return result && result[PluginID];
        }
        function addRule(path: Path, r: ValidationRule) {
            let result = storeRules;
            path.forEach((p, i) => {
                result[p] = result[p] || {}
                result = result[p]
            });
            const existingRules: Map<string, ValidationRule> | undefined = result[PluginID];
            const newRuleFunction = r.rule.toString();
            if (existingRules) {
                if (existingRules.has(newRuleFunction)) {
                    return;
                }
                existingRules.set(newRuleFunction, r);
                return;
            }
            const newMap: Map<string, ValidationRule> = new Map();
            newMap.set(newRuleFunction, r);
            result[PluginID] = newMap;
        }

        return {
            id: PluginID,
            instanceFactory: () => {
                // function validate(
                //     l: StateLink<any>,
                //     validator: ((val: S, link: ReadonlyStateLink<any>) => ValidationResult | undefined) | undefined
                // ): ValidationError[] | undefined {
                //     if (validator) {
                //         const errors = validator(l.value, l);
                //         if (errors !== undefined) {
                //             if (Array.isArray(errors)) {
                //                 return (errors as ReadonlyArray<string | ValidationErrorMessage>).map(m =>
                //                     typeof m === 'string' ? {
                //                         path: l.path,
                //                         message: m,
                //                         severity: ValidationSeverity.ERROR
                //                     } : {
                //                         path: l.path,
                //                         message: m.message,
                //                         severity: m.severity
                //                     }
                //                 );
                //             } else if (typeof errors === 'string') {
                //                 return [{
                //                     path: l.path,
                //                     message: errors,
                //                     severity: ValidationSeverity.ERROR
                //                 }];
                //             } else {
                //                 return [{
                //                     path: l.path,
                //                     message: (errors as ValidationErrorMessage).message,
                //                     severity: (errors as ValidationErrorMessage).severity
                //                 }];
                //             }
                //         }
                //     }
                //     return undefined;
                // }

                // function getHooks(path: Path): ValueProcessingHooks<any, {}> {
                //     let result = hooksStore as ValueProcessingHooks<any, {}>;
                //     for (const p of path) {
                //         if (!result) {
                //             return defaultProcessingHooks;
                //         }
                //         result = result[p] || (typeof p === 'number' && result['*']);
                //     }
                //     return result || defaultProcessingHooks;
                // }

                // function addHook(path: Path, hook: (currentValue: S, link: StateLink<S, E>) => ValidationResult | undefined) {
                //     let result = hooksStore;
                //     if (path.length === 0) {
                //         result[PluginID] = hook
                //     }
                //     path.forEach((p, i) => {
                //         result[p] = result[p] || {}
                //         result = result[p]
                //         if (i === path.length - 1) {
                //             result[PluginID] = hook;
                //         }
                //     });
                // }

                function getErrors(l: StateLink<StateValueAtPath>): ReadonlyArray<ValidationError> {
                    const existingRulesMap = getRules(l.path);
                    if (existingRulesMap) {
                        const existingRules = Array.from(existingRulesMap.values())
                        const result: ValidationError[] = [];
                        existingRules.forEach(r => {
                            if (!r.rule(l.value)) {
                                result.push({
                                    path: l.path,
                                    message: r.message,
                                    severity: r.severity
                                })
                            }
                        })
                        return result;
                    }

                    // let result: ValidationError[] = validate(l, localHooks.__validate) || [];
                    // const nestedHooks = Object.keys(localHooks).filter(i => typeof localHooks[i] !== 'function');
                    // if (nestedHooks.length > 0 && l.nested) {
                    //     const nestedInst = l.nested;
                    //     if (Array.isArray(nestedInst)) {
                    //         if (localHooks['*']) {
                    //             nestedInst.forEach((n, i) => {
                    //                 result = result.concat(n.errors as ValidationError[]);
                    //             });
                    //         }
                    //         nestedHooks
                    //             // Validation rule exists,
                    //             // but the corresponding nested link may not be created,
                    //             // (because it may not be inferred automatically)
                    //             // because the original array value cas miss the corresponding index
                    //             // The design choice is to skip validation in this case.
                    //             // A client can define per array level validation rule,
                    //             // where existance of the index can be cheched.
                    //             .filter(k => typeof k === 'number' && nestedInst[k] !== undefined)
                    //             .forEach(k => {
                    //                 result = result.concat(nestedInst[k].errors as ValidationError[]);
                    //             });
                    //     } else if (nestedInst) {
                    //         nestedHooks
                    //             // Validation rule exists,
                    //             // but the corresponding nested link may not be created,
                    //             // (because it may not be inferred automatically)
                    //             // because the original object value can miss the corresponding key
                    //             // The design choice is to skip validation in this case.
                    //             // A client can define per object level validation rule,
                    //             // where existance of the property can be cheched.
                    //             .filter(k => nestedInst[k] !== undefined)
                    //             .forEach(k => {
                    //                 result = result.concat(nestedInst[k].errors as ValidationError[]);
                    //             });
                    //     }
                    // }
                    return [];
                }
                return {
                    get config(): ValidationRule {
                        return { rule: attachRule, message: message, severity: severity }
                    },
                    onAttach: (path, plugin) => {
                        const r = (plugin as unknown as { config: ValidationRule }).config;
                        addRule(path, r);
                    },
                    extensions: ['valid', 'invalid', 'errors', 'firstError', 'firstPartial'],
                    extensionsFactory: (l) => ({
                        get valid(): boolean {
                            return getErrors(l).length === 0
                        },
                        get invalid(): boolean {
                            return getErrors(l).length !== 0
                        },
                        get errors(): ReadonlyArray<ValidationError> {
                            return getErrors(l);
                        },
                        firstError: (condition?: (e: ValidationError) => boolean) => {
                            return getErrors(l).find((e:any) => condition ? condition(e) : true);
                        },
                        firstPartial: (condition?: (e: ValidationError) => boolean) => {
                            const r = getErrors(l).find((e:any) => condition ? condition(e) : true);
                            if (r === undefined) {
                                return {};
                            }
                            return r;
                        },
                    })
                }
            }
        }
    }
}

// interface PathMarker<S, E> {
//     // path: Path
// }

// export type NonUndefined<A> = A extends undefined ? never : A;

// export type DeepRequired<T> =
//     T extends (...args: any[]) => any
//         ? PathMarker<T, {}>
//         : T extends ReadonlyArray<any>
//             ? DeepRequiredArray<T[number]>
//             : T extends object
//                 ? DeepRequiredObject<T>
//                 : PathMarker<T, {}>;

// export interface DeepRequiredArray<T>
//     extends ReadonlyArray<DeepRequired<NonUndefined<T>>>, PathMarker<T, {}> { }

// export type DeepRequiredObject<T> = {
//     [P in keyof T]-?: DeepRequired<NonUndefined<T[P]>>
// } & PathMarker<T, {}>;

// interface TaskItem {
//     name?: string,
//     priority?: number
//     data?: {
//         a?: string[]
//     }
// }

// // const Each = Infinity
// // const a: DeepRequired<TaskItem[]> | undefined = undefined;
// // const b = a![0].data

// // interface ValidationTarget

// // function ValidationTarget<S, R>(s: (_: DeepRequired<S>) => R): R {
// //     return null as unknown as R;
// // }

// // f<TaskItem[], {}, >(t => t[0].data, l => l)

// function Lookup<S, R>(chooser: (s: DeepRequired<S>) => PathMarker<R, {}>): PathMarker<R, {}> {
//     throw ''
// }

// // function ValidatorF<R>(v: (l: ))

// const a = Lookup<TaskItem[]>(s => s[0].data)

// interface Callable<S, E extends {}> {
//     (v: S/*, l: StateLink<S, E> */): boolean

//     data: string;
// }

// const a: Callable<TaskItem[], {}> | undefined = undefined;
// a!(null as unknown as TaskItem[])
// // a!.data
