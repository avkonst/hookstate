
import { Path, StateValueAtPath, State, InferStateValueType, ExtensionFactory, StateExtensionUnknown } from '@hookstate/core';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationError {
    readonly message: string;
    readonly path: Path;
    readonly severity: ValidationSeverity;
}

export interface Validation {
    validate<S extends InferStateValueType<this>>(rule: (value: S) => boolean,
        message: string | ((value: S) => string),
        severity?: ValidationSeverity): void,

    valid(options?: { depth?: number }): boolean,
    invalid(options?: { depth?: number }): boolean,

    firstError(
        filter?: (e: ValidationError) => boolean,
        depth?: number
    ): ValidationError | undefined,
    errors(
        filter?: (e: ValidationError) => boolean,
        depth?: number,
        first?: boolean
    ): ReadonlyArray<ValidationError>,
}

export function validation<S, E>(): ExtensionFactory<S, E, Validation> {
    return () => ({
        onCreate: () => {
            const storeRules = {};

            const hidden = Symbol('hidden');
            const emptyErrors: ValidationError[] = []

            interface ValidationRule {
                readonly message: string | ((value: StateValueAtPath) => string)
                readonly rule: (v: StateValueAtPath, p: Path) => boolean
                readonly severity: ValidationSeverity;
            }

            function getRulesAndNested(path: Path): [ValidationRule[], string[]] {
                let result = storeRules;
                path.forEach(p => {
                    if (typeof p === 'number') {
                        p = '*' // limitation: support only validation for each element of array
                    }
                    result = result && (result[p])
                });
                return [result && result[hidden] ? Array.from(result[hidden].values()) : [],
                result ? Object.keys(result) : []];
            }
            function addRule(path: Path, r: ValidationRule) {
                let result = storeRules;
                path.forEach((p, i) => {
                    if (typeof p === 'number') {
                        p = '*' // limitation: support only validation for each element of array
                    }
                    result[p] = result[p] || {}
                    result = result[p]
                });
                const existingRules: Map<string, ValidationRule> | undefined = result[hidden];
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
                result[hidden] = newMap;
            }

            function getErrors(l: State<StateValueAtPath, StateExtensionUnknown>,
                depth: number,
                filter?: (e: ValidationError) => boolean,
                first?: boolean): ReadonlyArray<ValidationError> {

                let result: ValidationError[] = [];
                const consistentResult = () => result.length === 0 ? emptyErrors : result;

                if (depth === 0) {
                    return consistentResult();
                }

                const [existingRules, nestedRulesKeys] = getRulesAndNested(l.path);
                for (let i = 0; i < existingRules.length; i += 1) {
                    const r = existingRules[i];
                    if (!r.rule(l.value, l.path)) {
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
                const nestedInst = l;
                if (nestedInst.keys === undefined) {
                    // console.log('getResults no nested inst', result)
                    return consistentResult();
                }
                if (Array.isArray(nestedInst)) {
                    if (nestedRulesKeys.includes('*')) {
                        for (let i = 0; i < nestedInst.length; i += 1) {
                            const n = nestedInst[i];
                            result = result.concat(
                                (n as State<StateValueAtPath, Validation>).errors(filter, depth - 1, first));
                            if (first && result.length > 0) {
                                return result;
                            }
                        }
                    }
                    // validation for individual array elements is not supported, it is covered by foreach above
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
                                (nestedInst[k] as State<StateValueAtPath, Validation>).errors(filter, depth - 1, first));
                            if (first && result.length > 0) {
                                return result;
                            }
                        }
                    }
                }
                return consistentResult();
            }

            return {
                validate: (state) => (r, m, s) => addRule(state.path, {
                    rule: r,
                    message: m,
                    severity: s || 'error'
                }),
                valid: s => (options) => getErrors(s, options?.depth ?? Number.MAX_SAFE_INTEGER, undefined, true).length === 0,
                invalid: s => (options) => getErrors(s, options?.depth ?? Number.MAX_SAFE_INTEGER, undefined, true).length !== 0,
                firstError: s => (filter, depth) => getErrors(s, depth ?? Number.MAX_SAFE_INTEGER, filter, true)[0],
                errors: s => (filter, depth, first) => getErrors(s, depth ?? Number.MAX_SAFE_INTEGER, filter, first),
            }
        }
    })
}
