
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
    readonly valid: boolean,
    readonly invalid: boolean,
    readonly errors: ReadonlyArray<ValidationError>,
    readonly firstError: (condition?: (e: ValidationError) => boolean) => ValidationError | undefined,
    readonly firstPartial: (condition?: (e: ValidationError) => boolean) => Partial<ValidationError>,
}

const PluginID = Symbol('Validate');

const emptyErrors: ValidationError[] = []

// tslint:disable-next-line: function-name
export function Validation<S, E extends {}>(
    attachRule: (value: S) => boolean,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR
): ((unused: PluginTypeMarker<S, E>) => Plugin<E, ValidationExtensions>) {

    // const defaultProcessingHooks: ValueProcessingHooks<any, {}> = { };
    // const hooksStore = defaultProcessingHooks

    return () => {
        const storeRules = {};
        function getRules(path: Path): Map<string, ValidationRule> | undefined {
            let result = storeRules;
            path.forEach(p => {
                result = result && result[p];
            });
            return result && result[PluginID];
        }
        function getRulesRecursive(path: Path) {
            let result = storeRules;
            path.forEach(p => {
                result = result && result[p];
            });
            console.log('recursive rules', result)
            return result;
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

        return {
            id: PluginID,
            instanceFactory: () => {
                function getErrors(l: StateLink<StateValueAtPath>, recursive?: boolean): ReadonlyArray<ValidationError> {
                    console.warn('getResults', l.path)
                    let result: ValidationError[] = [];
                    const consistentResult = () => result.length === 0 ? emptyErrors : result;

                    const existingRulesMap = getRules(l.path);
                    if (existingRulesMap) {
                        const existingRules = Array.from(existingRulesMap.values())
                        existingRules.forEach(r => {
                            if (!r.rule(l.value)) {
                                result.push({
                                    path: l.path,
                                    message: r.message,
                                    severity: r.severity
                                })
                            }
                        })
                    }
                    if (!recursive) {
                        console.log('getResults not recursive', result)
                        return consistentResult();
                    }
                    const nestedRules = getRulesRecursive(l.path);
                    if (nestedRules === undefined) {
                        console.log('getResults no nested rules', result)
                        return consistentResult();
                    }

                    const nestedRulesKeys = Object.keys(nestedRules);
                    if (nestedRulesKeys.length === 0) {
                        console.log('getResults nested rules 0 length', result)
                        return consistentResult();
                    }
                    const nestedInst = l.nested;
                    if (nestedInst === undefined) {
                        console.log('getResults no nested inst', result)
                        return consistentResult();
                    }
                    if (Array.isArray(nestedInst)) {
                        if (nestedRules['*']) {
                            nestedInst.forEach((n, i) => {
                                result = result.concat((n as StateLink<StateValueAtPath, ValidationExtensions>).extended.errors);
                            });
                        }
                        nestedRulesKeys
                            // Validation rule exists,
                            // but the corresponding nested link may not be created,
                            // (because it may not be inferred automatically)
                            // because the original array value cas miss the corresponding index
                            // The design choice is to skip validation in this case.
                            // A client can define per array level validation rule,
                            // where existance of the index can be cheched.
                            .filter(k => nestedInst[k] !== undefined)
                            .forEach(k => {
                                result = result.concat((nestedInst[k]  as StateLink<StateValueAtPath, ValidationExtensions>).extended.errors);
                            });
                    } else {
                        nestedRulesKeys
                            // Validation rule exists,
                            // but the corresponding nested link may not be created,
                            // (because it may not be inferred automatically)
                            // because the original object value can miss the corresponding key
                            // The design choice is to skip validation in this case.
                            // A client can define per object level validation rule,
                            // where existance of the property can be cheched.
                            .filter(k => nestedInst[k] !== undefined)
                            .forEach(k => {
                                result = result.concat((nestedInst[k] as StateLink<StateValueAtPath, ValidationExtensions>).extended.errors);
                            });
                    }
                    console.log('getResults final', result)
                    return consistentResult();
                }
                return {
                    get config(): ValidationRule {
                        return { rule: attachRule, message: message, severity: severity }
                    },
                    onAttach: (path, plugin) => {
                        const r = (plugin as unknown as { config: ValidationRule }).config;
                        addRule(path, r);
                    },
                    extensions: ['valid', 'invalid', 'errors', 'firstError', 'firstPartial'],
                    extensionsFactory: (l) => ({
                        get valid(): boolean {
                            return getErrors(l, true).length === 0
                        },
                        get invalid(): boolean {
                            return getErrors(l).length !== 0
                        },
                        get errors(): ReadonlyArray<ValidationError> {
                            return getErrors(l, true);
                        },
                        firstError: (condition?: (e: ValidationError) => boolean) => {
                            return getErrors(l).find((e:any) => condition ? condition(e) : true);
                        },
                        firstPartial: (condition?: (e: ValidationError) => boolean) => {
                            const r = getErrors(l).find((e:any) => condition ? condition(e) : true);
                            if (r === undefined) {
                                return {}; // make consistent same instance
                            }
                            return r;
                        },
                    })
                }
            }
        }
    }
}
