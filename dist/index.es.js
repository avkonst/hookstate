import React from 'react';

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

//
// INTERNAL IMPLEMENTATIONS
//
var StateLinkInvalidUsageError = /** @class */ (function (_super) {
    __extends(StateLinkInvalidUsageError, _super);
    function StateLinkInvalidUsageError(op, path, hint) {
        return _super.call(this, "StateLink is used incorrectly. Attempted '" + op + "' at '/" + path.join('/') + "'" +
            hint ? ". Hint: " + hint : '') || this;
    }
    return StateLinkInvalidUsageError;
}(Error));
var ExtensionInvalidRegistrationError = /** @class */ (function (_super) {
    __extends(ExtensionInvalidRegistrationError, _super);
    function ExtensionInvalidRegistrationError(id, path) {
        return _super.call(this, "Extension with onInit, which overrides initial value, " +
            "should be attached to StateRef instance, but not to StateLink instance. " +
            ("Attempted 'with " + id.toString() + "' at '/" + path.join('/') + "'")) || this;
    }
    return ExtensionInvalidRegistrationError;
}(Error));
var ExtensionUnknownError = /** @class */ (function (_super) {
    __extends(ExtensionUnknownError, _super);
    function ExtensionUnknownError(ext) {
        return _super.call(this, "Extension '" + ext + "' is unknown'") || this;
    }
    return ExtensionUnknownError;
}(Error));
var DisabledTrackingID = Symbol('DisabledTrackingID');
var StateMemoID = Symbol('StateMemoID');
var RootPath = [];
var State = /** @class */ (function () {
    function State(_value) {
        this._value = _value;
        this._subscribers = new Set();
        this._presetSubscribers = new Set();
        this._plugins = new Map();
    }
    State.prototype.get = function (path) {
        var result = this._value;
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    State.prototype.set = function (path, value) {
        var _this = this;
        if (path.length === 0) {
            this._value = value;
        }
        var result = this._value;
        path.forEach(function (p, i) {
            if (i === path.length - 1) {
                _this._presetSubscribers.forEach(function (cb) { return cb(path, value, result[p], _this._value); });
                if (!(p in result)) {
                    // if an array of object is about to be extended by new property
                    // we consider it is the whole object is changed
                    // which is identified by upper path
                    path = path.slice(0, -1);
                }
                result[p] = value;
            }
            else {
                result = result[p];
            }
        });
        return path;
    };
    State.prototype.update = function (path) {
        var actions = [];
        this._subscribers.forEach(function (s) { return s.onSet(path, actions); });
        actions.forEach(function (a) { return a(); });
    };
    State.prototype.updateBatch = function (paths) {
        var _this = this;
        var actions = [];
        paths.forEach(function (path) {
            _this._subscribers.forEach(function (s) { return s.onSet(path, actions); });
        });
        actions.forEach(function (a) { return a(); });
    };
    State.prototype.getPlugin = function (pluginId) {
        var existingInstance = this._plugins.get(pluginId);
        if (existingInstance) {
            return existingInstance;
        }
        throw new ExtensionUnknownError(pluginId.toString());
    };
    State.prototype.register = function (plugin, path) {
        var _this = this;
        var existingInstance = this._plugins.get(plugin.id);
        if (existingInstance) {
            if (existingInstance.onAttach) {
                existingInstance.onAttach(path || RootPath, plugin.instanceFactory(this._value));
            }
            return;
        }
        var pluginInstance = plugin.instanceFactory(this._value);
        this._plugins.set(plugin.id, pluginInstance);
        if (pluginInstance.onInit) {
            var initValue = pluginInstance.onInit();
            if (initValue !== undefined) {
                if (path) {
                    throw new ExtensionInvalidRegistrationError(plugin.id, path);
                }
                this._value = initValue;
            }
        }
        if (pluginInstance.onAttach) {
            pluginInstance.onAttach(path || RootPath, pluginInstance);
        }
        if (pluginInstance.onSet) {
            this.subscribe({
                onSet: function (p) { return pluginInstance.onSet(p, _this._value); }
            });
        }
        if (pluginInstance.onPreset) {
            this._presetSubscribers.add(pluginInstance.onPreset);
        }
        return;
    };
    State.prototype.subscribe = function (l) {
        this._subscribers.add(l);
    };
    State.prototype.unsubscribe = function (l) {
        this._subscribers.delete(l);
    };
    return State;
}());
var SynteticID = Symbol('SynteticTypeInferenceMarker');
var StateRefImpl = /** @class */ (function () {
    function StateRefImpl(state) {
        this.state = state;
        // tslint:disable-next-line: variable-name
        this.__synteticTypeInferenceMarkerRef = SynteticID;
    }
    StateRefImpl.prototype.with = function (plugin) {
        var pluginMeta = plugin();
        if (pluginMeta.id === DisabledTrackingID) {
            this.disabledTracking = true;
            return this;
        }
        this.state.register(pluginMeta);
        return this;
    };
    return StateRefImpl;
}());
var StateInfImpl = /** @class */ (function () {
    function StateInfImpl(wrapped, transform) {
        this.wrapped = wrapped;
        this.transform = transform;
        // tslint:disable-next-line: variable-name
        this.__synteticTypeInferenceMarkerInf = SynteticID;
    }
    StateInfImpl.prototype.with = function (plugin) {
        this.wrapped.with(plugin);
        return this;
    };
    return StateInfImpl;
}());
var StateLinkImpl = /** @class */ (function () {
    function StateLinkImpl(state, path, onUpdateUsed, valueUntracked) {
        this.state = state;
        this.path = path;
        this.onUpdateUsed = onUpdateUsed;
        this.valueUntracked = valueUntracked;
    }
    Object.defineProperty(StateLinkImpl.prototype, "value", {
        get: function () {
            if (this.valueTracked === undefined) {
                if (this.disabledTracking) {
                    this.valueTracked = this.valueUntracked;
                    if (this.valueTracked === undefined) {
                        this.valueUsed = true;
                    }
                }
                else if (Array.isArray(this.valueUntracked)) {
                    this.valueTracked = this.valueArrayImpl();
                }
                else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                    this.valueTracked = this.valueObjectImpl();
                }
                else {
                    this.valueTracked = this.valueUntracked;
                    if (this.valueTracked === undefined) {
                        this.valueUsed = true;
                    }
                }
            }
            return this.valueTracked;
        },
        enumerable: true,
        configurable: true
    });
    StateLinkImpl.prototype.getUntracked = function () {
        return this.valueUntracked;
    };
    StateLinkImpl.prototype.get = function () {
        return this.value;
    };
    StateLinkImpl.prototype.setUntracked = function (newValue) {
        // inferred() function checks for the nullability of the current value:
        // If value is not null | undefined, it resolves to ArrayLink or ObjectLink
        // which can not take null | undefined as a value.
        // However, it is possible that a user of this ValueLink
        // may call set(null | undefined).
        // In this case this null will leak via setValue(prevValue => ...)
        // to mutation actions for array or object,
        // which breaks the guarantee of ArrayStateMutation and ObjectStateMutation to not link nullable value.
        // Currently this causes a crash within ObjectStateMutation or ArrayStateMutation mutation actions.
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
        if (typeof newValue === 'function') {
            newValue = newValue(this.state.get(this.path));
        }
        return this.state.set(this.path, newValue);
    };
    StateLinkImpl.prototype.set = function (newValue) {
        this.state.update(this.setUntracked(newValue));
    };
    StateLinkImpl.prototype.update = function (path) {
        this.state.update(path);
    };
    StateLinkImpl.prototype.updateBatch = function (paths) {
        this.state.updateBatch(paths);
    };
    StateLinkImpl.prototype.with = function (plugin) {
        if (typeof plugin === 'function') {
            var pluginMeta = plugin();
            if (pluginMeta.id === DisabledTrackingID) {
                this.disabledTracking = true;
                return this;
            }
            this.state.register(pluginMeta, this.path);
            return this;
        }
        else {
            return [this, this.state.getPlugin(plugin)];
        }
    };
    StateLinkImpl.prototype.subscribe = function (l) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    };
    StateLinkImpl.prototype.unsubscribe = function (l) {
        this.subscribers.delete(l);
    };
    StateLinkImpl.prototype.onSet = function (path, actions) {
        this.updateIfUsed(path, actions);
    };
    StateLinkImpl.prototype.updateIfUsed = function (path, actions) {
        var _this = this;
        var update = function () {
            if (_this.disabledTracking && (_this.valueTracked !== undefined || _this.valueUsed === true)) {
                actions.push(_this.onUpdateUsed);
                return true;
            }
            var firstChildKey = path[_this.path.length];
            if (firstChildKey === undefined) {
                if (_this.valueTracked !== undefined || _this.valueUsed === true) {
                    actions.push(_this.onUpdateUsed);
                    return true;
                }
                return false;
            }
            var firstChildValue = _this.nestedLinksCache && _this.nestedLinksCache[firstChildKey];
            if (firstChildValue === undefined) {
                return false;
            }
            return firstChildValue.updateIfUsed(path, actions);
        };
        var updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(function (s) {
                s.onSet(path, actions);
            });
        }
        return updated;
    };
    Object.defineProperty(StateLinkImpl.prototype, "nested", {
        get: function () {
            if (!this.valueTracked) {
                this.valueUsed = true;
            }
            if (this.nestedCache === undefined) {
                if (Array.isArray(this.valueUntracked)) {
                    this.nestedCache = this.nestedArrayImpl();
                }
                else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                    this.nestedCache = this.nestedObjectImpl();
                }
                else {
                    this.nestedCache = undefined;
                }
            }
            return this.nestedCache;
        },
        enumerable: true,
        configurable: true
    });
    StateLinkImpl.prototype.nestedArrayImpl = function () {
        var _this = this;
        var proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;
        var getter = function (target, key) {
            if (key === 'length') {
                return target.length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            var index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            var cachehit = proxyGetterCache[index];
            if (cachehit) {
                return cachehit;
            }
            var r = new StateLinkImpl(_this.state, _this.path.slice().concat(index), _this.onUpdateUsed, target[index]);
            if (_this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked, getter);
    };
    StateLinkImpl.prototype.valueArrayImpl = function () {
        var _this = this;
        return this.proxyWrap(this.valueUntracked, function (target, key) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                return target[key];
            }
            if (key === 'length') {
                return target.length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            var index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            return (_this.nested)[index].value;
        }, function (target, key, value) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                target[key] = value;
                return true;
            }
            throw new StateLinkInvalidUsageError('set', _this.path, "use StateLink.set(...) API: replace 'state[" + key + "] = value' by " +
                ("'state.nested[" + key + "].set(value)' to update an element in the state array"));
        });
    };
    StateLinkImpl.prototype.nestedObjectImpl = function () {
        var _this = this;
        var proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;
        var getter = function (target, key) {
            if (typeof key === 'symbol') {
                return undefined;
            }
            var cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            var r = new StateLinkImpl(_this.state, _this.path.slice().concat(key.toString()), _this.onUpdateUsed, target[key]);
            if (_this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked, getter);
    };
    StateLinkImpl.prototype.valueObjectImpl = function () {
        var _this = this;
        return this.proxyWrap(this.valueUntracked, function (target, key) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                return target[key];
            }
            return (_this.nested)[key].value;
        }, function (target, key, value) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                target[key] = value;
                return true;
            }
            throw new StateLinkInvalidUsageError('set', _this.path, "use StateLink.set(...) API: replace 'state." + key + " = value' by " +
                ("'state.nested." + key + ".set(value)' to update a property in the state object"));
        });
    };
    // tslint:disable-next-line: no-any
    StateLinkImpl.prototype.proxyWrap = function (objectToWrap, 
    // tslint:disable-next-line: no-any
    getter, 
    // tslint:disable-next-line: no-any
    setter) {
        var _this = this;
        var onInvalidUsage = function (op) {
            throw new StateLinkInvalidUsageError(op, _this.path);
        };
        return new Proxy(objectToWrap, {
            getPrototypeOf: function (target) {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: function (target, v) {
                return onInvalidUsage('setPrototypeOf');
            },
            isExtensible: function (target) {
                return false;
            },
            preventExtensions: function (target) {
                return onInvalidUsage('preventExtensions');
            },
            getOwnPropertyDescriptor: function (target, p) {
                var origin = Object.getOwnPropertyDescriptor(target, p);
                if (origin && Array.isArray(target) && p in Array.prototype) {
                    return origin;
                }
                return origin && {
                    configurable: true,
                    enumerable: origin.enumerable,
                    get: function () { return getter(target, p); },
                    set: undefined
                };
            },
            has: function (target, p) {
                if (typeof p === 'symbol') {
                    return false;
                }
                return p in target;
            },
            get: getter,
            set: setter || (function (target, p, value, receiver) {
                return onInvalidUsage('set');
            }),
            deleteProperty: function (target, p) {
                return onInvalidUsage('deleteProperty');
            },
            defineProperty: function (target, p, attributes) {
                return onInvalidUsage('defineProperty');
            },
            enumerate: function (target) {
                if (Array.isArray(target)) {
                    return Object.keys(target).concat('length');
                }
                return Object.keys(target);
            },
            ownKeys: function (target) {
                if (Array.isArray(target)) {
                    return Object.keys(target).concat('length');
                }
                return Object.keys(target);
            },
            apply: function (target, thisArg, argArray) {
                return onInvalidUsage('apply');
            },
            construct: function (target, argArray, newTarget) {
                return onInvalidUsage('construct');
            }
        });
    };
    return StateLinkImpl;
}());
var useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
function createState(initial) {
    var initialValue = initial;
    if (typeof initial === 'function') {
        initialValue = initial();
    }
    return new State(initialValue);
}
function useSubscribedStateLink(state, path, update, subscribeTarget, disabledTracking) {
    var link = new StateLinkImpl(state, path, update, state.get(path));
    if (disabledTracking) {
        link.with(DisabledTracking);
    }
    useIsomorphicLayoutEffect(function () {
        subscribeTarget.subscribe(link);
        return function () { return subscribeTarget.unsubscribe(link); };
    });
    return link;
}
function useGlobalStateLink(stateLink) {
    var _a = React.useState({}), setValue = _a[1];
    return useSubscribedStateLink(stateLink.state, RootPath, function () {
        setValue({});
    }, stateLink.state, stateLink.disabledTracking);
}
function useLocalStateLink(initialState) {
    var _a = React.useState(function () { return ({ state: createState(initialState) }); }), value = _a[0], setValue = _a[1];
    return useSubscribedStateLink(value.state, RootPath, function () {
        setValue({ state: value.state });
    }, value.state);
}
function useScopedStateLink(originLink) {
    var _a = React.useState({}), setValue = _a[1];
    return useSubscribedStateLink(originLink.state, originLink.path, function () {
        setValue({});
    }, originLink, originLink.disabledTracking);
}
function useAutoStateLink(initialState) {
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useScopedStateLink(initialState);
    }
    if (initialState instanceof StateRefImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState);
}
function injectTransform(link, transform) {
    var injectedOnUpdateUsed = undefined;
    var originOnUpdateUsed = link.onUpdateUsed;
    link.onUpdateUsed = function () {
        if (injectedOnUpdateUsed) {
            return injectedOnUpdateUsed();
        }
        return originOnUpdateUsed();
    };
    var result = transform(link, undefined);
    var stateMemoEquals = link[StateMemoID];
    if (stateMemoEquals === undefined) {
        return result;
    }
    delete link[StateMemoID];
    injectedOnUpdateUsed = function () {
        // need to create new one to make sure
        // it does not pickup the stale cache of the original link after mutation
        var overidingLink = new StateLinkImpl(link.state, link.path, link.onUpdateUsed, link.state.get(link.path));
        // and we should inject to onUpdate now
        // so the overriding link is used to track used properties
        link.onSet = function (path, actions) { return overidingLink.onSet(path, actions); };
        var updatedResult = transform(overidingLink, result);
        // if result is not changed, it does not affect the rendering result too
        // so, we skip triggering rerendering in this case
        if (!stateMemoEquals(updatedResult, result)) {
            originOnUpdateUsed();
        }
    };
    return result;
}
function createStateLink(initial, transform) {
    var ref = new StateRefImpl(createState(initial));
    if (transform) {
        return new StateInfImpl(ref, transform);
    }
    return ref;
}
function useStateLink(source, transform) {
    var state = source instanceof StateInfImpl
        ? source.wrapped
        : source;
    var link = useAutoStateLink(state);
    if (source instanceof StateInfImpl) {
        return injectTransform(link, source.transform);
    }
    if (transform) {
        return injectTransform(link, transform);
    }
    return link;
}
function useStateLinkUnmounted(source, transform) {
    var stateRef = source instanceof StateInfImpl
        ? source.wrapped
        : source;
    var link = new StateLinkImpl(stateRef.state, RootPath, 
    // it is assumed the client discards the state link once it is used
    function () {
        throw new Error('Internal Error: unexpected call');
    }, stateRef.state.get(RootPath)).with(DisabledTracking); // it does not matter how it is used, it is not subscribed anyway
    if (source instanceof StateInfImpl) {
        return source.transform(link, undefined);
    }
    if (transform) {
        return transform(link);
    }
    return link;
}
function StateFragment(props) {
    var scoped = useStateLink(props.state, props.transform);
    return props.children(scoped);
}
function StateMemo(transform, equals) {
    return function (link, prev) {
        link[StateMemoID] = equals || (function (n, p) { return (n === p); });
        return transform(link, prev);
    };
}
// tslint:disable-next-line: function-name
function DisabledTracking() {
    return {
        id: DisabledTrackingID,
        instanceFactory: function () { return ({}); }
    };
}

export { DisabledTracking, StateFragment, StateMemo, createStateLink, useStateLink, useStateLinkUnmounted };
//# sourceMappingURL=index.es.js.map
