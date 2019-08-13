
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

export interface ValidationExtensions {
    // validate(rule: (target: S, targetLink: StateLink<S, E>) => boolean, message: string): void,
    readonly validShallow: boolean,
    readonly valid: boolean,
    readonly invalidShallow: boolean,
    readonly invalid: boolean,
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

// tslint:disable-next-line: function-name
export function ValidationForEach<S extends ReadonlyArray<StateValueAtPath>, E extends {}>(
    attachRule: (value: S[number]) => boolean,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR
): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>) {
    return validationImpl(attachRule, message, severity, true)
}

// tslint:disable-next-line: function-name
export function Validation<S, E extends {}>(
    attachRule: (value: S) => boolean,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR
): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>) {
    return validationImpl(attachRule, message, severity, false)
}

function validationImpl<S, E extends {}>(
    attachRule: (value: S) => boolean,
    message: string,
    severity: ValidationSeverity,
    foreach: boolean
): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>) {

    // const defaultProcessingHooks: ValueProcessingHooks<any, {}> = { };
    // const hooksStore = defaultProcessingHooks

    return () => {
        const storeRules = {};
        function getRulesAndNested(path: Path): [ValidationRule[], string[]] {
            let result = storeRules;
            path.forEach(p => {
                result = result && (result[p] || (typeof p === 'number' && result['*']));
                // if (result) {
                //     if (typeof p === 'number' && result['*']) {
                //         if (result[p]) {
                //             result = { ...result['*'], ...result[p] }
                //         } else {
                //             result = result['*']
                //         }
                //     } else {
                //         result = result && result[p]
                //     }
                // }
            });
            return [result && result[PluginID] ? Array.from(result[PluginID].values()) : [],
                result ? Object.keys(result) : []];
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

        function getErrors(l: StateLink<StateValueAtPath>,
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
                if (!r.rule(l.value)) {
                    const err = {
                        path: l.path,
                        message: r.message,
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
                        result = result.concat((n as StateLink<StateValueAtPath, ValidationExtensions>)
                            .extended.errors(filter, depth - 1, first));
                        if (first && result.length > 0) {
                            return result;
                        }
                    }
                }
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
                        result = result.concat((nestedInst[k] as StateLink<StateValueAtPath, ValidationExtensions>)
                            .extended.errors(filter, depth - 1, first));
                        if (first && result.length > 0) {
                            return result;
                        }
                    }
                }
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
                        result = result.concat((nestedInst[k] as StateLink<StateValueAtPath, ValidationExtensions>)
                            .extended.errors(filter, depth - 1, first));
                        if (first && result.length > 0) {
                            return result;
                        }
                    }
                }
            }
            return consistentResult();
        }

        return {
            id: PluginID,
            instanceFactory: () => ({
                get config(): ValidationRule & { foreach: boolean } {
                    return { rule: attachRule, message: message, severity: severity, foreach: foreach }
                },
                onAttach: (path, plugin) => {
                    const r = (plugin as unknown as { config: ValidationRule & { foreach: boolean } }).config;
                    addRule(r.foreach ? path.concat('*') : path, r);
                },
                extensions: ['valid', 'invalid', 'errors', 'firstError'],
                extensionsFactory: (l) => ({
                    get validShallow(): boolean {
                        return getErrors(l, 1).length === 0
                    },
                    get valid(): boolean {
                        return getErrors(l, Number.MAX_SAFE_INTEGER).length === 0
                    },
                    get invalidShallow(): boolean {
                        return getErrors(l, 1).length !== 0
                    },
                    get invalid(): boolean {
                        return getErrors(l, Number.MAX_SAFE_INTEGER).length !== 0
                    },
                    errors(filter?: (e: ValidationError) => boolean,
                        depth?: number,
                        first?: boolean): ReadonlyArray<ValidationError> {
                        return getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, first);
                    },
                    firstError(filter?: (e: ValidationError) => boolean, depth?: number) {
                        const r = getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, true);
                        if (r.length === 0) {
                            return {};
                        }
                        return r;
                    },
                })
            })
        }
    }
}
