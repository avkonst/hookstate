'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

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

/** @warning experimental feature */
var None = Symbol('none');
/** @warning experimental feature */
var DevTools = Symbol('DevTools');
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
var PluginUnknownError = /** @class */ (function (_super) {
    __extends(PluginUnknownError, _super);
    function PluginUnknownError(s) {
        return _super.call(this, "Plugin '" + extractSymbol(s) + "' has not been attached to the StateInf or StateLink. " +
            "Hint: you might need to register the required plugin using 'with' method. " +
            "See https://github.com/avkonst/hookstate#plugins for more details") || this;
    }
    return PluginUnknownError;
}(Error));
var DowngradedID = Symbol('Downgraded');
var StateMemoID = Symbol('StateMemo');
var ProxyMarkerID = Symbol('ProxyMarker');
var RootPath = [];
var DestroyedEdition = -1;
var State = /** @class */ (function () {
    function State(_value) {
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
    State.prototype.createPromised = function (newValue) {
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
    Object.defineProperty(State.prototype, "edition", {
        get: function () {
            return this._edition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "promised", {
        get: function () {
            return this._promised;
        },
        enumerable: true,
        configurable: true
    });
    State.prototype.get = function (path) {
        var result = this._value;
        if (result === None) {
            return result;
        }
        path.forEach(function (p) {
            result = result[p];
        });
        return result;
    };
    State.prototype.set = function (path, value, mergeValue) {
        if (this._edition < 0) {
            // TODO convert to warning
            throw new StateLinkInvalidUsageError("set state for the destroyed state", path, 'make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. ' +
                'Global state is explicitly destroyed at \'StateInf.destroy()\'. ' +
                'Local state is automatically destroyed when a component is unmounted.');
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
                // TODO add hint
                throw new StateLinkInvalidUsageError("write promised state", path, '');
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
            throw new StateLinkInvalidUsageError(
            // TODO add hint
            'set promise for nested property', path, '');
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
    State.prototype.update = function (paths) {
        if (this._batches) {
            this._batchesPendingPaths = this._batchesPendingPaths || [];
            this._batchesPendingPaths = this._batchesPendingPaths.concat(paths);
            return;
        }
        var actions = [];
        this._subscribers.forEach(function (s) { return s.onSet(paths, actions); });
        actions.forEach(function (a) { return a(); });
    };
    State.prototype.afterSet = function (params) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(function (cb) { return cb(params); });
        }
    };
    State.prototype.startBatch = function (path, options) {
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
    State.prototype.finishBatch = function (path, options) {
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
    State.prototype.postponeBatch = function (action) {
        this._batchesPendingActions = this._batchesPendingActions || [];
        this._batchesPendingActions.push(action);
    };
    State.prototype.getPlugin = function (pluginId) {
        var existingInstance = this._plugins.get(pluginId);
        if (existingInstance) {
            return existingInstance;
        }
        throw new PluginUnknownError(pluginId);
    };
    State.prototype.register = function (plugin) {
        var _this = this;
        var existingInstance = this._plugins.get(plugin.id);
        if (existingInstance) {
            return;
        }
        if (plugin.instanceFactory) {
            var pluginInstance_1 = plugin.instanceFactory(this._value, function () { return _this.accessUnmounted(); });
            this._plugins.set(plugin.id, pluginInstance_1);
            if (pluginInstance_1.onSet) {
                this._setSubscribers.add(function (p) { return pluginInstance_1.onSet(p.path, p.state, p.value, p.previous, p.merged); });
            }
            if (pluginInstance_1.onDestroy) {
                this._destroySubscribers.add(function (p) { return pluginInstance_1.onDestroy(p.state); });
            }
        }
        if (plugin.create) {
            var pluginCallbacks_1 = plugin.create(this.accessUnmounted());
            this._plugins.set(plugin.id, pluginCallbacks_1);
            if (pluginCallbacks_1.onSet) {
                this._setSubscribers.add(function (p) { return pluginCallbacks_1.onSet(p); });
            }
            if (pluginCallbacks_1.onDestroy) {
                this._destroySubscribers.add(function (p) { return pluginCallbacks_1.onDestroy(p); });
            }
            if (pluginCallbacks_1.onBatchStart) {
                this._batchStartSubscribers.add(function (p) { return pluginCallbacks_1.onBatchStart(p); });
            }
            if (pluginCallbacks_1.onBatchFinish) {
                this._batchFinishSubscribers.add(function (p) { return pluginCallbacks_1.onBatchFinish(p); });
            }
        }
    };
    State.prototype.accessUnmounted = function () {
        return new StateLinkImpl(this, RootPath, NoActionOnUpdate, this.get(RootPath), this.edition
        // TODO downgraded plugin should not be used here as it affects all inherited links (which is temporary fixed in the useStateLink)
        // instead optimisations are possible based on checks of onUpdateUsed === NoActionOnUpdate
        ).with(Downgraded); // it does not matter how it is used, it is not subscribed anyway
    };
    State.prototype.subscribe = function (l) {
        this._subscribers.add(l);
    };
    State.prototype.unsubscribe = function (l) {
        this._subscribers.delete(l);
    };
    State.prototype.destroy = function () {
        var _this = this;
        this._destroySubscribers.forEach(function (cb) { return cb(_this._value !== None ? { state: _this._value } : {}); });
        this._edition = DestroyedEdition;
    };
    State.prototype.toJSON = function () {
        throw new StateLinkInvalidUsageError('toJSON()', RootPath, 'did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?');
    };
    return State;
}());
var SynteticID = Symbol('SynteticTypeInferenceMarker');
var ValueCache = Symbol('ValueCache');
var NestedCache = Symbol('NestedCache');
var UnmountedCallback = Symbol('UnmountedCallback');
var NoActionOnDestroy = function () { };
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
            // TODO add hint
            throw new StateLinkInvalidUsageError('read promised state', this.path);
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
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
        configurable: true
    });
    StateLinkImpl.prototype.setUntracked = function (newValue, mergeValue) {
        if (typeof newValue === 'function') {
            newValue = newValue(this.getUntracked());
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[ProxyMarkerID]) {
            throw new StateLinkInvalidUsageError("set(state.get() at '/" + newValue[ProxyMarkerID].path.join('/') + "')", this.path, 'did you mean to use state.set(lodash.cloneDeep(value)) instead of state.set(value)?');
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
                updatedPath = this.setUntracked(currentValue.concat(sourceValue), sourceValue);
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
            return [this.setUntracked((currentValue + String(sourceValue)))];
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
    StateLinkImpl.prototype.update = function (paths) {
        this.state.update(paths);
    };
    StateLinkImpl.prototype.denull = function () {
        var value = this.get();
        if (value === null || value === undefined) {
            return value;
        }
        return this;
    };
    StateLinkImpl.prototype.with = function (plugin) {
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
            return [this, this.state.getPlugin(plugin)];
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
        enumerable: true,
        configurable: true
    });
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
        enumerable: true,
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
            throw new StateLinkInvalidUsageError('set', _this.path, "did you mean to use 'state.nested[" + key + "].set(value)' instead of 'state[" + key + "] = value'?");
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
        link.with(Downgraded);
    }
    useIsomorphicLayoutEffect(function () {
        subscribeTarget.subscribe(link);
        return function () {
            link.onUpdateUsed[UnmountedCallback] = true;
            subscribeTarget.unsubscribe(link);
        };
    });
    React.useEffect(function () { return function () { return onDestroy(); }; }, []);
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
function createStateLink(initial, transform) {
    var stateLink = createState(initial).accessUnmounted();
    if (createStateLink[DevTools]) {
        stateLink.with(createStateLink[DevTools]);
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
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _b = React.useState({ state: parentLink.state }), value_1 = _b[0], setValue_1 = _b[1];
            var link = useSubscribedStateLink(value_1.state, parentLink.path, function () { return setValue_1({ state: value_1.state }); }, value_1.state, undefined, NoActionOnDestroy);
            return tf ? injectTransform(link, tf) : link;
        }
        else {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            var _c = React.useState({}), setValue_2 = _c[1];
            var link = useSubscribedStateLink(parentLink.state, parentLink.path, function () { return setValue_2({}); }, parentLink, parentLink.isDowngraded, NoActionOnDestroy);
            return tf ? injectTransform(link, tf) : link;
        }
    }
    else {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        var _d = React.useState(function () { return ({ state: createState(source) }); }), value_2 = _d[0], setValue_3 = _d[1];
        var link = useSubscribedStateLink(value_2.state, RootPath, function () { return setValue_3({ state: value_2.state }); }, value_2.state, undefined, function () { return value_2.state.destroy(); });
        if (useStateLink[DevTools]) {
            link.with(useStateLink[DevTools]);
        }
        return tf ? injectTransform(link, tf) : link;
    }
}
/**
 * @deprecated use source directly, source.access() or source.wrap(transform).access() instead
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
function Downgraded() {
    return {
        id: DowngradedID,
        instanceFactory: function () { return ({}); }
    };
}

exports.DevTools = DevTools;
exports.Downgraded = Downgraded;
exports.None = None;
exports.StateFragment = StateFragment;
exports.StateMemo = StateMemo;
exports.createStateLink = createStateLink;
exports.useStateLink = useStateLink;
exports.useStateLinkUnmounted = useStateLinkUnmounted;
//# sourceMappingURL=index.js.map
