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

/**
 * Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.
 *
 * [Learn more...](https://hookstate.js.org/docs/asynchronous-state#executing-an-action-when-state-is-loaded)
 */
var postpone = Symbol('postpone');
/**
 * Special symbol which might be used to delete properties
 * from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).
 *
 * [Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)
 */
var none = Symbol('none');
/**
 * Creates new state and returns it.
 *
 * You can create as many global states as you need.
 *
 * When you the state is not needed anymore,
 * it should be destroyed by calling
 * `destroy()` method of the returned instance.
 * This is necessary for some plugins,
 * which allocate native resources,
 * like subscription to databases, broadcast channels, etc.
 * In most cases, a global state is used during
 * whole life time of an application and would not require
 * destruction. However, if you have got, for example,
 * a catalog of dynamically created and destroyed global states,
 * the states should be destroyed as advised above.
 *
 * @param initial Initial value of the state.
 * It can be a value OR a promise,
 * which asynchronously resolves to a value,
 * OR a function returning a value or a promise.
 *
 * @typeparam S Type of a value of the state
 *
 * @returns [State](#state) instance,
 * which can be used directly to get and set state value
 * outside of React components.
 * When you need to use the state in a functional `React` component,
 * pass the created state to [useState](#usestate) function and
 * use the returned result in the component's logic.
 */
function createState(initial) {
    var methods = createStore(initial).toMethods();
    var devtools = createState[DevToolsID];
    if (devtools) {
        methods.attach(devtools);
    }
    return methods.self;
}
function useState(source) {
    return useHookstate(source);
}
function useHookstate(source) {
    var parentMethods = typeof source === 'object' && source !== null ?
        source[self] :
        undefined;
    if (parentMethods) {
        if (parentMethods.isMounted) {
            // Scoped state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _a = React.useState({}), setValue_1 = _a[1];
            return useSubscribedStateMethods(parentMethods.state, parentMethods.path, function () { return setValue_1({}); }, parentMethods).self;
        }
        else {
            // Global state mount or destroyed link
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _b = React.useState({ state: parentMethods.state }), value_1 = _b[0], setValue_2 = _b[1];
            var state = useSubscribedStateMethods(value_1.state, RootPath, function () { return setValue_2({ state: value_1.state }); }, value_1.state).self;
            for (var ind = 0; ind < parentMethods.path.length; ind += 1) {
                state = state.nested(parentMethods.path[ind]);
            }
            return state;
        }
    }
    else {
        // Local state mount
        // eslint-disable-next-line react-hooks/rules-of-hooks
        var _c = React.useState(function () { return ({ state: createStore(source) }); }), value_2 = _c[0], setValue_3 = _c[1];
        var result = useSubscribedStateMethods(value_2.state, RootPath, function () { return setValue_3({ state: value_2.state }); }, value_2.state);
        if (isDevelopmentMode) {
            // This is a workaround for the issue:
            // https://github.com/avkonst/hookstate/issues/109
            // See technical notes on React behavior here:
            // https://github.com/apollographql/apollo-client/issues/5870#issuecomment-689098185
            var isEffectExecutedAfterRender_1 = React.useRef(false);
            isEffectExecutedAfterRender_1.current = false; // not yet...
            React.useEffect(function () {
                isEffectExecutedAfterRender_1.current = true; // ... and now, yes!
                // The state is not destroyed intentionally
                // under hot reload case.
                return function () { isEffectExecutedAfterRender_1.current && value_2.state.destroy(); };
            });
        }
        else {
            React.useEffect(function () { return function () { return value_2.state.destroy(); }; }, []);
        }
        var devtools = useState[DevToolsID];
        if (devtools) {
            result.attach(devtools);
        }
        return result.self;
    }
}
function StateFragment(props) {
    var scoped = useState(props.state);
    return props.children(scoped);
}
/**
 * A plugin which allows to opt-out from usage of Javascript proxies for
 * state usage tracking. It is useful for performance tuning.
 *
 * [Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)
 */
function Downgraded() {
    return {
        id: DowngradedID
    };
}
/**
 * For plugin developers only.
 * Reserved plugin ID for developers tools extension.
 *
 * @hidden
 * @ignore
 */
var DevToolsID = Symbol('DevTools');
/**
 * Returns access to the development tools for a given state.
 * Development tools are delivered as optional plugins.
 * You can activate development tools from `@hookstate/devtools`package,
 * for example. If no development tools are activated,
 * it returns an instance of dummy tools, which do nothing, when called.
 *
 * [Learn more...](https://hookstate.js.org/docs/devtools)
 *
 * @param state A state to relate to the extension.
 *
 * @returns Interface to interact with the development tools for a given state.
 *
 * @typeparam S Type of a value of a state
 */
function DevTools(state) {
    var plugin = state.attach(DevToolsID);
    if (plugin[0] instanceof Error) {
        return EmptyDevToolsExtensions;
    }
    return plugin[0];
}
///
/// INTERNAL SYMBOLS (LIBRARY IMPLEMENTATION)
///
var isDevelopmentMode = typeof process === 'object' &&
    typeof process.env === 'object' &&
    process.env.NODE_ENV === 'development';
var self = Symbol('self');
var EmptyDevToolsExtensions = {
    label: function () { },
    log: function () { }
};
var ErrorId;
(function (ErrorId) {
    ErrorId[ErrorId["InitStateToValueFromState"] = 101] = "InitStateToValueFromState";
    ErrorId[ErrorId["SetStateToValueFromState"] = 102] = "SetStateToValueFromState";
    ErrorId[ErrorId["GetStateWhenPromised"] = 103] = "GetStateWhenPromised";
    ErrorId[ErrorId["SetStateWhenPromised"] = 104] = "SetStateWhenPromised";
    ErrorId[ErrorId["SetStateNestedToPromised"] = 105] = "SetStateNestedToPromised";
    ErrorId[ErrorId["SetStateWhenDestroyed"] = 106] = "SetStateWhenDestroyed";
    ErrorId[ErrorId["ToJson_Value"] = 108] = "ToJson_Value";
    ErrorId[ErrorId["ToJson_State"] = 109] = "ToJson_State";
    ErrorId[ErrorId["GetUnknownPlugin"] = 120] = "GetUnknownPlugin";
    ErrorId[ErrorId["SetProperty_State"] = 201] = "SetProperty_State";
    ErrorId[ErrorId["SetProperty_Value"] = 202] = "SetProperty_Value";
    ErrorId[ErrorId["SetPrototypeOf_State"] = 203] = "SetPrototypeOf_State";
    ErrorId[ErrorId["SetPrototypeOf_Value"] = 204] = "SetPrototypeOf_Value";
    ErrorId[ErrorId["PreventExtensions_State"] = 205] = "PreventExtensions_State";
    ErrorId[ErrorId["PreventExtensions_Value"] = 206] = "PreventExtensions_Value";
    ErrorId[ErrorId["DefineProperty_State"] = 207] = "DefineProperty_State";
    ErrorId[ErrorId["DefineProperty_Value"] = 208] = "DefineProperty_Value";
    ErrorId[ErrorId["DeleteProperty_State"] = 209] = "DeleteProperty_State";
    ErrorId[ErrorId["DeleteProperty_Value"] = 210] = "DeleteProperty_Value";
    ErrorId[ErrorId["Construct_State"] = 211] = "Construct_State";
    ErrorId[ErrorId["Construct_Value"] = 212] = "Construct_Value";
    ErrorId[ErrorId["Apply_State"] = 213] = "Apply_State";
    ErrorId[ErrorId["Apply_Value"] = 214] = "Apply_Value";
})(ErrorId || (ErrorId = {}));
var StateInvalidUsageError = /** @class */ (function (_super) {
    __extends(StateInvalidUsageError, _super);
    function StateInvalidUsageError(path, id, details) {
        return _super.call(this, "Error: HOOKSTATE-" + id + " [path: /" + path.join('/') + (details ? ", details: " + details : '') + "]. " +
            ("See https://hookstate.js.org/docs/exceptions#hookstate-" + id)) || this;
    }
    return StateInvalidUsageError;
}(Error));
function isNoProxyInitializer() {
    try {
        var used = new Proxy({}, {});
        return false;
    }
    catch (e) {
        return true;
    }
}
var IsNoProxy = isNoProxyInitializer();
var DowngradedID = Symbol('Downgraded');
var SelfMethodsID = Symbol('ProxyMarker');
var RootPath = [];
var DestroyedEdition = -1;
var Store = /** @class */ (function () {
    function Store(_value) {
        this._value = _value;
        this._edition = 0;
        this._subscribers = new Set();
        this._setSubscribers = new Set();
        this._destroySubscribers = new Set();
        this._batchStartSubscribers = new Set();
        this._batchFinishSubscribers = new Set();
        this._plugins = new Map();
        this._batches = 0;
        if (typeof _value === 'object' &&
            Promise.resolve(_value) === _value) {
            this._promised = this.createPromised(_value);
            this._value = none;
        }
        else if (_value === none) {
            this._promised = this.createPromised(undefined);
        }
    }
    Store.prototype.createPromised = function (newValue) {
        var _this = this;
        var promised = new Promised(newValue ? Promise.resolve(newValue) : undefined, function (r) {
            if (_this.promised === promised && _this.edition !== DestroyedEdition) {
                _this._promised = undefined;
                _this.set(RootPath, r, undefined);
                _this.update([RootPath]);
            }
        }, function () {
            if (_this.promised === promised && _this.edition !== DestroyedEdition) {
                _this._edition += 1;
                _this.update([RootPath]);
            }
        }, function () {
            if (_this._batchesPendingActions &&
                _this._value !== none &&
                _this.edition !== DestroyedEdition) {
                var actions = _this._batchesPendingActions;
                _this._batchesPendingActions = undefined;
                actions.forEach(function (a) { return a(); });
            }
        });
        return promised;
    };
    Object.defineProperty(Store.prototype, "edition", {
        get: function () {
            return this._edition;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "promised", {
        get: function () {
            return this._promised;
        },
        enumerable: false,
        configurable: true
    });
    Store.prototype.get = function (path) {
        var result = this._value;
        if (result === none) {
            return result;
        }
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    Store.prototype.set = function (path, value, mergeValue) {
        if (this._edition < 0) {
            throw new StateInvalidUsageError(path, ErrorId.SetStateWhenDestroyed);
        }
        if (path.length === 0) {
            // Root value UPDATE case,
            var onSetArg = {
                path: path,
                state: value,
                value: value,
                previous: this._value,
                merged: mergeValue
            };
            if (value === none) {
                this._promised = this.createPromised(undefined);
                delete onSetArg.value;
                delete onSetArg.state;
            }
            else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = this.createPromised(value);
                value = none;
                delete onSetArg.value;
                delete onSetArg.state;
            }
            else if (this._promised && (!this._promised.resolver && !this._promised.fullfilled)) {
                throw new StateInvalidUsageError(path, ErrorId.SetStateWhenPromised);
            }
            var prevValue = this._value;
            if (prevValue === none) {
                delete onSetArg.previous;
            }
            this._value = value;
            this.afterSet(onSetArg);
            if (prevValue === none && this._value !== none &&
                this.promised && this.promised.resolver) {
                this.promised.resolver(this._value);
            }
            return path;
        }
        if (typeof value === 'object' && Promise.resolve(value) === value) {
            throw new StateInvalidUsageError(path, ErrorId.SetStateNestedToPromised);
        }
        var target = this._value;
        for (var i = 0; i < path.length - 1; i += 1) {
            target = target[path[i]];
        }
        var p = path[path.length - 1];
        if (p in target) {
            if (value !== none) {
                // Property UPDATE case
                var prevValue = target[p];
                target[p] = value;
                this.afterSet({
                    path: path,
                    state: this._value,
                    value: value,
                    previous: prevValue,
                    merged: mergeValue
                });
                return path;
            }
            else {
                // Property DELETE case
                var prevValue = target[p];
                if (Array.isArray(target) && typeof p === 'number') {
                    target.splice(p, 1);
                }
                else {
                    delete target[p];
                }
                this.afterSet({
                    path: path,
                    state: this._value,
                    previous: prevValue,
                    merged: mergeValue
                });
                // if an array of objects is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return path.slice(0, -1);
            }
        }
        if (value !== none) {
            // Property INSERT case
            target[p] = value;
            this.afterSet({
                path: path,
                state: this._value,
                value: value,
                merged: mergeValue
            });
            // if an array of objects is about to be extended by new property
            // we consider it is the whole object is changed
            // which is identified by upper path
            return path.slice(0, -1);
        }
        // Non-existing property DELETE case
        // no-op
        return path;
    };
    Store.prototype.update = function (paths) {
        if (this._batches) {
            this._batchesPendingPaths = this._batchesPendingPaths || [];
            this._batchesPendingPaths = this._batchesPendingPaths.concat(paths);
            return;
        }
        var actions = [];
        this._subscribers.forEach(function (s) { return s.onSet(paths, actions); });
        actions.forEach(function (a) { return a(); });
    };
    Store.prototype.afterSet = function (params) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(function (cb) { return cb(params); });
        }
    };
    Store.prototype.startBatch = function (path, options) {
        this._batches += 1;
        var cbArgument = {
            path: path
        };
        if (options && 'context' in options) {
            cbArgument.context = options.context;
        }
        if (this._value !== none) {
            cbArgument.state = this._value;
        }
        this._batchStartSubscribers.forEach(function (cb) { return cb(cbArgument); });
    };
    Store.prototype.finishBatch = function (path, options) {
        var cbArgument = {
            path: path
        };
        if (options && 'context' in options) {
            cbArgument.context = options.context;
        }
        if (this._value !== none) {
            cbArgument.state = this._value;
        }
        this._batchFinishSubscribers.forEach(function (cb) { return cb(cbArgument); });
        this._batches -= 1;
        if (this._batches === 0) {
            if (this._batchesPendingPaths) {
                var paths = this._batchesPendingPaths;
                this._batchesPendingPaths = undefined;
                this.update(paths);
            }
        }
    };
    Store.prototype.postponeBatch = function (action) {
        this._batchesPendingActions = this._batchesPendingActions || [];
        this._batchesPendingActions.push(action);
    };
    Store.prototype.getPlugin = function (pluginId) {
        return this._plugins.get(pluginId);
    };
    Store.prototype.register = function (plugin) {
        var existingInstance = this._plugins.get(plugin.id);
        if (existingInstance) {
            return;
        }
        var pluginCallbacks = plugin.init ? plugin.init(this.toMethods().self) : {};
        this._plugins.set(plugin.id, pluginCallbacks);
        if (pluginCallbacks.onSet) {
            this._setSubscribers.add(function (p) { return pluginCallbacks.onSet(p); });
        }
        if (pluginCallbacks.onDestroy) {
            this._destroySubscribers.add(function (p) { return pluginCallbacks.onDestroy(p); });
        }
        if (pluginCallbacks.onBatchStart) {
            this._batchStartSubscribers.add(function (p) { return pluginCallbacks.onBatchStart(p); });
        }
        if (pluginCallbacks.onBatchFinish) {
            this._batchFinishSubscribers.add(function (p) { return pluginCallbacks.onBatchFinish(p); });
        }
    };
    Store.prototype.toMethods = function () {
        return new StateMethodsImpl(this, RootPath, this.get(RootPath), this.edition, OnSetUsedNoAction);
    };
    Store.prototype.subscribe = function (l) {
        this._subscribers.add(l);
    };
    Store.prototype.unsubscribe = function (l) {
        this._subscribers.delete(l);
    };
    Store.prototype.destroy = function () {
        var _this = this;
        this._destroySubscribers.forEach(function (cb) { return cb(_this._value !== none ? { state: _this._value } : {}); });
        this._edition = DestroyedEdition;
    };
    Store.prototype.toJSON = function () {
        throw new StateInvalidUsageError(RootPath, ErrorId.ToJson_Value);
    };
    return Store;
}());
var Promised = /** @class */ (function () {
    function Promised(promise, onResolve, onReject, onPostResolve) {
        var _this = this;
        this.promise = promise;
        if (!promise) {
            promise = new Promise(function (resolve) {
                _this.resolver = resolve;
            });
        }
        this.promise = promise
            .then(function (r) {
            _this.fullfilled = true;
            if (!_this.resolver) {
                onResolve(r);
            }
        })
            .catch(function (err) {
            _this.fullfilled = true;
            _this.error = err;
            onReject();
        })
            .then(function () { return onPostResolve(); });
    }
    return Promised;
}());
// use symbol property to allow for easier reference finding
var ValueUnusedMarker = Symbol('ValueUnusedMarker');
function OnSetUsedNoAction() { }
// use symbol to mark that a function has no effect anymore
var UnmountedMarker = Symbol('UnmountedMarker');
OnSetUsedNoAction[UnmountedMarker] = true;
var StateMethodsImpl = /** @class */ (function () {
    function StateMethodsImpl(state, path, valueSource, valueEdition, onSetUsed) {
        this.state = state;
        this.path = path;
        this.valueSource = valueSource;
        this.valueEdition = valueEdition;
        this.onSetUsed = onSetUsed;
        this.valueCache = ValueUnusedMarker;
    }
    StateMethodsImpl.prototype.getUntracked = function (allowPromised) {
        if (this.valueEdition !== this.state.edition) {
            this.valueSource = this.state.get(this.path);
            this.valueEdition = this.state.edition;
            if (this.isMounted) {
                // this link is still mounted to a component
                // populate cache again to ensure correct tracking of usage
                // when React scans which states to rerender on update
                if (this.valueCache !== ValueUnusedMarker) {
                    this.valueCache = ValueUnusedMarker;
                    this.get(true); // renew cache to keep it marked used
                }
            }
            else {
                // This link is not mounted to a component
                // for example, it might be global link or
                // a link which has been discarded after rerender
                // but still captured by some callback or an effect.
                // If we are here and if it was mounted before,
                // it means it has not been garbage collected
                // when a component unmounted.
                // We take this opportunity to clean up caches
                // to avoid memory leaks via stale children states cache.
                this.valueCache = ValueUnusedMarker;
                delete this.childrenCache;
                delete this.selfCache;
            }
        }
        if (this.valueSource === none && !allowPromised) {
            if (this.state.promised && this.state.promised.error) {
                throw this.state.promised.error;
            }
            throw new StateInvalidUsageError(this.path, ErrorId.GetStateWhenPromised);
        }
        return this.valueSource;
    };
    StateMethodsImpl.prototype.get = function (allowPromised) {
        var currentValue = this.getUntracked(allowPromised);
        if (this.valueCache === ValueUnusedMarker) {
            if (this.isDowngraded) {
                this.valueCache = currentValue;
            }
            else if (Array.isArray(currentValue)) {
                this.valueCache = this.valueArrayImpl(currentValue);
            }
            else if (typeof currentValue === 'object' && currentValue !== null) {
                this.valueCache = this.valueObjectImpl(currentValue);
            }
            else {
                this.valueCache = currentValue;
            }
        }
        return this.valueCache;
    };
    Object.defineProperty(StateMethodsImpl.prototype, "value", {
        get: function () {
            return this.get();
        },
        enumerable: false,
        configurable: true
    });
    StateMethodsImpl.prototype.setUntracked = function (newValue, mergeValue) {
        if (typeof newValue === 'function') {
            newValue = newValue(this.getUntracked());
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[SelfMethodsID]) {
            throw new StateInvalidUsageError(this.path, ErrorId.SetStateToValueFromState);
        }
        return [this.state.set(this.path, newValue, mergeValue)];
    };
    StateMethodsImpl.prototype.set = function (newValue) {
        this.state.update(this.setUntracked(newValue));
    };
    StateMethodsImpl.prototype.mergeUntracked = function (sourceValue) {
        var currentValue = this.getUntracked();
        if (typeof sourceValue === 'function') {
            sourceValue = sourceValue(currentValue);
        }
        var updatedPaths;
        var deletedOrInsertedProps = false;
        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                return this.setUntracked(currentValue.concat(sourceValue), sourceValue);
            }
            else {
                var deletedIndexes_1 = [];
                Object.keys(sourceValue).sort().forEach(function (i) {
                    var index = Number(i);
                    var newPropValue = sourceValue[index];
                    if (newPropValue === none) {
                        deletedOrInsertedProps = true;
                        deletedIndexes_1.push(index);
                    }
                    else {
                        deletedOrInsertedProps = deletedOrInsertedProps || !(index in currentValue);
                        currentValue[index] = newPropValue;
                    }
                });
                // indexes are ascending sorted as per above
                // so, delete one by one from the end
                // this way index positions do not change
                deletedIndexes_1.reverse().forEach(function (p) {
                    currentValue.splice(p, 1);
                });
                updatedPaths = this.setUntracked(currentValue, sourceValue);
            }
        }
        else if (typeof currentValue === 'object' && currentValue !== null) {
            Object.keys(sourceValue).forEach(function (key) {
                var newPropValue = sourceValue[key];
                if (newPropValue === none) {
                    deletedOrInsertedProps = true;
                    delete currentValue[key];
                }
                else {
                    deletedOrInsertedProps = deletedOrInsertedProps || !(key in currentValue);
                    currentValue[key] = newPropValue;
                }
            });
            updatedPaths = this.setUntracked(currentValue, sourceValue);
        }
        else if (typeof currentValue === 'string') {
            return this.setUntracked((currentValue + String(sourceValue)), sourceValue);
        }
        else {
            return this.setUntracked(sourceValue);
        }
        if (updatedPaths.length !== 1 || updatedPaths[0] !== this.path || deletedOrInsertedProps) {
            return updatedPaths;
        }
        var updatedPath = updatedPaths[0];
        return Object.keys(sourceValue).map(function (p) { return updatedPath.slice().concat(p); });
    };
    StateMethodsImpl.prototype.merge = function (sourceValue) {
        this.state.update(this.mergeUntracked(sourceValue));
    };
    StateMethodsImpl.prototype.nested = function (key) {
        return this.child(key).self;
    };
    StateMethodsImpl.prototype.rerender = function (paths) {
        this.state.update(paths);
    };
    StateMethodsImpl.prototype.destroy = function () {
        this.state.destroy();
    };
    StateMethodsImpl.prototype.subscribe = function (l) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    };
    StateMethodsImpl.prototype.unsubscribe = function (l) {
        this.subscribers.delete(l);
    };
    Object.defineProperty(StateMethodsImpl.prototype, "isMounted", {
        get: function () {
            return !this.onSetUsed[UnmountedMarker];
        },
        enumerable: false,
        configurable: true
    });
    StateMethodsImpl.prototype.onUnmount = function () {
        this.onSetUsed[UnmountedMarker] = true;
    };
    StateMethodsImpl.prototype.onSet = function (paths, actions) {
        var _this = this;
        var update = function () {
            if (_this.isDowngraded && _this.valueCache !== ValueUnusedMarker) {
                actions.push(_this.onSetUsed);
                return true;
            }
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var path = paths_1[_i];
                var firstChildKey = path[_this.path.length];
                if (firstChildKey === undefined) {
                    if (_this.valueCache !== ValueUnusedMarker) {
                        actions.push(_this.onSetUsed);
                        return true;
                    }
                }
                else {
                    var firstChildValue = _this.childrenCache && _this.childrenCache[firstChildKey];
                    if (firstChildValue && firstChildValue.onSet(paths, actions)) {
                        return true;
                    }
                }
            }
            return false;
        };
        var updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(function (s) {
                s.onSet(paths, actions);
            });
        }
        return updated;
    };
    Object.defineProperty(StateMethodsImpl.prototype, "keys", {
        get: function () {
            var value = this.get();
            if (Array.isArray(value)) {
                return Object.keys(value).map(function (i) { return Number(i); }).filter(function (i) { return Number.isInteger(i); });
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value);
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    StateMethodsImpl.prototype.child = function (key) {
        // if this state is not mounted to a hook,
        // we do not cache children to avoid unnecessary memory leaks
        if (this.isMounted) {
            this.childrenCache = this.childrenCache || {};
            var cachehit = this.childrenCache[key];
            if (cachehit) {
                return cachehit;
            }
        }
        var r = new StateMethodsImpl(this.state, this.path.slice().concat(key), this.valueSource[key], this.valueEdition, this.onSetUsed);
        if (this.isDowngraded) {
            r.isDowngraded = true;
        }
        if (this.childrenCache) {
            this.childrenCache[key] = r;
        }
        return r;
    };
    StateMethodsImpl.prototype.valueArrayImpl = function (currentValue) {
        var _this = this;
        if (IsNoProxy) {
            this.isDowngraded = true;
            return currentValue;
        }
        return proxyWrap(this.path, currentValue, function () { return currentValue; }, function (target, key) {
            if (key === 'length') {
                return target.length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            if (key === SelfMethodsID) {
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
            return _this.child(index).get();
        }, function (target, key, value) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                target[key] = value;
                return true;
            }
            throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
        }, true);
    };
    StateMethodsImpl.prototype.valueObjectImpl = function (currentValue) {
        var _this = this;
        if (IsNoProxy) {
            this.isDowngraded = true;
            return currentValue;
        }
        return proxyWrap(this.path, currentValue, function () { return currentValue; }, function (target, key) {
            if (key === SelfMethodsID) {
                return _this;
            }
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                return target[key];
            }
            return _this.child(key).get();
        }, function (target, key, value) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                target[key] = value;
                return true;
            }
            throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
        }, true);
    };
    Object.defineProperty(StateMethodsImpl.prototype, "self", {
        get: function () {
            var _this = this;
            if (this.selfCache) {
                return this.selfCache;
            }
            var getter = function (_, key) {
                if (key === self) {
                    return _this;
                }
                if (typeof key === 'symbol') {
                    return undefined;
                }
                if (key === 'toJSON') {
                    throw new StateInvalidUsageError(_this.path, ErrorId.ToJson_State);
                }
                var nestedGetter = function (prop) {
                    var currentDowngraded = _this.isDowngraded; // relevant for IE11 only
                    var currentValue = _this.get(); // IE11 marks this as downgraded
                    _this.isDowngraded = currentDowngraded; // relevant for IE11 only
                    if ( // if currentValue is primitive type
                    (typeof currentValue !== 'object' || currentValue === null) &&
                        // if promised, it will be none
                        currentValue !== none) {
                        // This was an error case, but various tools like webpack bundler
                        // and react dev tools attempt to get props out of non-null object,
                        // so this was changed to return just undefined for any property request
                        // as there is no way to fix 3rd party tools.
                        // Logging a warning to console is also not an option
                        // as it pollutes console for legitimate apps on app start app.
                        // Ref: https://github.com/avkonst/hookstate/issues/125
                        return undefined;
                    }
                    if (Array.isArray(currentValue)) {
                        if (prop === 'length') {
                            return currentValue.length;
                        }
                        if (prop in Array.prototype) {
                            return Array.prototype[prop];
                        }
                        var index = Number(prop);
                        if (!Number.isInteger(index)) {
                            return undefined;
                        }
                        return _this.nested(index);
                    }
                    return _this.nested(prop.toString());
                };
                switch (key) {
                    case 'path':
                        return _this.path;
                    case 'keys':
                        return _this.keys;
                    case 'value':
                        return _this.value;
                    case 'ornull':
                        return _this.ornull;
                    case 'promised':
                        return _this.promised;
                    case 'error':
                        return _this.error;
                    case 'get':
                        return function () { return _this.get(); };
                    case 'set':
                        return function (p) { return _this.set(p); };
                    case 'merge':
                        return function (p) { return _this.merge(p); };
                    case 'nested':
                        return function (p) { return nestedGetter(p); };
                    case 'batch':
                        // tslint:disable-next-line: no-any
                        return function (action, context) { return _this.batch(action, context); };
                    case 'attach':
                        return function (p) { return _this.attach(p); };
                    case 'destroy':
                        return function () { return _this.destroy(); };
                    default:
                        return nestedGetter(key);
                }
            };
            if (IsNoProxy) {
                // minimal support for IE11
                var result_1 = (Array.isArray(this.valueSource) ? [] : {});
                [self, 'toJSON', 'path', 'keys', 'value', 'ornull',
                    'promised', 'error', 'get', 'set', 'merge',
                    'nested', 'batch', 'attach', 'destroy']
                    .forEach(function (key) {
                    Object.defineProperty(result_1, key, {
                        get: function () { return getter(result_1, key); }
                    });
                });
                if (typeof this.valueSource === 'object' && this.valueSource !== null) {
                    Object.keys(this.valueSource).forEach(function (key) {
                        Object.defineProperty(result_1, key, {
                            enumerable: true,
                            get: function () { return getter(result_1, key); }
                        });
                    });
                }
                this.selfCache = result_1;
                return this.selfCache;
            }
            this.selfCache = proxyWrap(this.path, this.valueSource, function () {
                _this.get(); // get latest & mark used
                return _this.valueSource;
            }, getter, function (_, key, value) {
                throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_State);
            }, false);
            return this.selfCache;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMethodsImpl.prototype, "promised", {
        get: function () {
            var currentValue = this.get(true); // marks used
            if (currentValue === none && this.state.promised && !this.state.promised.fullfilled) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMethodsImpl.prototype, "error", {
        get: function () {
            var currentValue = this.get(true); // marks used
            if (currentValue === none) {
                if (this.state.promised && this.state.promised.fullfilled) {
                    return this.state.promised.error;
                }
                this.get(); // will throw 'read while promised' exception
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    StateMethodsImpl.prototype.batch = function (action, context) {
        var _this = this;
        var opts = { context: context };
        try {
            this.state.startBatch(this.path, opts);
            var result = action(this.self);
            if (result === postpone) {
                this.state.postponeBatch(function () { return _this.batch(action, context); });
            }
            return result;
        }
        finally {
            this.state.finishBatch(this.path, opts);
        }
    };
    Object.defineProperty(StateMethodsImpl.prototype, "ornull", {
        get: function () {
            var value = this.get();
            if (value === null || value === undefined) {
                return value;
            }
            return this.self;
        },
        enumerable: false,
        configurable: true
    });
    StateMethodsImpl.prototype.attach = function (p) {
        if (typeof p === 'function') {
            var pluginMeta = p();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                if (this.valueCache !== ValueUnusedMarker) {
                    var currentValue = this.getUntracked(true);
                    this.valueCache = currentValue;
                }
                return this.self;
            }
            this.state.register(pluginMeta);
            return this.self;
        }
        else {
            return [
                this.state.getPlugin(p) ||
                    (new StateInvalidUsageError(this.path, ErrorId.GetUnknownPlugin, p.toString())),
                this
            ];
        }
    };
    return StateMethodsImpl;
}());
function proxyWrap(path, 
// tslint:disable-next-line: no-any
targetBootstrap, 
// tslint:disable-next-line: no-any
targetGetter, 
// tslint:disable-next-line: no-any
propertyGetter, 
// tslint:disable-next-line: no-any
propertySetter, isValueProxy) {
    var onInvalidUsage = function (op) {
        throw new StateInvalidUsageError(path, op);
    };
    if (typeof targetBootstrap !== 'object' || targetBootstrap === null) {
        targetBootstrap = {};
    }
    return new Proxy(targetBootstrap, {
        getPrototypeOf: function (target) {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getPrototypeOf#Invariants
            var targetReal = targetGetter();
            if (targetReal === undefined || targetReal === null) {
                return null;
            }
            return Object.getPrototypeOf(targetReal);
        },
        setPrototypeOf: function (target, v) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.SetPrototypeOf_State :
                ErrorId.SetPrototypeOf_Value);
        },
        isExtensible: function (target) {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
            return true; // required to satisfy the invariants of the getPrototypeOf
            // return Object.isExtensible(target);
        },
        preventExtensions: function (target) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.PreventExtensions_State :
                ErrorId.PreventExtensions_Value);
        },
        getOwnPropertyDescriptor: function (target, p) {
            var targetReal = targetGetter();
            if (targetReal === undefined || targetReal === null) {
                return undefined;
            }
            var origin = Object.getOwnPropertyDescriptor(targetReal, p);
            if (origin && Array.isArray(targetReal) && p in Array.prototype) {
                return origin;
            }
            return origin && {
                configurable: true,
                enumerable: origin.enumerable,
                get: function () { return propertyGetter(targetReal, p); },
                set: undefined
            };
        },
        has: function (target, p) {
            if (typeof p === 'symbol') {
                return false;
            }
            var targetReal = targetGetter();
            if (typeof targetReal === 'object' && targetReal !== null) {
                return p in targetReal;
            }
            return false;
        },
        get: propertyGetter,
        set: propertySetter,
        deleteProperty: function (target, p) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.DeleteProperty_State :
                ErrorId.DeleteProperty_Value);
        },
        defineProperty: function (target, p, attributes) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.DefineProperty_State :
                ErrorId.DefineProperty_Value);
        },
        ownKeys: function (target) {
            var targetReal = targetGetter();
            if (Array.isArray(targetReal)) {
                return Object.keys(targetReal).concat('length');
            }
            if (targetReal === undefined || targetReal === null) {
                return [];
            }
            return Object.keys(targetReal);
        },
        apply: function (target, thisArg, argArray) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Apply_State :
                ErrorId.Apply_Value);
        },
        construct: function (target, argArray, newTarget) {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Construct_State :
                ErrorId.Construct_Value);
        }
    });
}
function createStore(initial) {
    var initialValue = initial;
    if (typeof initial === 'function') {
        initialValue = initial();
    }
    if (typeof initialValue === 'object' && initialValue !== null && initialValue[SelfMethodsID]) {
        throw new StateInvalidUsageError(RootPath, ErrorId.InitStateToValueFromState);
    }
    return new Store(initialValue);
}
// Do not try to use useLayoutEffect if DOM not available (SSR)
var useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
function useSubscribedStateMethods(state, path, update, subscribeTarget) {
    var link = new StateMethodsImpl(state, path, state.get(path), state.edition, update);
    // useLayoutEffect here instead of useEffect because of this issue:
    // https://github.com/avkonst/hookstate/issues/165#issuecomment-824670930
    // and very likely this issue:
    // https://github.com/avkonst/hookstate/issues/186
    // and probably this issue:
    // https://github.com/avkonst/hookstate/issues/145
    // useIsomorphicLayout for below issue when page is SSR
    // https://github.com/avkonst/hookstate/issues/223
    useIsomorphicLayoutEffect(function () {
        subscribeTarget.subscribe(link);
        return function () {
            link.onUnmount();
            subscribeTarget.unsubscribe(link);
        };
    });
    return link;
}

export { DevTools, DevToolsID, Downgraded, StateFragment, createState, none, postpone, useHookstate, useState };
//# sourceMappingURL=index.es.js.map
