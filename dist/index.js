'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

function extractValue(prevValue, value) {
    if (typeof value === 'function') {
        return value(prevValue);
    }
    return value;
}
function createArrayStateMutation(setValue) {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    return {
        set: setValue,
        merge: function (other) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                var source = extractValue(copy, other);
                Object.keys(source).sort().forEach(function (i) {
                    var index = Number(i);
                    copy[index] = source[index];
                });
                return copy;
            });
        },
        update: function (key, value) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy[key] = extractValue(copy[key], value);
                return copy;
            });
        },
        concat: function (other) {
            if (other) {
                setValue(function (prevValue) {
                    var copy = prevValue.slice();
                    return copy.concat(extractValue(copy, other));
                });
            }
        },
        push: function (elem) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.push(elem);
                return copy;
            });
        },
        pop: function () {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.pop();
                return copy;
            });
        },
        insert: function (index, elem) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.splice(index, 0, elem);
                return copy;
            });
        },
        remove: function (index) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy.splice(index, 1);
                return copy;
            });
        },
        swap: function (index1, index2) {
            setValue(function (prevValue) {
                var copy = prevValue.slice();
                copy[index1] = prevValue[index2];
                copy[index2] = prevValue[index1];
                return copy;
            });
        }
    };
}
function useStateArray(initialState) {
    var _a = React.useState(initialState), value = _a[0], setValue = _a[1];
    return [value, createArrayStateMutation(setValue)];
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function extractValue$1(prevValue, value) {
    if (typeof value === 'function') {
        return value(prevValue);
    }
    return value;
}
function createObjectStateMutation(setValue) {
    // All actions (except set and merge with empty object) should crash
    // if prevValue is null or undefined. It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    var merge = function (value) {
        setValue(function (prevValue) {
            var extractedValue = extractValue$1(prevValue, value);
            var keys = Object.keys(extractedValue);
            if (keys.length === 0) {
                // empty object to merge with
                return prevValue;
            }
            // this causes the intended crash if merging with
            // the prevously set to undefined | null value
            // eslint-disable-next-line
            var _unused = prevValue[keys[0]];
            return __assign({}, (prevValue
                // this causes the intended crash if merging with
                // the prevously set to undefined | null value
                // and the block with _unused variable is optimized out
                // by a bundler like webpack, minify, etc.
                || Object.keys(prevValue)), extractedValue);
        });
    };
    return {
        set: setValue,
        merge: merge,
        update: function (key, value) { return merge(function (prevValue) {
            var partialResult = {};
            partialResult[key] = extractValue$1(
            // this causes the intended crash if updating the property of
            // the prevously set to undefined | null value
            prevValue[key], value);
            return partialResult;
        }); }
    };
}
function useStateObject(initialState) {
    var _a = React.useState(initialState), value = _a[0], setValue = _a[1];
    return [value, createObjectStateMutation(setValue)];
}

(function (ValidationSeverity) {
    ValidationSeverity[ValidationSeverity["WARNING"] = 1] = "WARNING";
    ValidationSeverity[ValidationSeverity["ERROR"] = 2] = "ERROR";
})(exports.ValidationSeverity || (exports.ValidationSeverity = {}));
function defaultEqualityOperator(a, b) {
    if (typeof b === 'object') {
        // check reference equality first for speed
        if (a === b) {
            return true;
        }
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
}
// tslint:disable-next-line:no-any
var defaultProcessingHooks = {};
function resolveSettings(settings) {
    return {
        skipSettingEqual: (settings && settings.skipSettingEqual) || false,
        globalHooks: (settings && settings.globalHooks) || defaultProcessingHooks,
        targetHooks: (settings && settings.targetHooks) || defaultProcessingHooks
    };
}
function extractValue$2(prevValue, newValue) {
    if (typeof newValue === 'function') {
        return newValue(prevValue);
    }
    return newValue;
}
var ReadonlyState = /** @class */ (function () {
    // eslint-disable-next-line no-useless-constructor
    function ReadonlyState(
    // tslint:disable-next-line:no-any
    _initial, 
    // tslint:disable-next-line:no-any
    _current, _edition, _settings) {
        this._initial = _initial;
        this._current = _current;
        this._edition = _edition;
        this._settings = _settings;
    }
    ReadonlyState.prototype.getCurrent = function (path) {
        var result = this._current;
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    ReadonlyState.prototype.getInitial = function (path) {
        var result = this._initial;
        path.forEach(function (p) {
            // in contrast to the current value,
            // allow the initial may not exist
            result = result && result[p];
        });
        return result;
    };
    Object.defineProperty(ReadonlyState.prototype, "edition", {
        get: function () {
            return this._edition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReadonlyState.prototype, "settings", {
        get: function () {
            return this._settings;
        },
        enumerable: true,
        configurable: true
    });
    ReadonlyState.prototype.globalHooks = function () {
        return this._settings.globalHooks;
    };
    // tslint:disable-next-line:no-any
    ReadonlyState.prototype.targetHooks = function (path) {
        var result = this._settings.targetHooks;
        path.forEach(function (p) {
            result = result && (result[p] || (typeof p === 'number' && result['*']));
        });
        return result || defaultProcessingHooks;
    };
    return ReadonlyState;
}());
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    // eslint-disable-next-line no-useless-constructor
    function State(
    // tslint:disable-next-line:no-any
    _initial, 
    // tslint:disable-next-line:no-any
    _current, _edition, _settings) {
        return _super.call(this, _initial, _current, _edition, _settings) || this;
    }
    // tslint:disable-next-line:no-any
    State.prototype.setCurrent = function (value) {
        this._edition += 1;
        this._current = value;
        return this;
    };
    // tslint:disable-next-line:no-any
    State.prototype.setInitial = function (value) {
        // update edition on every mutation
        // so consumers can invalidate their caches
        this._edition += 1;
        this._initial = value;
        return this;
    };
    return State;
}(ReadonlyState));
var ValueLinkImpl = /** @class */ (function () {
    // eslint-disable-next-line no-useless-constructor
    function ValueLinkImpl(state, path, onSet) {
        this.state = state;
        this.path = path;
        this.onSet = onSet;
        this.inferredCache = undefined;
        this.inferredCacheEdition = -1;
        this.valueCacheEdition = -1;
        this.initialValueCacheEdition = -1;
        this.hooksCacheEdition = -1;
        this.modifiedCacheEdition = -1;
        this.errorsCacheEdition = -1;
    }
    Object.defineProperty(ValueLinkImpl.prototype, "value", {
        get: function () {
            if (this.valueCacheEdition < this.state.edition) {
                this.valueCacheEdition = this.state.edition;
                this.valueCache = this.state.getCurrent(this.path);
            }
            return this.valueCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "initialValue", {
        get: function () {
            if (this.initialValueCacheEdition < this.state.edition) {
                this.initialValueCacheEdition = this.state.edition;
                this.initialValueCache = this.state.getInitial(this.path);
            }
            return this.initialValueCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "hooks", {
        get: function () {
            if (this.hooksCacheEdition < this.state.edition) {
                this.hooksCacheEdition = this.state.edition;
                this.hooksCache = this.state.targetHooks(this.path);
            }
            return this.hooksCache;
        },
        enumerable: true,
        configurable: true
    });
    ValueLinkImpl.prototype.set = function (newValue) {
        // inferred() function checks for the nullability of the current value:
        // If value is not null | undefined, it resolves to ArrayLink or ObjectLink
        // which can not take null | undefined as a value.
        // However, it is possible that a user of this ValueLink
        // may call set(null | undefined).
        // In this case this null will leak via setValue(prevValue => ...)
        // to mutation actions for array or object,
        // which breaks the guarantee of ArrayLink and ObjectLink to not link nullable value.
        // Currently this causes a crash within ObjectLink or ArrayLink mutation actions.
        // This behavior is left intentionally to make it equivivalent to the following:
        // Example (plain JS):
        //    let myvar: { a: string, b: string } = { a: '', b: '' }
        //    myvar = undefined;
        //    myvar.a = '' // <-- crash here
        //    myvar = { a: '', b: '' } // <-- OK
        // Example (using value links):
        //    let myvar = useStateLink({ a: '', b: '' } as { a: string, b: string } | undefined);
        //    let myvar_a = myvar.nested.a; // get value link to a property
        //    myvar.set(undefined);
        //    myvar_a.set('') // <-- crash here
        //    myvar.set({ a: '', b: '' }) // <-- OK
        var extractedNewValue = extractValue$2(this.value, newValue);
        var localPreset = this.hooks.__preset;
        if (localPreset) {
            extractedNewValue = localPreset(extractedNewValue, this);
        }
        var globalPreset = this.state.globalHooks().__preset;
        if (globalPreset) {
            extractedNewValue = globalPreset(extractedNewValue, this);
        }
        if (this.state.settings.skipSettingEqual &&
            this.areValuesEqual(extractedNewValue, this.value)) {
            return;
        }
        this.onSet(extractedNewValue);
    };
    ValueLinkImpl.prototype.areValuesEqual = function (newValue, oldValue) {
        var localCompare = this.hooks.__compare;
        if (localCompare) {
            var localCompareResult = localCompare(newValue, oldValue, this);
            if (localCompareResult !== undefined) {
                return localCompareResult;
            }
        }
        var globalCompare = this.state.globalHooks().__compare;
        if (globalCompare) {
            var globalCompareResult = globalCompare(newValue, oldValue, this);
            if (globalCompareResult !== undefined) {
                return globalCompareResult;
            }
        }
        return defaultEqualityOperator(newValue, oldValue);
    };
    Object.defineProperty(ValueLinkImpl.prototype, "modified", {
        get: function () {
            if (this.modifiedCacheEdition < this.state.edition) {
                this.modifiedCacheEdition = this.state.edition;
                this.modifiedCache = !this.areValuesEqual(this.value, this.initialValue);
            }
            return this.modifiedCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "unmodified", {
        get: function () {
            return !this.modified;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "valid", {
        get: function () {
            return this.errors.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "invalid", {
        get: function () {
            return !this.valid;
        },
        enumerable: true,
        configurable: true
    });
    ValueLinkImpl.prototype.validate = function (validator) {
        var _this = this;
        if (validator) {
            var errors = validator(this.value, this);
            if (errors !== undefined) {
                if (Array.isArray(errors)) {
                    return errors.map(function (m) {
                        return typeof m === 'string' ? {
                            path: _this.path,
                            message: m,
                            severity: exports.ValidationSeverity.ERROR
                        } : {
                            path: _this.path,
                            message: m.message,
                            severity: m.severity
                        };
                    });
                }
                else if (typeof errors === 'string') {
                    return [{
                            path: this.path,
                            message: errors,
                            severity: exports.ValidationSeverity.ERROR
                        }];
                }
                else {
                    return [{
                            path: this.path,
                            message: errors.message,
                            severity: errors.severity
                        }];
                }
            }
        }
        return undefined;
    };
    Object.defineProperty(ValueLinkImpl.prototype, "errors", {
        get: function () {
            if (this.errorsCacheEdition < this.state.edition) {
                this.errorsCacheEdition = this.state.edition;
                var localHooks_1 = this.hooks;
                var result_1 = this.validate(localHooks_1.__validate) ||
                    this.validate(this.state.globalHooks().__validate) ||
                    [];
                var nestedHooks = Object.keys(localHooks_1).filter(function (i) { return typeof localHooks_1[i] !== 'function'; });
                if (nestedHooks.length > 0 && this.nested) {
                    var nestedInst_1 = this.nested;
                    if (Array.isArray(nestedInst_1)) {
                        if (localHooks_1['*']) {
                            nestedInst_1.forEach(function (n, i) {
                                result_1 = result_1.concat(n.errors);
                            });
                        }
                        nestedHooks
                            // Validation rule exists,
                            // but the corresponding nested link may not be created,
                            // (because it may not be inferred automatically)
                            // because the original array value cas miss the corresponding index
                            // The design choice is to skip validation in this case.
                            // A client can define per array level validation rule,
                            // where existance of the index can be cheched.
                            .filter(function (k) { return typeof k === 'number' && nestedInst_1[k] !== undefined; })
                            .forEach(function (k) {
                            result_1 = result_1.concat(nestedInst_1[k].errors);
                        });
                    }
                    else if (nestedInst_1) {
                        nestedHooks
                            // Validation rule exists,
                            // but the corresponding nested link may not be created,
                            // (because it may not be inferred automatically)
                            // because the original object value can miss the corresponding key
                            // The design choice is to skip validation in this case.
                            // A client can define per object level validation rule,
                            // where existance of the property can be cheched.
                            .filter(function (k) { return nestedInst_1[k] !== undefined; })
                            .forEach(function (k) {
                            result_1 = result_1.concat(nestedInst_1[k].errors);
                        });
                    }
                }
                var first_1 = function (condition) {
                    return result_1.find(function (e) { return condition ? condition(e) : true; });
                };
                var firstPartial = function (condition) {
                    var r = first_1(condition);
                    if (r === undefined) {
                        return {};
                    }
                    return r;
                };
                Object.assign(result_1, {
                    first: first_1,
                    firstPartial: firstPartial
                });
                this.errorsCache = result_1;
            }
            return this.errorsCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "inferred", {
        get: function () {
            if (this.inferredCacheEdition < this.state.edition) {
                this.inferredCacheEdition = this.state.edition;
                if (Array.isArray(this.value)) {
                    this.inferredCache = new ArrayLinkImpl(this);
                }
                else if (typeof this.value === 'object' && this.value !== null) {
                    this.inferredCache = new ObjectLinkImpl(this);
                }
                else {
                    this.inferredCache = undefined;
                }
            }
            return this.inferredCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValueLinkImpl.prototype, "nested", {
        get: function () {
            var inferred = this.inferred;
            if (inferred instanceof ArrayLinkImpl) {
                return inferred.nestedImpl;
            }
            else if (inferred instanceof ObjectLinkImpl) {
                return inferred.nestedImpl;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    return ValueLinkImpl;
}());
var ProxyLink = /** @class */ (function () {
    function ProxyLink(origin) {
        this.origin = origin;
        if (origin instanceof ProxyLink) {
            origin = origin.origin;
        }
    }
    Object.defineProperty(ProxyLink.prototype, "path", {
        get: function () {
            return this.origin.path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "initialValue", {
        get: function () {
            return this.origin.initialValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "value", {
        get: function () {
            return this.origin.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "nested", {
        get: function () {
            return this.origin.nested;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "modified", {
        get: function () {
            return this.origin.modified;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "unmodified", {
        get: function () {
            return this.origin.unmodified;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "valid", {
        get: function () {
            return this.origin.valid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "invalid", {
        get: function () {
            return this.origin.invalid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "errors", {
        get: function () {
            return this.origin.errors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProxyLink.prototype, "inferred", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    ProxyLink.prototype.set = function (newValue) {
        this.origin.set(newValue);
    };
    return ProxyLink;
}());
var ArrayLinkImpl = /** @class */ (function (_super) {
    __extends(ArrayLinkImpl, _super);
    function ArrayLinkImpl(originImpl) {
        var _this = _super.call(this, originImpl) || this;
        _this.originImpl = originImpl;
        _this.nestedCache = undefined;
        _this.nestedCacheEdition = -1;
        _this.arrayMutation = createArrayStateMutation(function (newValue) { return originImpl.set(newValue); });
        return _this;
    }
    ArrayLinkImpl.prototype.set = function (newValue) {
        this.arrayMutation.set(newValue);
    };
    ArrayLinkImpl.prototype.merge = function (other) {
        this.arrayMutation.merge(other);
    };
    ArrayLinkImpl.prototype.update = function (key, value) {
        this.arrayMutation.update(key, value);
    };
    ArrayLinkImpl.prototype.concat = function (other) {
        this.arrayMutation.concat(other);
    };
    ArrayLinkImpl.prototype.push = function (elem) {
        this.arrayMutation.push(elem);
    };
    ArrayLinkImpl.prototype.pop = function () {
        this.arrayMutation.pop();
    };
    ArrayLinkImpl.prototype.insert = function (index, elem) {
        this.arrayMutation.insert(index, elem);
    };
    ArrayLinkImpl.prototype.remove = function (index) {
        this.arrayMutation.remove(index);
    };
    ArrayLinkImpl.prototype.swap = function (index1, index2) {
        this.arrayMutation.swap(index1, index2);
    };
    Object.defineProperty(ArrayLinkImpl.prototype, "nestedImpl", {
        get: function () {
            var _this = this;
            if (this.nestedCacheEdition < this.originImpl.state.edition) {
                this.nestedCacheEdition = this.originImpl.state.edition;
                var result_2 = [];
                this.value.forEach(function (_, index) {
                    result_2[index] = _this.atImpl(index);
                });
                Object.assign(result_2, {
                    at: function (k) {
                        if (result_2[k] === undefined) {
                            result_2[k] = _this.atImpl(k);
                        }
                        return result_2[k];
                    }
                });
                this.nestedCache = result_2;
            }
            return this.nestedCache;
        },
        enumerable: true,
        configurable: true
    });
    ArrayLinkImpl.prototype.atImpl = function (k) {
        var _this = this;
        return new ValueLinkImpl(this.originImpl.state, this.path.slice().concat(k), function (newValue) { return _this.arrayMutation.update(k, newValue); });
    };
    return ArrayLinkImpl;
}(ProxyLink));
var ObjectLinkImpl = /** @class */ (function (_super) {
    __extends(ObjectLinkImpl, _super);
    function ObjectLinkImpl(originImpl) {
        var _this = _super.call(this, originImpl) || this;
        _this.originImpl = originImpl;
        _this.nestedCache = undefined;
        _this.nestedCacheEdition = -1;
        _this.objectMutation = createObjectStateMutation(function (newValue) { return originImpl.set(newValue); });
        return _this;
    }
    ObjectLinkImpl.prototype.set = function (newValue) {
        this.objectMutation.set(newValue);
    };
    ObjectLinkImpl.prototype.merge = function (newValue) {
        this.objectMutation.merge(newValue);
    };
    ObjectLinkImpl.prototype.update = function (key, value) {
        this.objectMutation.update(key, value);
    };
    Object.defineProperty(ObjectLinkImpl.prototype, "nestedImpl", {
        get: function () {
            var _this = this;
            if (this.nestedCacheEdition < this.originImpl.state.edition) {
                this.nestedCacheEdition = this.originImpl.state.edition;
                var result_3 = {};
                Object.keys(this.value).forEach(function (k) {
                    result_3[k] = _this.atImpl(k);
                });
                Object.assign(result_3, {
                    // tslint:disable-next-line:no-any
                    at: function (k) {
                        if (result_3[k] === undefined) {
                            result_3[k] = _this.atImpl(k);
                        }
                        return result_3[k];
                    }
                });
                this.nestedCache = result_3;
            }
            return this.nestedCache;
        },
        enumerable: true,
        configurable: true
    });
    ObjectLinkImpl.prototype.atImpl = function (k) {
        var _this = this;
        return new ValueLinkImpl(this.originImpl.state, this.path.slice().concat(k.toString()), function (newValue) { return _this.objectMutation.update(k, newValue); });
    };
    return ObjectLinkImpl;
}(ProxyLink));
var StateLinkImpl = /** @class */ (function () {
    function StateLinkImpl(initial, settings) {
        var _this = this;
        this.settings = settings;
        this.context = undefined;
        this.subscribers = [];
        // tslint:disable-next-line:function-name
        this.Observer = function (props) {
            var _a = React.useState({
                state: _this.state
            }), value = _a[0], setState = _a[1];
            React.useEffect(function () {
                _this.subscribers.push(setState);
                return function () {
                    _this.subscribers = _this.subscribers.filter(function (s) { return s !== setState; });
                };
            }, [setState]);
            if (_this.context === undefined) {
                _this.context = React.createContext(value);
            }
            // submit new value every time to trigger rerender for children
            return React.createElement(_this.context.Provider, __assign({}, props, { value: value }));
        };
        var initialValue = initial;
        if (typeof initial === 'function') {
            initialValue = initial();
        }
        this.state = new State(initialValue, initialValue, 0, settings);
        this.link = new ValueLinkImpl(this.state, [], function (newValue) {
            _this.state.setCurrent(newValue);
            var newRef = {
                state: _this.state
            };
            _this.subscribers.forEach(function (s) { return s(newRef); });
        });
    }
    return StateLinkImpl;
}());
function createStateLink(initial, settings) {
    return new StateLinkImpl(initial, resolveSettings(settings));
}
function useProxyStateLink(originLink) {
    var _a = React.useState({
        state: new State(originLink.initialValue, originLink.value, 0, __assign({}, originLink.state.settings, { targetHooks: originLink.hooks })),
        originInitEdition: originLink.state.edition,
    }), value = _a[0], setValue = _a[1];
    var isLocalStateStale = originLink.state.edition > value.originInitEdition;
    if (isLocalStateStale) {
        value.state = new State(originLink.initialValue, originLink.value, 0, __assign({}, originLink.state.settings, { targetHooks: originLink.hooks }));
    }
    var result = new ValueLinkImpl(value.state, [], function (newValue) { return setValue({
        state: value.state.setCurrent(newValue),
        originInitEdition: originLink.state.edition
    }); });
    React.useEffect(function () {
        // set when the errors change, not just when validity status changes
        if (!defaultEqualityOperator(result.errors, originLink.errors) ||
            originLink.modified !== result.modified) {
            originLink.set(result.value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(result.errors),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(originLink.errors),
        originLink.modified,
        result.modified
    ]);
    return result;
}
function useContextStateLink(stateLink) {
    if (stateLink.context === undefined) {
        // this allows to edit the global state
        // whitout active observers
        return stateLink.link;
    }
    // It is expected to be called within the provider scope,
    // after the context has been initialized
    // If not, the useContext will crash on undefined context.
    // Note: useContext is need to trigger rerendering the component
    // when state link changes its value.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useContext(stateLink.context);
    return stateLink.link;
}
function useLocalStateLink(initialState, settings) {
    var _a = React.useState(function () {
        var initialValue = initialState;
        if (typeof initialState === 'function') {
            initialValue = initialState();
        }
        return {
            state: new State(initialValue, initialValue, 0, resolveSettings(settings))
        };
    }), value = _a[0], setValue = _a[1];
    return new ValueLinkImpl(value.state, [], function (newValue) {
        setValue({
            state: value.state.setCurrent(newValue)
        });
    });
}
function useStateLink(initialState, settings) {
    if (initialState instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useProxyStateLink(initialState);
    }
    if (initialState instanceof ProxyLink &&
        initialState.origin instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useProxyStateLink(initialState.origin);
    }
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useContextStateLink(initialState);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState, settings);
}

exports.createArrayStateMutation = createArrayStateMutation;
exports.createObjectStateMutation = createObjectStateMutation;
exports.createStateLink = createStateLink;
exports.useStateArray = useStateArray;
exports.useStateLink = useStateLink;
exports.useStateObject = useStateObject;
//# sourceMappingURL=index.js.map
