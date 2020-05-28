
import { Plugin, Path, StateValueAtPath, State, self } from '@hookstate/core';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationError {
    readonly message: string;
    readonly path: Path;
    readonly severity: ValidationSeverity;
}

export interface ValidationExtensions<S> {
    validate(attachRule: (value: S) => boolean,
        message: string | ((value: S) => string),
        severity?: ValidationSeverity): void,
    validShallow(): boolean,
    valid(): boolean,
    invalidShallow(): boolean,
    invalid(): boolean,
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

interface ValidationRule {
    readonly message: string | ((value: StateValueAtPath) => string)
    readonly rule: (v: StateValueAtPath) => boolean
    readonly severity: ValidationSeverity;
}

class ValidationPluginInstance<S> {
    private storeRules = {};

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

    getErrors(l: State<StateValueAtPath>,
        depth: number,
        filter?: (e: ValidationError) => boolean,
        first?: boolean): ReadonlyArray<ValidationError> {

        let result: ValidationError[] = [];
        const consistentResult = () => result.length === 0 ? emptyErrors : result;

        if (depth === 0) {
            return consistentResult();
        }

        const [existingRules, nestedRulesKeys] = this.getRulesAndNested(l[self].path);
        for (let i = 0; i < existingRules.length; i += 1) {
            const r = existingRules[i];
            if (!r.rule(l[self].value)) {
                const err = {
                    path: l[self].path,
                    message: typeof r.message === 'function' ? r.message(l[self].value) : r.message,
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
        if (nestedInst[self].keys === undefined) {
            // console.log('getResults no nested inst', result)
            return consistentResult();
        }
        if (Array.isArray(nestedInst)) {
            if (nestedRulesKeys.includes('*')) {
                for (let i = 0; i < nestedInst.length; i += 1) {
                    const n = nestedInst[i];
                    result = result.concat(
                        Validation(n as State<StateValueAtPath>)
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
            //         result = result.concat((nestedInst[k] as State<StateValueAtPath, ValidationExtensions>)
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
                        Validation(nestedInst[k] as State<StateValueAtPath>)
                            .errors(filter, depth - 1, first));
                    if (first && result.length > 0) {
                        return result;
                    }
                }
            }
        }
        return consistentResult();
    }
}

// tslint:disable-next-line: function-name
export function Validation(): Plugin;
export function Validation<S>($this: State<S>): ValidationExtensions<S>;
export function Validation<S>($this?: State<S>): Plugin | ValidationExtensions<S> {
    if ($this) {
        let state = $this;

        const [plugin] = state[self].attach(PluginID);
        if (plugin instanceof Error) {
            throw plugin
        }
        const instance = plugin as ValidationPluginInstance<S>;

        const inst = instance;
        return {
            validate: (r, m, s) => {
                inst.addRule(state[self].path, {
                    rule: r,
                    message: m,
                    severity: s || 'error'
                })
            },
            validShallow(): boolean {
                return inst.getErrors(state, 1, undefined, true).length === 0
            },
            valid(): boolean {
                return inst.getErrors(state, Number.MAX_SAFE_INTEGER, undefined, true).length === 0
            },
            invalidShallow(): boolean {
                return inst.getErrors(state, 1, undefined, true).length !== 0
            },
            invalid(): boolean {
                return inst.getErrors(state, Number.MAX_SAFE_INTEGER, undefined, true).length !== 0
            },
            errors: (filter, depth, first) => {
                return inst.getErrors(state, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, first);
            },
            firstError: (filter, depth) => {
                const r = inst.getErrors(state, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, true);
                if (r.length === 0) {
                    return {};
                }
                return r[0];
            },
        }
    }
    return {
        id: PluginID,
        init: () => new ValidationPluginInstance() as {}
    }
}
