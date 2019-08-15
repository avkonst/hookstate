import { Plugin, PluginTypeMarker, Path, StateValueAtPath } from '@hookstate/core';
export declare enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}
export interface ValidationRule {
    readonly message: string | ((value: StateValueAtPath) => string);
    readonly rule: (v: StateValueAtPath) => boolean;
    readonly severity: ValidationSeverity;
}
export interface ValidationError {
    readonly message: string;
    readonly path: Path;
    readonly severity: ValidationSeverity;
}
export interface ValidationExtensions {
    readonly validShallow: boolean;
    readonly valid: boolean;
    readonly invalidShallow: boolean;
    readonly invalid: boolean;
    firstError(filter?: (e: ValidationError) => boolean, depth?: number): Partial<ValidationError>;
    errors(filter?: (e: ValidationError) => boolean, depth?: number, first?: boolean): ReadonlyArray<ValidationError>;
}
export declare function Validation<S, E extends {}>(): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>);
export declare function Validation<S, E extends {}>(attachRule: (value: S) => boolean, message: string | ((value: S) => string)): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>);
export declare function Validation<S, E extends {}>(attachRule: (value: S) => boolean, message: string | ((value: S) => string), severity: ValidationSeverity): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>);
