import React from 'react';

// export enum ValidationSeverity {
//     WARNING = 1,
//     ERROR = 2
// }

// export interface ArrayExtensions<U> {
//     first(condition?: (e: U) => boolean): U | undefined;
//     firstPartial(condition?: (e: U) => boolean): Partial<U>;
// }

// export interface ValidationErrorMessage {
//     readonly message: string;
//     readonly severity: ValidationSeverity;
// }

// export interface ValidationError extends ValidationErrorMessage {
//     readonly path: Path;
// }


// readonly initialValue: S | undefined;
// readonly modified: boolean;
// readonly unmodified: boolean;

// readonly valid: boolean;
// readonly invalid: boolean;
// readonly errors: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;

// export type ValidationResult =
//     string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;

// export interface GlobalValueProcessingHooks<S, P extends {}> {
//     readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined;
//     readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S, P>) => boolean | undefined;
// }

// export interface ValueProcessingHooks<S, P extends {}> {
//     readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined;
//     readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S, P>) => boolean | undefined;
// }

// export type ObjectProcessingHook<S, P extends {}> = {
//     readonly [K in keyof S]?: InferredProcessingHooks<S[K], P>;
// } & ValueProcessingHooks<S, P>;

// export type ArrayProcessingHooks<U, P extends {}> = {
//     readonly [K in number | '*']?: InferredProcessingHooks<U, P>;
// } & ValueProcessingHooks<ReadonlyArray<U>, P>;

// export type InferredProcessingHooks<S, P extends {}> =
//     S extends ReadonlyArray<(infer U)> ? ArrayProcessingHooks<U, P> :
//     S extends (infer Y)[] ? ArrayProcessingHooks<Y, P> :
//     S extends number | string | boolean | null | undefined | symbol ? ValueProcessingHooks<S, P> :
//     ObjectProcessingHook<S, P>;

// export interface Settings<S> {
//     // default is false
//     readonly cloneInitial?: boolean;
//     // default is false
//     readonly skipSettingEqual?: boolean;
//     // tslint:disable-next-line:no-any
//     // readonly globalHooks?: GlobalValueProcessingHooks<any>;
//     // readonly targetHooks?: InferredProcessingHooks<S>;
// }

// function defaultEqualityOperator<S>(a: S, b: S | undefined) {
//     if (typeof b === 'object') {
//         // check reference equality first for speed
//         if (a === b) {
//             return true;
//         }
//         return JSON.stringify(a) === JSON.stringify(b);
//     }
//     return a === b;
// }

// // tslint:disable-next-line:no-any
// const defaultProcessingHooks: ValueProcessingHooks<any, {}> = {};

// function extractValue<S>(prevValue: S, newValue: S | ((prevValue: S) => S)): S {
//     if (typeof newValue === 'function') {
//         return (newValue as ((prevValue: S) => S))(prevValue);
//     }
//     return newValue;
// }

// tslint:disable-next-line:no-any
// targetHooks(path: Path): ValueProcessingHooks<any, {}> {
//     let result = this._settings.targetHooks;
//     for (const p of path) {
//         if (!result) {
//             return defaultProcessingHooks;
//         }
//         result = result[p] || (typeof p === 'number' && result['*']);
//     }
//     return result || defaultProcessingHooks;
// }

// private areValuesEqual(newValue: S, oldValue: S | undefined): boolean {
//     const localCompare = this.hooks.__compare;
//     if (localCompare) {
//         const localCompareResult = localCompare(newValue, oldValue, this);
//         if (localCompareResult !== undefined) {
//             return localCompareResult;
//         }
//     }
//     const globalCompare = this.state.globalHooks().__compare;
//     if (globalCompare) {
//         const globalCompareResult = globalCompare(newValue, oldValue, this);
//         if (globalCompareResult !== undefined) {
//             return globalCompareResult;
//         }
//     }
//     return defaultEqualityOperator(newValue, oldValue);
// }

// get modified(): boolean {
//     throw 'Functionality disabled';
//     // if (this.modifiedCacheEdition < this.state.edition) {
//     //     this.modifiedCacheEdition = this.state.edition;
//     //     this.modifiedCache = !this.areValuesEqual(this.value, this.initialValue);
//     // }
//     // return this.modifiedCache;
// }

// get unmodified(): boolean {
//     return !this.modified;
// }

// get valid(): boolean {
//     return this.errors.length === 0;
// }

// get invalid(): boolean {
//     return !this.valid;
// }

// private validate(validator: ((val: S, link: ReadonlyValueLink<S, P>) => ValidationResult | undefined) | undefined):
//     ValidationError[] | undefined {
//     throw 'Functionality disabled';
//     // if (validator) {
//     //     const errors = validator(this.value, this);
//     //     if (errors !== undefined) {
//     //         if (Array.isArray(errors)) {
//     //             return (errors as ReadonlyArray<string | ValidationErrorMessage>).map(m =>
//     //                 typeof m === 'string' ? {
//     //                     path: this.path,
//     //                     message: m,
//     //                     severity: ValidationSeverity.ERROR
//     //                 } : {
//     //                     path: this.path,
//     //                     message: m.message,
//     //                     severity: m.severity
//     //                 }
//     //             );
//     //         } else if (typeof errors === 'string') {
//     //             return [{
//     //                 path: this.path,
//     //                 message: errors,
//     //                 severity: ValidationSeverity.ERROR
//     //             }];
//     //         } else {
//     //             return [{
//     //                 path: this.path,
//     //                 message: (errors as ValidationErrorMessage).message,
//     //                 severity: (errors as ValidationErrorMessage).severity
//     //             }];
//     //         }
//     //     }
//     // }
//     // return undefined;
// }

// get errors(): ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError> {
//     throw 'Functionality disabled';
//     // if (this.errorsCacheEdition < this.state.edition) {
//     //     this.errorsCacheEdition = this.state.edition;

//     //     const localHooks = this.hooks;
//     //     let result: ValidationError[] =
//     //         this.validate(localHooks.__validate) ||
//     //         this.validate(this.state.globalHooks().__validate) ||
//     //         [];
//     //     const nestedHooks = Object.keys(localHooks).filter(i => typeof localHooks[i] !== 'function');
//     //     if (nestedHooks.length > 0 && this.nested) {
//     //         const nestedInst = this.nested;
//     //         if (Array.isArray(nestedInst)) {
//     //             if (localHooks['*']) {
//     //                 nestedInst.forEach((n, i) => {
//     //                     result = result.concat(n.errors as ValidationError[]);
//     //                 });
//     //             }
//     //             nestedHooks
//     //                 // Validation rule exists,
//     //                 // but the corresponding nested link may not be created,
//     //                 // (because it may not be inferred automatically)
//     //                 // because the original array value cas miss the corresponding index
//     //                 // The design choice is to skip validation in this case.
//     //                 // A client can define per array level validation rule,
//     //                 // where existance of the index can be cheched.
//     //                 .filter(k => typeof k === 'number' && nestedInst[k] !== undefined)
//     //                 .forEach(k => {
//     //                     result = result.concat(nestedInst[k].errors as ValidationError[]);
//     //                 });
//     //         } else if (nestedInst) {
//     //             nestedHooks
//     //                 // Validation rule exists,
//     //                 // but the corresponding nested link may not be created,
//     //                 // (because it may not be inferred automatically)
//     //                 // because the original object value can miss the corresponding key
//     //                 // The design choice is to skip validation in this case.
//     //                 // A client can define per object level validation rule,
//     //                 // where existance of the property can be cheched.
//     //                 .filter(k => nestedInst[k] !== undefined)
//     //                 .forEach(k => {
//     //                     result = result.concat(nestedInst[k].errors as ValidationError[]);
//     //                 });
//     //         }
//     //     }

//     //     const first = (condition?: (e: ValidationError) => boolean) => {
//     //         return result.find(e => condition ? condition(e) : true);
//     //     };
//     //     const firstPartial = (condition?: (e: ValidationError) => boolean) => {
//     //         const r = first(condition);
//     //         if (r === undefined) {
//     //             return {};
//     //         }
//     //         return r;
//     //     };
//     //     Object.assign(result, {
//     //         first: first,
//     //         firstPartial: firstPartial
//     //     });

//     //     this.errorsCache = result as unknown as ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
//     // }
//     // return this.errorsCache;
// }
