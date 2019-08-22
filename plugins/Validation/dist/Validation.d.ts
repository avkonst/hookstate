import { Plugin, Path, StateLink, StateValueAtPath } from '@hookstate/core';
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
export interface ValidationExtensions<S> {
    validate(attachRule: (value: S) => boolean, message: string | ((value: S) => string), severity?: ValidationSeverity): void;
    validShallow(): boolean;
    valid(): boolean;
    invalidShallow(): boolean;
    invalid(): boolean;
    firstError(filter?: (e: ValidationError) => boolean, depth?: number): Partial<ValidationError>;
    errors(filter?: (e: ValidationError) => boolean, depth?: number, first?: boolean): ReadonlyArray<ValidationError>;
}
export declare function Validation(): Plugin;
export declare function Validation<S>(self: StateLink<S>): ValidationExtensions<S>;
