import { Plugin, PluginTypeMarker, Path, StateValueAtPath } from 'react-hookstate';
export declare enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}
export interface ValidationErrorMessage {
    readonly message: string;
    readonly severity: ValidationSeverity;
}
export interface ValidationRule extends ValidationErrorMessage {
    rule: (v: StateValueAtPath) => boolean;
}
export interface ValidationError extends ValidationErrorMessage {
    readonly path: Path;
}
export interface ValidationExtensions {
    readonly validShallow: boolean;
    readonly valid: boolean;
    readonly invalidShallow: boolean;
    readonly invalid: boolean;
    firstError(filter?: (e: ValidationError) => boolean, depth?: number): Partial<ValidationError>;
    errors(filter?: (e: ValidationError) => boolean, depth?: number, first?: boolean): ReadonlyArray<ValidationError>;
}
export declare function ValidationForEach<S extends ReadonlyArray<StateValueAtPath>, E extends {}>(attachRule: (value: S[number]) => boolean, message: string, severity?: ValidationSeverity): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>);
export declare function Validation<S, E extends {}>(attachRule: (value: S) => boolean, message: string, severity?: ValidationSeverity): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>);
