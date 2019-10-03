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
            (hint ? ". Hint: " + hint : '')) || this;
    }
    return StateLinkInvalidUsageError;
}(Error));
function extractSymbol(s) {
    var result = s.toString();
    var symstr = 'Symbol(';
    if (result.startsWith(symstr) && result.endsWith(')')) {
        result = result.substring(symstr.length, result.length - 1);
    }
    return result;
}
var PluginInvalidRegistrationError = /** @class */ (function (_super) {
    __extends(PluginInvalidRegistrationError, _super);
    function PluginInvalidRegistrationError(id, path) {
        return _super.call(this, "Plugin with onInit, which overrides initial value, " +
            "should be attached to StateRef instance, but not to StateLink instance. " +
            ("Attempted 'with(" + extractSymbol(id) + ")' at '/" + path.join('/') + "'")) || this;
    }
    return PluginInvalidRegistrationError;
}(Error));
var PluginUnknownError = /** @class */ (function (_super) {
    __extends(PluginUnknownError, _super);
    function PluginUnknownError(s) {
        return _super.call(this, "Plugin '" + extractSymbol(s) + "' has not been attached to the StateRef or StateLink. " +
            "Hint: you might need to register the required plugin using 'with' method. " +
            "See https://github.com/avkonst/hookstate#plugins for more details") || this;
    }
    return PluginUnknownError;
}(Error));
var DegradedID = Symbol('Degraded');
var StateMemoID = Symbol('StateMemo');
var ProxyMarkerID = Symbol('ProxyMarker');
var RootPath = [];
var State = /** @class */ (function () {
    function State(_value) {
        this._value = _value;
        this._edition = 0;
        this._subscribers = new Set();
        this._presetSubscribers = new Set();
        this._setSubscribers = new Set();
        this._destroySubscribers = new Set();
        this._plugins = new Map();
    }
    Object.defineProperty(State.prototype, "edition", {
        get: function () {
            return this._edition;
        },
        enumerable: true,
        configurable: true
    });
    State.prototype.get = function (path) {
        var result = this._value;
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    State.prototype.set = function (path, value) {
        var _this = this;
        this._presetSubscribers.forEach(function (cb) {
            var presetResult = cb(path, _this._value, value);
            if (presetResult !== undefined) {
                // plugin overrides the current value
                // could be used for immutable later on
                _this._value = presetResult;
            }
        });
        if (path.length === 0) {
            this._value = value;
        }
        var result = this._value;
        var returnPath = path;
        path.forEach(function (p, i) {
            if (i === path.length - 1) {
                if (!(p in result)) {
                    // if an array of object is about to be extended by new property
                    // we consider it is the whole object is changed
                    // which is identified by upper path
                    returnPath = path.slice(0, -1);
                }
                result[p] = value;
            }
            else {
                result = result[p];
            }
        });
        this._edition += 1;
        this._setSubscribers.forEach(function (cb) { return cb(path, _this._value, value); });
        return returnPath;
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
        throw new PluginUnknownError(pluginId);
    };
    State.prototype.register = function (plugin, path) {
        var _this = this;
        var existingInstance = this._plugins.get(plugin.id);
        if (existingInstance) {
            return;
        }
        var pluginInstance = plugin.instanceFactory(this._value, function () { return useStateLinkUnmounted(new StateRefImpl(_this)); });
        this._plugins.set(plugin.id, pluginInstance);
        if (pluginInstance.onInit) {
            var initValue = pluginInstance.onInit();
            if (initValue !== undefined) {
                if (path) {
                    throw new PluginInvalidRegistrationError(plugin.id, path);
                }
                this._value = initValue;
            }
        }
        if (pluginInstance.onPreset) {
            this._presetSubscribers.add(function (p, s, v) { return pluginInstance.onPreset(p, s, v); });
        }
        if (pluginInstance.onSet) {
            this._setSubscribers.add(function (p, s, v) { return pluginInstance.onSet(p, s, v); });
        }
        if (pluginInstance.onDestroy) {
            this._destroySubscribers.add(function (s) { return pluginInstance.onDestroy(s); });
        }
        return;
    };
    State.prototype.subscribe = function (l) {
        this._subscribers.add(l);
    };
    State.prototype.unsubscribe = function (l) {
        this._subscribers.delete(l);
    };
    State.prototype.destroy = function () {
        var _this = this;
        // TODO may need to block all coming calls after it is destroyed
        this._destroySubscribers.forEach(function (cb) { return cb(_this._value); });
    };
    State.prototype.toJSON = function () {
        throw new StateLinkInvalidUsageError('toJSON()', RootPath, 'did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?');
    };
    return State;
}());
var SynteticID = Symbol('SynteticTypeInferenceMarker');
var ValueCache = Symbol('ValueCache');
var NestedCache = Symbol('NestedCache');
var StateRefImpl = /** @class */ (function () {
    function StateRefImpl(state) {
        this.state = state;
        // tslint:disable-next-line: variable-name
        this.__synteticTypeInferenceMarkerRef = SynteticID;
    }
    StateRefImpl.prototype.with = function (plugin) {
        var pluginMeta = plugin();
        if (pluginMeta.id === DegradedID) {
            this.disabledTracking = true;
            return this;
        }
        this.state.register(pluginMeta);
        return this;
    };
    StateRefImpl.prototype.wrap = function (transform) {
        return new StateInfImpl(this, transform);
    };
    StateRefImpl.prototype.destroy = function () {
        this.state.destroy();
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
    StateInfImpl.prototype.wrap = function (transform) {
        var _this = this;
        return new StateInfImpl(this.wrapped, function (s, p) {
            return transform(_this.transform(s, undefined), p);
        });
    };
    StateInfImpl.prototype.destroy = function () {
        this.wrapped.destroy();
    };
    return StateInfImpl;
}());
var StateLinkImpl = /** @class */ (function () {
    function StateLinkImpl(state, path, onUpdateUsed, valueSource, valueEdition) {
        this.state = state;
        this.path = path;
        this.onUpdateUsed = onUpdateUsed;
        this.valueSource = valueSource;
        this.valueEdition = valueEdition;
    }
    StateLinkImpl.prototype.resetIfStale = function () {
        // only unmounted / untracked links are refreshed
        // others are recreated on state change as a part of rerender for affected state segments
        // it is for performance and correctness
        if (this.onUpdateUsed === undefined && this.valueEdition !== this.state.edition) {
            // it is safe to reset the state only for unmounted / untracked state links
            // because the following variables are used for tracking if a link has been used
            // during rendering
            delete this[ValueCache];
            delete this[NestedCache];
            delete this.nestedLinksCache;
            this.valueSource = this.state.get(this.path);
            this.valueEdition = this.state.edition;
        }
    };
    Object.defineProperty(StateLinkImpl.prototype, "value", {
        get: function () {
            this.resetIfStale();
            if (this[ValueCache] === undefined) {
                if (this.disabledTracking) {
                    this[ValueCache] = this.valueSource;
                }
                else if (Array.isArray(this.valueSource)) {
                    this[ValueCache] = this.valueArrayImpl();
                }
                else if (typeof this.valueSource === 'object' && this.valueSource !== null) {
                    this[ValueCache] = this.valueObjectImpl();
                }
                else {
                    this[ValueCache] = this.valueSource;
                }
            }
            return this[ValueCache];
        },
        enumerable: true,
        configurable: true
    });
    StateLinkImpl.prototype.getUntracked = function () {
        this.resetIfStale();
        return this.valueSource;
    };
    StateLinkImpl.prototype.get = function () {
        return this.value;
    };
    StateLinkImpl.prototype.setUntracked = function (newValue) {
        if (typeof newValue === 'function') {
            newValue = newValue(this.state.get(this.path));
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[ProxyMarkerID]) {
            throw new StateLinkInvalidUsageError("set(state.get() at '/" + newValue[ProxyMarkerID].path.join('/') + "')", this.path, 'did you mean to use state.set(lodash.cloneDeep(value)) instead of state.set(value)?');
        }
        return this.state.set(this.path, newValue);
    };
    StateLinkImpl.prototype.set = function (newValue) {
        this.state.update(this.setUntracked(newValue));
    };
    StateLinkImpl.prototype.update = function (path) {
        if (path.length === 0 || !Array.isArray(path[0])) {
            this.state.update(path);
        }
        else {
            this.state.updateBatch(path);
        }
    };
    StateLinkImpl.prototype.with = function (plugin) {
        if (typeof plugin === 'function') {
            var pluginMeta = plugin();
            if (pluginMeta.id === DegradedID) {
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
            if (_this.disabledTracking &&
                (ValueCache in _this || NestedCache in _this)) {
                if (_this.onUpdateUsed) {
                    actions.push(_this.onUpdateUsed);
                }
                return true;
            }
            var firstChildKey = path[_this.path.length];
            if (firstChildKey === undefined) {
                if (ValueCache in _this || NestedCache in _this) {
                    if (_this.onUpdateUsed) {
                        actions.push(_this.onUpdateUsed);
                    }
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
            this.resetIfStale();
            if (this[NestedCache] === undefined) {
                if (Array.isArray(this.valueSource)) {
                    this[NestedCache] = this.nestedArrayImpl();
                }
                else if (typeof this.valueSource === 'object' && this.valueSource !== null) {
                    this[NestedCache] = this.nestedObjectImpl();
                }
                else {
                    this[NestedCache] = undefined;
                }
            }
            return this[NestedCache];
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
            if (key === ProxyMarkerID) {
                return _this;
            }
            var index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            var cachehit = proxyGetterCache[index];
            if (cachehit) {
                return cachehit;
            }
            var r = new StateLinkImpl(_this.state, _this.path.slice().concat(index), _this.onUpdateUsed, target[index], _this.valueEdition);
            if (_this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(this.valueSource, getter);
    };
    StateLinkImpl.prototype.valueArrayImpl = function () {
        var _this = this;
        return this.proxyWrap(this.valueSource, function (target, key) {
            if (key === 'length') {
                return target.length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            if (key === ProxyMarkerID) {
                return _this;
            }
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                return target[key];
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
            throw new StateLinkInvalidUsageError('set', _this.path, "did you mean to use 'state.nested[" + key + "].set(value)' instead of 'state[" + key + "] = value'?");
        });
    };
    StateLinkImpl.prototype.nestedObjectImpl = function () {
        var _this = this;
        var proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;
        var getter = function (target, key) {
            if (key === ProxyMarkerID) {
                return _this;
            }
            if (typeof key === 'symbol') {
                return undefined;
            }
            var cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            var r = new StateLinkImpl(_this.state, _this.path.slice().concat(key.toString()), _this.onUpdateUsed, target[key], _this.valueEdition);
            if (_this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(this.valueSource, getter);
    };
    StateLinkImpl.prototype.valueObjectImpl = function () {
        var _this = this;
        return this.proxyWrap(this.valueSource, function (target, key) {
            if (key === ProxyMarkerID) {
                return _this;
            }
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
            throw new StateLinkInvalidUsageError('set', _this.path, "did you mean to use 'state.nested." + key + ".set(value)' instead of 'state." + key + " = value'?");
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
                // should satisfy the invariants:
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/
                // Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
                return Object.isExtensible(target);
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
    if (typeof initialValue === 'object' && initialValue[ProxyMarkerID]) {
        throw new StateLinkInvalidUsageError("create/useStateLink(state.get() at '/" + initialValue[ProxyMarkerID].path.join('/') + "')", RootPath, 'did you mean to use create/useStateLink(state) OR ' +
            'create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?');
    }
    return new State(initialValue);
}
function useSubscribedStateLink(state, path, update, subscribeTarget, disabledTracking, onDestroy) {
    var link = new StateLinkImpl(state, path, update, state.get(path), state.edition);
    if (disabledTracking) {
        link.with(Degraded);
    }
    useIsomorphicLayoutEffect(function () {
        subscribeTarget.subscribe(link);
        return function () { return subscribeTarget.unsubscribe(link); };
    });
    React.useEffect(function () { return function () { return onDestroy(); }; }, []);
    return link;
}
function useGlobalStateLink(stateRef) {
    var _a = React.useState({}), setValue = _a[1];
    return useSubscribedStateLink(stateRef.state, RootPath, function () { return setValue({}); }, stateRef.state, stateRef.disabledTracking, function () { });
}
function useLocalStateLink(initialState) {
    var _a = React.useState(function () { return ({ state: createState(initialState) }); }), value = _a[0], setValue = _a[1];
    return useSubscribedStateLink(value.state, RootPath, function () { return setValue({ state: value.state }); }, value.state, undefined, function () { return value.state.destroy(); });
}
function useScopedStateLink(originLink) {
    var _a = React.useState({}), setValue = _a[1];
    return useSubscribedStateLink(originLink.state, originLink.path, function () { return setValue({}); }, originLink, originLink.disabledTracking, function () { });
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
    if (link.onUpdateUsed === undefined) {
        // this is unmounted link
        return transform(link, undefined);
    }
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
        var overidingLink = new StateLinkImpl(link.state, link.path, link.onUpdateUsed, link.state.get(link.path), link.state.edition);
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
    var link = new StateLinkImpl(stateRef.state, RootPath, undefined, stateRef.state.get(RootPath), stateRef.state.edition).with(Degraded); // it does not matter how it is used, it is not subscribed anyway
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
/**
 * @deprecated: use Degraded instead
 */
// tslint:disable-next-line: function-name
function DisabledTracking() {
    return Degraded();
}
// tslint:disable-next-line: function-name
function Degraded() {
    return {
        id: DegradedID,
        instanceFactory: function () { return ({}); }
    };
}

export { Degraded, DisabledTracking, StateFragment, StateMemo, createStateLink, useStateLink, useStateLinkUnmounted };
//# sourceMappingURL=index.es.js.map
