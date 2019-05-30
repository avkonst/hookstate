import React from 'react';
import { ObjectStateMutation } from './UseStateObject';
import { ArrayStateMutation } from './UseStateArray';
export declare enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}
export interface ArrayExtensions<U> {
    first(condition?: (e: U) => boolean): U | undefined;
    firstPartial(condition?: (e: U) => boolean): Partial<U>;
}
export declare type Path = ReadonlyArray<string | number>;
export interface ValidationErrorMessage {
    readonly message: string;
    readonly severity: ValidationSeverity;
}
export interface ValidationError extends ValidationErrorMessage {
    readonly path: Path;
}
export declare type NestedInferredLink<S> = S extends (infer Y)[] ? NestedArrayLink<Y> : S extends ReadonlyArray<(infer U)> ? undefined : S extends null ? undefined : S extends object ? NestedObjectLink<S> : undefined;
export declare type NestedArrayLink<U> = ReadonlyArray<ValueLink<U>> & {
    at(k: number): ValueLink<U>;
};
export declare type NestedObjectLink<S extends object> = {
    readonly [K in keyof S]: ValueLink<S[K]>;
} & {
    at<K extends keyof S>(k: K): ValueLink<S[K]>;
};
export declare type InferredLink<S> = S extends (infer Y)[] ? ArrayLink<Y> : S extends ReadonlyArray<(infer U)> ? undefined : S extends null ? undefined : S extends object ? ObjectLink<S> : undefined;
export interface ReadonlyValueLink<S> {
    readonly path: Path;
    readonly initialValue: S | undefined;
    readonly value: S;
    readonly modified: boolean;
    readonly unmodified: boolean;
    readonly valid: boolean;
    readonly invalid: boolean;
    readonly errors: ReadonlyArray<ValidationError> & ArrayExtensions<ValidationError>;
}
export interface ValueLink<S> extends ReadonlyValueLink<S> {
    readonly nested: NestedInferredLink<S>;
    readonly inferred: InferredLink<S>;
    set(newValue: React.SetStateAction<S>): void;
}
export interface ArrayLink<U> extends ValueLink<U[]>, ArrayStateMutation<U> {
}
export interface ObjectLink<S extends object> extends ValueLink<S>, ObjectStateMutation<S> {
}
export interface StateLink<S> {
    Observer: (props: React.PropsWithChildren<{}>) => JSX.Element;
}
export declare type ValidationResult = string | ValidationErrorMessage | ReadonlyArray<string | ValidationErrorMessage>;
export interface ValueProcessingHooks<S> {
    readonly __validate?: (currentValue: S, link: ReadonlyValueLink<S>) => ValidationResult | undefined;
    readonly __preset?: (newValue: S, link: ReadonlyValueLink<S>) => S;
    readonly __compare?: (newValue: S, oldValue: S | undefined, link: ReadonlyValueLink<S>) => boolean | undefined;
}
export declare type ObjectProcessingHook<S> = {
    readonly [K in keyof S]?: InferredProcessingHooks<S[K]>;
} & ValueProcessingHooks<S>;
export declare type ArrayProcessingHooks<U> = {
    readonly [K in number | '*']?: InferredProcessingHooks<U>;
} & ValueProcessingHooks<ReadonlyArray<U>>;
export declare type InferredProcessingHooks<S> = S extends ReadonlyArray<(infer U)> ? ArrayProcessingHooks<U> : S extends (infer Y)[] ? ArrayProcessingHooks<Y> : S extends number | string | boolean | null | undefined | symbol ? ValueProcessingHooks<S> : ObjectProcessingHook<S>;
export interface Settings<S> {
    readonly skipSettingEqual?: boolean;
    readonly globalHooks?: ValueProcessingHooks<any>;
    readonly targetHooks?: InferredProcessingHooks<S>;
}
export declare function createStateLink<S>(initial: S | (() => S), settings?: Settings<S>): StateLink<S>;
export declare function useStateLink<S>(initialState: S | (() => S) | ValueLink<S> | StateLink<S>, settings?: Settings<S>): ValueLink<S>;
export default useStateLink;
