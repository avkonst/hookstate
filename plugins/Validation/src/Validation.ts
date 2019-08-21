
import { Plugin, Path, StateLink, StateValueAtPath, PluginInstance } from '@hookstate/core';

export enum ValidationSeverity {
    WARNING = 1,
    ERROR = 2
}

export interface ValidationRule {
    readonly message: string | ((value: StateValueAtPath) => string)
    readonly rule: (v: StateValueAtPath) => boolean
    readonly severity: ValidationSeverity;
}

export interface ValidationError {
    readonly message: string;
    readonly path: Path;
    readonly severity: ValidationSeverity;
}

export interface ValidationExtensions {
    readonly validShallow: () => boolean,
    readonly valid: () => boolean,
    readonly invalidShallow: () => boolean,
    readonly invalid: () => boolean,
    firstError(
        filter?: (e: ValidationError) => boolean,
        depth?: number
    ): Partial<ValidationError>,
    errors(
        filter?: (e: ValidationError) => boolean,
        depth?: number,
        first?: boolean
    ): ReadonlyArray<ValidationError>,
}

const PluginID = Symbol('Validate');

const emptyErrors: ValidationError[] = []

class ValidationPluginInstance<S> implements PluginInstance {
    private storeRules = {};

    constructor(
        private readonly attachRule?: (value: S) => boolean,
        private readonly message?: string | ((value: S) => string),
        private readonly severity?: ValidationSeverity) { }

    getRulesAndNested(path: Path): [ValidationRule[], string[]] {
        let result = this.storeRules;
        path.forEach(p => {
            if (typeof p === 'number') {
                p = '*' // limitation: support only validation for each element of array
            }
            result = result && (result[p])
        });
        return [result && result[PluginID] ? Array.from(result[PluginID].values()) : [],
            result ? Object.keys(result) : []];
    }
    addRule(path: Path, r: ValidationRule) {
        let result = this.storeRules;
        path.forEach((p, i) => {
            if (typeof p === 'number') {
                p = '*' // limitation: support only validation for each element of array
            }
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

    getErrors(l: StateLink<StateValueAtPath>,
        depth: number,
        filter?: (e: ValidationError) => boolean,
        first?: boolean): ReadonlyArray<ValidationError> {

        let result: ValidationError[] = [];
        const consistentResult = () => result.length === 0 ? emptyErrors : result;

        if (depth === 0) {
            return consistentResult();
        }

        const [existingRules, nestedRulesKeys] = this.getRulesAndNested(l.path);
        for (let i = 0; i < existingRules.length; i += 1) {
            const r = existingRules[i];
            if (!r.rule(l.value)) {
                const err = {
                    path: l.path,
                    message: typeof r.message === 'function' ? r.message(l.value) : r.message,
                    severity: r.severity
                };
                if (!filter || filter(err)) {
                    result.push(err)
                    if (first) {
                        return result;
                    }
                }
            }
        }
        if (depth === 1) {
            return consistentResult();
        }
        if (nestedRulesKeys.length === 0) {
            // console.log('getResults nested rules 0 length', result)
            return consistentResult();
        }
        const nestedInst = l.nested;
        if (nestedInst === undefined) {
            // console.log('getResults no nested inst', result)
            return consistentResult();
        }
        if (Array.isArray(nestedInst)) {
            if (nestedRulesKeys.includes('*')) {
                for (let i = 0; i < nestedInst.length; i += 1) {
                    const n = nestedInst[i];
                    result = result.concat(
                        Validation(n as StateLink<StateValueAtPath>)
                            .errors(filter, depth - 1, first));
                    if (first && result.length > 0) {
                        return result;
                    }
                }
            }
            // validation for individual array elements is not supported, it is covered by foreach above
            // for (let i = 0; i < nestedRulesKeys.length; i += 1) {
            //     const k = nestedRulesKeys[i];
            //     // Validation rule exists,
            //     // but the corresponding nested link may not be created,
            //     // (because it may not be inferred automatically)
            //     // because the original array value cas miss the corresponding index
            //     // The design choice is to skip validation in this case.
            //     // A client can define per array level validation rule,
            //     // where existance of the index can be cheched.
            //     if (nestedInst[k] !== undefined) {
            //         result = result.concat((nestedInst[k] as StateLink<StateValueAtPath, ValidationExtensions>)
            //             .extended.errors(filter, depth - 1, first));
            //         if (first && result.length > 0) {
            //             return result;
            //         }
            //     }
            // }
        } else {
            for (let i = 0; i < nestedRulesKeys.length; i += 1) {
                const k = nestedRulesKeys[i];
                // Validation rule exists,
                // but the corresponding nested link may not be created,
                // (because it may not be inferred automatically)
                // because the original array value cas miss the corresponding index
                // The design choice is to skip validation in this case.
                // A client can define per array level validation rule,
                // where existance of the index can be cheched.
                if (nestedInst[k] !== undefined) {
                    result = result.concat(
                        Validation(nestedInst[k] as StateLink<StateValueAtPath>)
                            .errors(filter, depth - 1, first));
                    if (first && result.length > 0) {
                        return result;
                    }
                }
            }
        }
        return consistentResult();
    }

    get config(): ValidationRule | undefined {
        if (this.attachRule !== undefined && this.message !== undefined) {
            return {
                rule: this.attachRule,
                message: this.message,
                severity: this.severity || ValidationSeverity.ERROR
            }
        }
        return undefined;
    }

    onAttach(path: Path, withArgument: PluginInstance) {
        const config = (withArgument as ValidationPluginInstance<StateValueAtPath>).config;
        if (config) {
            this.addRule(path, config);
        }
    }
}

// tslint:disable-next-line: function-name
export function Validation(): (() => Plugin);
export function Validation<S>(
    attachRule: (value: S) => boolean,
    message: string | ((value: S) => string)
): (() => Plugin);
export function Validation<S>(
    attachRule: (value: S) => boolean,
    message: string | ((value: S) => string),
    severity: ValidationSeverity
): (() => Plugin);
export function Validation<S>(
    self: StateLink<S>
): ValidationExtensions;
export function Validation<S>(
    attachRuleOrSelf?: ((value: S) => boolean) | StateLink<S>,
    message?: string | ((value: S) => string),
    severity?: ValidationSeverity
): (() => Plugin) | ValidationExtensions {
    if (attachRuleOrSelf && typeof attachRuleOrSelf !== 'function') {
        const self = attachRuleOrSelf as StateLink<S>;
        const [l, instance] = self.with(PluginID);
        const inst = instance as ValidationPluginInstance<S>;
        return {
            validShallow(): boolean {
                return inst.getErrors(l, 1, undefined, true).length === 0
            },
            valid(): boolean {
                return inst.getErrors(l, Number.MAX_SAFE_INTEGER, undefined, true).length === 0
            },
            invalidShallow(): boolean {
                return inst.getErrors(l, 1, undefined, true).length !== 0
            },
            invalid(): boolean {
                return inst.getErrors(l, Number.MAX_SAFE_INTEGER, undefined, true).length !== 0
            },
            errors(filter?: (e: ValidationError) => boolean,
                depth?: number,
                first?: boolean): ReadonlyArray<ValidationError> {
                return inst.getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, first);
            },
            firstError(filter?: (e: ValidationError) => boolean, depth?: number) {
                const r = inst.getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, true);
                if (r.length === 0) {
                    return {};
                }
                return r[0];
            },
        }
    }
    return () => {
        return {
            id: PluginID,
            instanceFactory: () => new ValidationPluginInstance(attachRuleOrSelf, message, severity)
        }
    }
}
