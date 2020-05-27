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
 * Special symbol which is used as a property to switch
 * between [StateMethods](#interfacesstatemethodsmd) and the corresponding [State](#state).
 */
var self = Symbol('self');
/**
 * Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.
 */
var postpone = Symbol('postpone');
/**
 * Special symbol which might be used to delete properties
 * from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).
 */
var none = Symbol('none');
function createStateLink(initial, transform) {
    var stateLink = createStore(initial).accessUnmounted();
    if (createStateLink[DevToolsID]) {
        stateLink.with(createStateLink[DevToolsID]);
    }
    if (transform) {
        return stateLink.wrap(transform);
    }
    return stateLink;
}
function useStateLink(source, transform) {
    var _a = source instanceof StateLinkImpl ?
        [source, transform] :
        source instanceof WrappedStateLinkImpl ?
            [source.state, source.transform] :
            [undefined, transform], parentLink = _a[0], tf = _a[1];
    if (parentLink) {
        if (parentLink.onUpdateUsed === NoActionOnUpdate) {
            // Global state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _b = React.useState({ state: parentLink.state }), value_1 = _b[0], setValue_1 = _b[1];
            var link = useSubscribedStateLink(value_1.state, parentLink.path, function () { return setValue_1({ state: value_1.state }); }, value_1.state, undefined);
            return tf ? injectTransform(link, tf) : link;
        }
        else {
            // Scoped state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _c = React.useState({}), setValue_2 = _c[1];
            var link = useSubscribedStateLink(parentLink.state, parentLink.path, function () { return setValue_2({}); }, parentLink, parentLink.isDowngraded);
            return tf ? injectTransform(link, tf) : link;
        }
    }
    else {
        // Local state mount
        // eslint-disable-next-line react-hooks/rules-of-hooks
        var _d = React.useState(function () { return ({ state: createStore(source) }); }), value_2 = _d[0], setValue_3 = _d[1];
        var link = useSubscribedStateLink(value_2.state, RootPath, function () { return setValue_3({ state: value_2.state }); }, value_2.state, undefined);
        React.useEffect(function () { return function () { return value_2.state.destroy(); }; }, []);
        if (useStateLink[DevToolsID]) {
            link.with(useStateLink[DevToolsID]);
        }
        return tf ? injectTransform(link, tf) : link;
    }
}
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
    var stateLink = createStateLink(initial);
    if (createState[DevToolsID]) {
        stateLink.attach(createState[DevToolsID]);
    }
    return stateLink[self];
}
function useState(source) {
    var sourceIsInitialValue = true;
    if (typeof source === 'object' && source !== null) {
        var sl = source[StateMarkerID];
        if (sl) {
            // it is already state object
            source = sl; // get underlying StateLink
            sourceIsInitialValue = false;
        }
    }
    var statelink = useStateLink(source);
    if (sourceIsInitialValue && useState[DevToolsID]) {
        statelink.attach(useState[DevToolsID]);
    }
    return statelink[self];
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
function StateFragment(props) {
    if (props.state[StateMarkerID]) {
        var scoped = useState(props.state);
        return props.children(scoped);
    }
    else {
        var scoped = useStateLink(props.state, props.transform);
        return props.children(scoped);
    }
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
function StateMemo(transform, equals) {
    return function (link, prev) {
        link[StateMemoID] = equals || (function (n, p) { return (n === p); });
        return transform(link, prev);
    };
}
/**
 * A plugin which allows to opt-out from usage of Javascript proxies for
 * state usage tracking. It is useful for performance tuning. For example:
 *
 * ```tsx
 * const globalState = createState(someLargeObject as object)
 * const MyComponent = () => {
 *     const state = useState(globalState)
 *         .with(Downgraded); // the whole state will be used
 *                            // by this component, so no point
 *                            // to track usage of individual properties
 *     return <>{JSON.stringify(state[self].value)}</>
 * }
 * ```
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
 * @param state A state to relate to the extension.
 *
 * @returns Interface to interact with the development tools for a given state.
 *
 * @typeparam S Type of a value of a state
 */
function DevTools(state) {
    if (state[StateMarkerID]) {
        var plugin = state[self].attach(DevToolsID);
        if (plugin[0] instanceof Error) {
            return EmptyDevToolsExtensions;
        }
        return plugin[0];
    }
    else {
        var plugin = state.with(DevToolsID, function () { return undefined; });
        if (plugin) {
            return plugin[1];
        }
        return EmptyDevToolsExtensions;
    }
}
///
/// INTERNAL SYMBOLS (LIBRARY IMPLEMENTATION)
///
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
    ErrorId[ErrorId["GetStatePropertyWhenPrimitive"] = 107] = "GetStatePropertyWhenPrimitive";
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
var StateLinkInvalidUsageError = /** @class */ (function (_super) {
    __extends(StateLinkInvalidUsageError, _super);
    function StateLinkInvalidUsageError(path, id, details) {
        return _super.call(this, "Error: HOOKSTATE-" + id + " [path: /" + path.join('/') + (details ? ", details: " + details : '') + "]. " +
            ("See https://hookstate.js.org/docs/exceptions#hookstate-" + id)) || this;
    }
    return StateLinkInvalidUsageError;
}(Error));
var DowngradedID = Symbol('Downgraded');
var StateMemoID = Symbol('StateMemo');
var ProxyMarkerID = Symbol('ProxyMarker');
/**
 * @hidden
 * @ignore
 * @internal
 * remove export when plugins are migrated to version 2
 */
var StateMarkerID = Symbol('State');
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
            this._value = None;
        }
        else if (_value === None) {
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
                _this._value !== None &&
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
        if (result === None) {
            return result;
        }
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    Store.prototype.set = function (path, value, mergeValue) {
        if (this._edition < 0) {
            throw new StateLinkInvalidUsageError(path, ErrorId.SetStateWhenDestroyed);
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
            if (value === None) {
                this._promised = this.createPromised(undefined);
                delete onSetArg.value;
                delete onSetArg.state;
            }
            else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = this.createPromised(value);
                value = None;
                delete onSetArg.value;
                delete onSetArg.state;
            }
            else if (this._promised && !this._promised.resolver) {
                throw new StateLinkInvalidUsageError(path, ErrorId.SetStateWhenPromised);
            }
            var prevValue = this._value;
            if (prevValue === None) {
                delete onSetArg.previous;
            }
            this._value = value;
            this.afterSet(onSetArg);
            if (prevValue === None && this._value !== None &&
                this.promised && this.promised.resolver) {
                this.promised.resolver();
            }
            return path;
        }
        if (typeof value === 'object' && Promise.resolve(value) === value) {
            throw new StateLinkInvalidUsageError(path, ErrorId.SetStateNestedToPromised);
        }
        var target = this._value;
        for (var i = 0; i < path.length - 1; i += 1) {
            target = target[path[i]];
        }
        var p = path[path.length - 1];
        if (p in target) {
            if (value !== None) {
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
                // if an array of object is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return path.slice(0, -1);
            }
        }
        if (value !== None) {
            // Property INSERT case
            target[p] = value;
            this.afterSet({
                path: path,
                state: this._value,
                value: value,
                merged: mergeValue
            });
            // if an array of object is about to be extended by new property
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
        if (this._value !== None) {
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
        if (this._value !== None) {
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
        var pluginCallbacks = plugin.create ? plugin.create(this.accessUnmounted()) :
            plugin.init ? plugin.init(this.accessUnmounted()[self]) : {};
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
    Store.prototype.accessUnmounted = function () {
        return new StateLinkImpl(this, RootPath, NoActionOnUpdate, this.get(RootPath), this.edition
        // TODO downgraded plugin should not be used here as it affects all inherited links (which is temporary fixed in the useStateLink)
        // instead optimisations are possible based on checks of onUpdateUsed === NoActionOnUpdate
        ).with(Downgraded); // it does not matter how it is used, it is not subscribed anyway
    };
    Store.prototype.subscribe = function (l) {
        this._subscribers.add(l);
    };
    Store.prototype.unsubscribe = function (l) {
        this._subscribers.delete(l);
    };
    Store.prototype.destroy = function () {
        var _this = this;
        this._destroySubscribers.forEach(function (cb) { return cb(_this._value !== None ? { state: _this._value } : {}); });
        this._edition = DestroyedEdition;
    };
    Store.prototype.toJSON = function () {
        throw new StateLinkInvalidUsageError(RootPath, ErrorId.ToJson_Value);
    };
    return Store;
}());
var SynteticID = Symbol('SynteticTypeInferenceMarker');
var ValueCache = Symbol('ValueCache');
var NestedCache = Symbol('NestedCache');
var UnmountedCallback = Symbol('UnmountedCallback');
var NoActionOnUpdate = function () { };
NoActionOnUpdate[UnmountedCallback] = true;
var WrappedStateLinkImpl = /** @class */ (function () {
    function WrappedStateLinkImpl(state, transform) {
        this.state = state;
        this.transform = transform;
        // tslint:disable-next-line: variable-name
        this.__synteticTypeInferenceMarkerInf = SynteticID;
    }
    WrappedStateLinkImpl.prototype.access = function () {
        return this.transform(this.state, undefined);
    };
    WrappedStateLinkImpl.prototype.with = function (plugin) {
        this.state.with(plugin);
        return this;
    };
    WrappedStateLinkImpl.prototype.wrap = function (transform) {
        var _this = this;
        return new WrappedStateLinkImpl(this.state, function (s, p) {
            return transform(_this.transform(s, undefined), p);
        });
    };
    WrappedStateLinkImpl.prototype.destroy = function () {
        this.state.destroy();
    };
    return WrappedStateLinkImpl;
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
var StateLinkImpl = /** @class */ (function () {
    function StateLinkImpl(state, path, onUpdateUsed, valueSource, valueEdition) {
        this.state = state;
        this.path = path;
        this.onUpdateUsed = onUpdateUsed;
        this.valueSource = valueSource;
        this.valueEdition = valueEdition;
    }
    StateLinkImpl.prototype.getUntracked = function (allowPromised) {
        if (this.valueEdition !== this.state.edition) {
            this.valueSource = this.state.get(this.path);
            this.valueEdition = this.state.edition;
            if (this.onUpdateUsed[UnmountedCallback]) {
                // this link is not mounted to a component
                // for example, it might be global link or
                // a link which has been discarded after rerender
                // but still captured by some callback or an effect
                delete this[ValueCache];
                delete this[NestedCache];
            }
            else {
                // this link is still mounted to a component
                // populate cache again to ensure correct tracking of usage
                // when React scans which states to rerender on update
                if (ValueCache in this) {
                    delete this[ValueCache];
                    this.get(true);
                }
                if (NestedCache in this) {
                    delete this[NestedCache];
                    // tslint:disable-next-line no-unused-expression
                    this.nested; // trigger call to mark 'nested' as used again
                }
            }
        }
        if (this.valueSource === None && !allowPromised) {
            if (this.state.promised && this.state.promised.error) {
                throw this.state.promised.error;
            }
            throw new StateLinkInvalidUsageError(this.path, ErrorId.GetStateWhenPromised);
        }
        return this.valueSource;
    };
    StateLinkImpl.prototype.get = function (allowPromised) {
        var currentValue = this.getUntracked(allowPromised);
        if (this[ValueCache] === undefined) {
            if (this.isDowngraded) {
                this[ValueCache] = currentValue;
            }
            else if (Array.isArray(currentValue)) {
                this[ValueCache] = this.valueArrayImpl(currentValue);
            }
            else if (typeof currentValue === 'object' && currentValue !== null) {
                this[ValueCache] = this.valueObjectImpl(currentValue);
            }
            else {
                this[ValueCache] = currentValue;
            }
        }
        return this[ValueCache];
    };
    Object.defineProperty(StateLinkImpl.prototype, "value", {
        get: function () {
            return this.get();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateLinkImpl.prototype, "promised", {
        get: function () {
            var currentValue = this.get(true); // marks used
            if (currentValue === None && this.state.promised && !this.state.promised.fullfilled) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateLinkImpl.prototype, "error", {
        get: function () {
            var currentValue = this.get(true); // marks used
            if (currentValue === None) {
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
    StateLinkImpl.prototype.setUntracked = function (newValue, mergeValue) {
        if (typeof newValue === 'function') {
            newValue = newValue(this.getUntracked());
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[ProxyMarkerID]) {
            throw new StateLinkInvalidUsageError(this.path, ErrorId.SetStateToValueFromState);
        }
        return this.state.set(this.path, newValue, mergeValue);
    };
    StateLinkImpl.prototype.set = function (newValue) {
        this.state.update([this.setUntracked(newValue)]);
    };
    StateLinkImpl.prototype.mergeUntracked = function (sourceValue) {
        var currentValue = this.getUntracked();
        if (typeof sourceValue === 'function') {
            sourceValue = sourceValue(currentValue);
        }
        var updatedPath;
        var deletedOrInsertedProps = false;
        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                return [this.setUntracked(currentValue.concat(sourceValue), sourceValue)];
            }
            else {
                var deletedIndexes_1 = [];
                Object.keys(sourceValue).sort().forEach(function (i) {
                    var index = Number(i);
                    var newPropValue = sourceValue[index];
                    if (newPropValue === None) {
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
                updatedPath = this.setUntracked(currentValue, sourceValue);
            }
        }
        else if (typeof currentValue === 'object' && currentValue !== null) {
            Object.keys(sourceValue).forEach(function (key) {
                var newPropValue = sourceValue[key];
                if (newPropValue === None) {
                    deletedOrInsertedProps = true;
                    delete currentValue[key];
                }
                else {
                    deletedOrInsertedProps = deletedOrInsertedProps || !(key in currentValue);
                    currentValue[key] = newPropValue;
                }
            });
            updatedPath = this.setUntracked(currentValue, sourceValue);
        }
        else if (typeof currentValue === 'string') {
            return [this.setUntracked((currentValue + String(sourceValue)), sourceValue)];
        }
        else {
            return [this.setUntracked(sourceValue)];
        }
        if (updatedPath !== this.path || deletedOrInsertedProps) {
            return [updatedPath];
        }
        return Object.keys(sourceValue).map(function (p) { return updatedPath.slice().concat(p); });
    };
    StateLinkImpl.prototype.merge = function (sourceValue) {
        this.state.update(this.mergeUntracked(sourceValue));
    };
    StateLinkImpl.prototype.batch = function (action, options) {
        var _this = this;
        if (this.promised) {
            var ifPromised = options && options.ifPromised || 'reject';
            if (ifPromised === 'postpone') {
                return this.state.postponeBatch(function () { return _this.batch(action, options); });
            }
            if (ifPromised === 'discard') {
                return;
            }
            if (ifPromised === 'reject') {
                this.get(); // this will throw (default behavior)
            }
        }
        try {
            this.state.startBatch(this.path, options);
            action(this);
        }
        finally {
            this.state.finishBatch(this.path, options);
        }
    };
    // remove in version 2, replace by rerender
    StateLinkImpl.prototype.update = function (paths) {
        this.state.update(paths);
    };
    StateLinkImpl.prototype.rerender = function (paths) {
        this.state.update(paths);
    };
    StateLinkImpl.prototype.denull = function () {
        var value = this.get();
        if (value === null || value === undefined) {
            return value;
        }
        return this;
    };
    StateLinkImpl.prototype.with = function (plugin, alt) {
        if (typeof plugin === 'function') {
            var pluginMeta = plugin();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                return this;
            }
            this.state.register(pluginMeta);
            return this;
        }
        else {
            var instance = this.state.getPlugin(plugin);
            if (instance) {
                return [this, instance];
            }
            if (alt) {
                return alt();
            }
            throw new StateLinkInvalidUsageError(this.path, ErrorId.GetUnknownPlugin, plugin.toString());
        }
    };
    StateLinkImpl.prototype.access = function () {
        return this;
    };
    StateLinkImpl.prototype.wrap = function (transform) {
        return new WrappedStateLinkImpl(this, transform);
    };
    StateLinkImpl.prototype.destroy = function () {
        this.state.destroy();
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
    StateLinkImpl.prototype.onSet = function (paths, actions) {
        this.updateIfUsed(paths, actions);
    };
    StateLinkImpl.prototype.updateIfUsed = function (paths, actions) {
        var _this = this;
        var update = function () {
            if (_this.isDowngraded &&
                (ValueCache in _this || NestedCache in _this)) {
                actions.push(_this.onUpdateUsed);
                return true;
            }
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var path = paths_1[_i];
                var firstChildKey = path[_this.path.length];
                if (firstChildKey === undefined) {
                    if (ValueCache in _this || NestedCache in _this) {
                        actions.push(_this.onUpdateUsed);
                        return true;
                    }
                }
                else {
                    var firstChildValue = _this.nestedLinksCache && _this.nestedLinksCache[firstChildKey];
                    if (firstChildValue && firstChildValue.updateIfUsed(paths, actions)) {
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
    Object.defineProperty(StateLinkImpl.prototype, "keys", {
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
    StateLinkImpl.prototype.child = function (key) {
        this.nestedLinksCache = this.nestedLinksCache || {};
        var cachehit = this.nestedLinksCache[key];
        if (cachehit) {
            return cachehit;
        }
        var r = new StateLinkImpl(this.state, this.path.slice().concat(key), this.onUpdateUsed, this.valueSource[key], this.valueEdition);
        if (this.isDowngraded) {
            r.isDowngraded = true;
        }
        this.nestedLinksCache[key] = r;
        return r;
    };
    Object.defineProperty(StateLinkImpl.prototype, "nested", {
        get: function () {
            var currentValue = this.getUntracked();
            if (this[NestedCache] === undefined) {
                if (Array.isArray(currentValue)) {
                    this[NestedCache] = this.nestedArrayImpl(currentValue);
                }
                else if (typeof currentValue === 'object' && currentValue !== null) {
                    this[NestedCache] = this.nestedObjectImpl(currentValue);
                }
                else {
                    this[NestedCache] = undefined;
                }
            }
            return this[NestedCache];
        },
        enumerable: false,
        configurable: true
    });
    StateLinkImpl.prototype.nestedArrayImpl = function (currentValue) {
        var _this = this;
        this.nestedLinksCache = this.nestedLinksCache || {};
        var proxyGetterCache = this.nestedLinksCache;
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
            if (typeof key === 'symbol') {
                return undefined;
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
            if (_this.isDowngraded) {
                r.isDowngraded = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter);
    };
    StateLinkImpl.prototype.valueArrayImpl = function (currentValue) {
        var _this = this;
        return this.proxyWrap(currentValue, function (target, key) {
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
            return (_this.nested)[index].get();
        }, function (target, key, value) {
            if (typeof key === 'symbol') {
                // allow clients to associate hidden cache with state values
                target[key] = value;
                return true;
            }
            throw new StateLinkInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
        });
    };
    StateLinkImpl.prototype.nestedObjectImpl = function (currentValue) {
        var _this = this;
        this.nestedLinksCache = this.nestedLinksCache || {};
        var proxyGetterCache = this.nestedLinksCache;
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
            if (_this.isDowngraded) {
                r.isDowngraded = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter);
    };
    StateLinkImpl.prototype.valueObjectImpl = function (currentValue) {
        var _this = this;
        return this.proxyWrap(currentValue, function (target, key) {
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
            throw new StateLinkInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
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
            throw new StateLinkInvalidUsageError(_this.path, op);
        };
        return new Proxy(objectToWrap, {
            getPrototypeOf: function (target) {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: function (target, v) {
                return onInvalidUsage(ErrorId.SetPrototypeOf_Value);
            },
            isExtensible: function (target) {
                // should satisfy the invariants:
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/
                // Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
                return Object.isExtensible(target);
            },
            preventExtensions: function (target) {
                return onInvalidUsage(ErrorId.PreventExtensions_Value);
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
                return onInvalidUsage(ErrorId.SetProperty_Value);
            }),
            deleteProperty: function (target, p) {
                return onInvalidUsage(ErrorId.DeleteProperty_Value);
            },
            defineProperty: function (target, p, attributes) {
                return onInvalidUsage(ErrorId.DefineProperty_Value);
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
                return onInvalidUsage(ErrorId.Apply_Value);
            },
            construct: function (target, argArray, newTarget) {
                return onInvalidUsage(ErrorId.Construct_Value);
            }
        });
    };
    Object.defineProperty(StateLinkImpl.prototype, self, {
        get: function () {
            var _this = this;
            return proxyWrap(this.path, this.valueSource, function () {
                _this.get(); // get latest & mark used
                return _this.valueSource;
            }, function (_, key) {
                if (key === StateMarkerID) {
                    // should be tested before target is obtained
                    // to keep it clean from usage marker
                    return _this;
                }
                if (typeof key === 'symbol') {
                    if (key === self) {
                        return _this;
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    if (key === 'toJSON') {
                        throw new StateLinkInvalidUsageError(_this.path, ErrorId.ToJson_State);
                    }
                    var currentValue = _this.getUntracked(true);
                    if ( // if currentValue is primitive type
                    (typeof currentValue !== 'object' || currentValue === null) &&
                        // if promised, it will be none
                        currentValue !== none) {
                        switch (key) {
                            case 'path':
                                return _this.path;
                            case 'keys':
                                return _this.keys;
                            case 'value':
                                return _this.value;
                            case 'get':
                                return function () { return _this.get(); };
                            case 'set':
                                return function (p) { return _this.set(p); };
                            case 'merge':
                                return function (p) { return _this.merge(p); };
                            case 'map':
                                // tslint:disable-next-line: no-any
                                return function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    return _this.map(args[0], args[1], args[2], args[3]);
                                };
                            case 'attach':
                                return function (p) { return _this.attach(p); };
                            default:
                                _this.get(); // mark used
                                throw new StateLinkInvalidUsageError(_this.path, ErrorId.GetStatePropertyWhenPrimitive);
                        }
                    }
                    _this.get(); // mark used
                    if (Array.isArray(currentValue)) {
                        if (key === 'length') {
                            return currentValue.length;
                        }
                        if (key in Array.prototype) {
                            return Array.prototype[key];
                        }
                        var index = Number(key);
                        if (!Number.isInteger(index)) {
                            return undefined;
                        }
                        return _this.child(index)[self];
                    }
                    return _this.child(key.toString())[self];
                }
            }, function (_, key, value) {
                throw new StateLinkInvalidUsageError(_this.path, ErrorId.SetProperty_State);
            });
        },
        enumerable: false,
        configurable: true
    });
    StateLinkImpl.prototype.map = function (action, onPromised, onError, context) {
        var _this = this;
        if (!action) {
            if (this.promised) {
                return [true, undefined, undefined];
            }
            if (this.error) {
                return [false, this.error, undefined];
            }
            return [false, undefined, this.value];
        }
        var contextArg = typeof onPromised === 'function'
            ? (typeof onError === 'function' ? context : onError)
            : onPromised;
        var runBatch = (function (actionArg) {
            if (contextArg !== undefined) {
                var opts = { context: contextArg };
                try {
                    _this.state.startBatch(_this.path, opts);
                    return actionArg();
                }
                finally {
                    _this.state.finishBatch(_this.path, opts);
                }
            }
            else {
                return actionArg();
            }
        });
        if (typeof onPromised === 'function' && this.promised) {
            return runBatch(function () {
                var r = onPromised(_this[self]);
                if (r === postpone) {
                    // tslint:disable-next-line: no-any
                    _this.state.postponeBatch(function () { return _this.map(action, onPromised, onError, context); });
                }
                return r;
            });
        }
        if (typeof onError === 'function' && this.error) {
            return runBatch(function () { return onError(_this.error, _this[self]); });
        }
        return runBatch(function () { return action(_this[self]); });
    };
    Object.defineProperty(StateLinkImpl.prototype, "ornull", {
        get: function () {
            var r = this.denull();
            if (r) {
                return r[self];
            }
            return r;
        },
        enumerable: false,
        configurable: true
    });
    StateLinkImpl.prototype.attach = function (p) {
        if (typeof p === 'function') {
            var pluginMeta = p();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                return this[self];
            }
            this.state.register(pluginMeta);
            return this[self];
        }
        else {
            var instance = this.state.getPlugin(p);
            var capturedThis_1 = this;
            return [instance || (new StateLinkInvalidUsageError(this.path, ErrorId.GetUnknownPlugin, p.toString())), 
                // TODO need to create an instance until version 2
                // because of the incompatible return types from methods
                {
                    getUntracked: function () {
                        return capturedThis_1.getUntracked();
                    },
                    setUntracked: function (v) {
                        return [capturedThis_1.setUntracked(v)];
                    },
                    mergeUntracked: function (v) {
                        return capturedThis_1.mergeUntracked(v);
                    },
                    rerender: function (paths) {
                        return capturedThis_1.rerender(paths);
                    }
                }
            ];
        }
    };
    return StateLinkImpl;
}());
function proxyWrap(path, 
// tslint:disable-next-line: no-any
targetBootstrap, 
// tslint:disable-next-line: no-any
targetGetter, 
// tslint:disable-next-line: no-any
propertyGetter, 
// tslint:disable-next-line: no-any
propertySetter) {
    var onInvalidUsage = function (op) {
        throw new StateLinkInvalidUsageError(path, op);
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
            return onInvalidUsage(ErrorId.SetPrototypeOf_State);
        },
        isExtensible: function (target) {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
            return true; // required to satisfy the invariants of the getPrototypeOf
            // return Object.isExtensible(target);
        },
        preventExtensions: function (target) {
            return onInvalidUsage(ErrorId.PreventExtensions_State);
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
                get: function () { return propertyGetter(undefined, p); },
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
            return onInvalidUsage(ErrorId.DeleteProperty_State);
        },
        defineProperty: function (target, p, attributes) {
            return onInvalidUsage(ErrorId.DefineProperty_State);
        },
        enumerate: function (target) {
            var targetReal = targetGetter();
            if (Array.isArray(targetReal)) {
                return Object.keys(targetReal).concat('length');
            }
            if (targetReal === undefined || targetReal === null) {
                return [];
            }
            return Object.keys(targetReal);
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
            return onInvalidUsage(ErrorId.Apply_State);
        },
        construct: function (target, argArray, newTarget) {
            return onInvalidUsage(ErrorId.Construct_State);
        }
    });
}
function createStore(initial) {
    var initialValue = initial;
    if (typeof initial === 'function') {
        initialValue = initial();
    }
    if (typeof initialValue === 'object' && initialValue !== null && initialValue[ProxyMarkerID]) {
        throw new StateLinkInvalidUsageError(RootPath, ErrorId.InitStateToValueFromState);
    }
    return new Store(initialValue);
}
function useSubscribedStateLink(state, path, update, subscribeTarget, disabledTracking) {
    var link = new StateLinkImpl(state, path, update, state.get(path), state.edition);
    if (disabledTracking) {
        link.with(Downgraded);
    }
    React.useEffect(function () {
        subscribeTarget.subscribe(link);
        return function () {
            link.onUpdateUsed[UnmountedCallback] = true;
            subscribeTarget.unsubscribe(link);
        };
    });
    return link;
}
function injectTransform(link, transform) {
    if (link.onUpdateUsed[UnmountedCallback]) {
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
        var updatedResult = transform(link, result);
        // if result is not changed, it does not affect the rendering result too
        // so, we skip triggering rerendering in this case
        if (!stateMemoEquals(updatedResult, result)) {
            originOnUpdateUsed();
        }
    };
    return result;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source directly or source.wrap(transform).access() instead
 */
function useStateLinkUnmounted(source, transform) {
    if (source instanceof WrappedStateLinkImpl) {
        return source.access();
    }
    if (transform) {
        return transform(source);
    }
    return source;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
var None = none;

export { DevTools, DevToolsID, Downgraded, None, StateFragment, StateMarkerID, StateMemo, createState, createStateLink, none, postpone, self, useState, useStateLink, useStateLinkUnmounted };
//# sourceMappingURL=index.es.js.map
