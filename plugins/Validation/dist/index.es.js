var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity[ValidationSeverity["WARNING"] = 1] = "WARNING";
    ValidationSeverity[ValidationSeverity["ERROR"] = 2] = "ERROR";
})(ValidationSeverity || (ValidationSeverity = {}));
var PluginID = Symbol('Validate');
var emptyErrors = [];
function Validation(attachRule, message, severity) {
    return function () {
        var storeRules = {};
        function getRulesAndNested(path) {
            var result = storeRules;
            path.forEach(function (p) {
                if (typeof p === 'number') {
                    p = '*'; // limitation: support only validation for each element of array
                }
                result = result && (result[p]);
            });
            return [result && result[PluginID] ? Array.from(result[PluginID].values()) : [],
                result ? Object.keys(result) : []];
        }
        function addRule(path, r) {
            var result = storeRules;
            path.forEach(function (p, i) {
                if (typeof p === 'number') {
                    p = '*'; // limitation: support only validation for each element of array
                }
                result[p] = result[p] || {};
                result = result[p];
            });
            var existingRules = result[PluginID];
            var newRuleFunction = r.rule.toString();
            if (existingRules) {
                if (existingRules.has(newRuleFunction)) {
                    return;
                }
                existingRules.set(newRuleFunction, r);
                return;
            }
            var newMap = new Map();
            newMap.set(newRuleFunction, r);
            result[PluginID] = newMap;
        }
        function getErrors(l, depth, filter, first) {
            var result = [];
            var consistentResult = function () { return result.length === 0 ? emptyErrors : result; };
            if (depth === 0) {
                return consistentResult();
            }
            var _a = getRulesAndNested(l.path), existingRules = _a[0], nestedRulesKeys = _a[1];
            for (var i = 0; i < existingRules.length; i += 1) {
                var r = existingRules[i];
                if (!r.rule(l.value)) {
                    var err = {
                        path: l.path,
                        message: typeof r.message === 'function' ? r.message(l.value) : r.message,
                        severity: r.severity
                    };
                    if (!filter || filter(err)) {
                        result.push(err);
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
            var nestedInst = l.nested;
            if (nestedInst === undefined) {
                // console.log('getResults no nested inst', result)
                return consistentResult();
            }
            if (Array.isArray(nestedInst)) {
                if (nestedRulesKeys.includes('*')) {
                    for (var i = 0; i < nestedInst.length; i += 1) {
                        var n = nestedInst[i];
                        result = result.concat(n
                            .extended.errors(filter, depth - 1, first));
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
            }
            else {
                for (var i = 0; i < nestedRulesKeys.length; i += 1) {
                    var k = nestedRulesKeys[i];
                    // Validation rule exists,
                    // but the corresponding nested link may not be created,
                    // (because it may not be inferred automatically)
                    // because the original array value cas miss the corresponding index
                    // The design choice is to skip validation in this case.
                    // A client can define per array level validation rule,
                    // where existance of the index can be cheched.
                    if (nestedInst[k] !== undefined) {
                        result = result.concat(nestedInst[k]
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
            instanceFactory: function () { return ({
                get config() {
                    if (attachRule !== undefined && message !== undefined) {
                        return { rule: attachRule, message: message, severity: severity || ValidationSeverity.ERROR };
                    }
                    return undefined;
                },
                onAttach: function (path, plugin) {
                    var config = plugin.config;
                    if (config) {
                        addRule(path, config);
                    }
                },
                extensions: ['valid', 'validShallow', 'invalid', 'invalidShallow', 'errors', 'firstError'],
                extensionsFactory: function (l) { return ({
                    get validShallow() {
                        return getErrors(l, 1, undefined, true).length === 0;
                    },
                    get valid() {
                        return getErrors(l, Number.MAX_SAFE_INTEGER, undefined, true).length === 0;
                    },
                    get invalidShallow() {
                        return getErrors(l, 1, undefined, true).length !== 0;
                    },
                    get invalid() {
                        return getErrors(l, Number.MAX_SAFE_INTEGER, undefined, true).length !== 0;
                    },
                    errors: function (filter, depth, first) {
                        return getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, first);
                    },
                    firstError: function (filter, depth) {
                        var r = getErrors(l, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, true);
                        if (r.length === 0) {
                            return {};
                        }
                        return r[0];
                    },
                }); }
            }); }
        };
    };
}

export { Validation, ValidationSeverity };
//# sourceMappingURL=index.es.js.map
