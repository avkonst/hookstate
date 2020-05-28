import { Plugin, Path, State } from '@hookstate/core';
export declare type ValidationSeverity = 'error' | 'warning';
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
export declare function Validation<S>($this: State<S>): ValidationExtensions<S>;
