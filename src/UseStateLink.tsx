import React from 'react';
import { instanceOf } from 'prop-types';

//
// DECLARATIONS
//

export interface StateRef<S> {
    // placed to make sure type inference does not match compatible structure
    // on useStateLink call
    __synteticTypeInferenceMarkerRef: symbol;
    with(plugin: () => Plugin): StateRef<S>;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>
    destroy(): void
}

// R captures the type of result of transform function
export interface StateInf<R> {
    // placed to make sure type inference does not match empty structure
    // on useStateLink call
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): StateInf<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2>
    destroy(): void;
}

// TODO add support for Map and Set
export type NestedInferredLink<S> =
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> :
    S extends null ? undefined :
    S extends object ? { readonly [K in keyof Required<S>]: StateLink<S[K]>; } :
    undefined;

export type Path = ReadonlyArray<string | number>;

export type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));

export type SetPartialStateAction<S> =
    S extends ReadonlyArray<(infer U)> ?
        ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) :
    S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) :
    React.SetStateAction<S>;

export interface StateLink<S> {
    readonly path: Path;
    readonly nested: NestedInferredLink<S>;

    // keep value in addition to get() because typescript compiler
    // does not handle elimination of undefined with get(), like in this example:
    // const state = useStateLink<number | undefined>(0)
    // const myvalue: number = statelink.value ? statelink.value + 1 : 0; // <-- compiles
    // const myvalue: number = statelink.get() ? statelink.get() + 1 : 0; // <-- does not compile
    readonly value: S;
    
    /** @warning experimental feature */
    readonly promised: boolean;
    /** @warning experimental feature */
    readonly error: ErrorValueAtPath | undefined;

    get(): S;
    set(newValue: SetStateAction<S>): void;
    merge(newValue: SetPartialStateAction<S>): void;

    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
}

export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(path: Path | Path[]): void;
}

// type alias to highlight the places where we are dealing with root state value
// tslint:disable-next-line: no-any
export type StateValueAtRoot = any;
// tslint:disable-next-line: no-any
export type StateValueAtPath = any;
// tslint:disable-next-line: no-any
export type ErrorValueAtPath = any;

export type InitialValueAtRoot<S> = S | Promise<S> | (() => S | Promise<S>)

/** @warning experimental feature */
export const None = Symbol('none') as StateValueAtPath;

export interface PluginInstance {
    // if returns defined value,
    // it overrides the current / initial value in the state
    // it is only applicable for plugins attached via stateref, not via statelink
    readonly onInit?: () => StateValueAtRoot | void,
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot,
        newValue: StateValueAtPath, prevValue: StateValueAtPath) => void | StateValueAtRoot,
    readonly onSet?: (path: Path, newState: StateValueAtRoot,
        newValue: StateValueAtPath, prevValue: StateValueAtPath) => void,
    readonly onDestroy?: (state: StateValueAtRoot) => void,
};

export interface Plugin {
    readonly id: symbol;
    readonly instanceFactory: (
        initial: StateValueAtRoot, linkFactory: () => StateLink<StateValueAtRoot>
    ) => PluginInstance;
}

//
// INTERNAL IMPLEMENTATIONS
//

class StateLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path, hint?: string) {
        super(`StateLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'` +
            (hint ? `. Hint: ${hint}` : ''))
    }
}

function extractSymbol(s: symbol) {
    let result = s.toString();
    const symstr = 'Symbol('
    if (result.startsWith(symstr) && result.endsWith(')')) {
        result = result.substring(symstr.length, result.length - 1)
    }
    return result;
}

class PluginInvalidRegistrationError extends Error {
    constructor(id: symbol, path: Path) {
        super(`Plugin with onInit, which overrides initial value, ` +
        `should be attached to StateRef instance, but not to StateLink instance. ` +
        `Attempted 'with(${extractSymbol(id)})' at '/${path.join('/')}'`)
    }
}

class PluginUnknownError extends Error {
    constructor(s: symbol) {
        super(`Plugin '${extractSymbol(s)}' has not been attached to the StateRef or StateLink. ` +
            `Hint: you might need to register the required plugin using 'with' method. ` +
            `See https://github.com/avkonst/hookstate#plugins for more details`)
    }
}

interface Subscriber {
    onSet(path: Path, actions: (() => void)[]): void;
}

type PresetCallback = (path: Path, prevState: StateValueAtRoot,
    newValue: StateValueAtPath, prevValue: StateValueAtPath) => void | StateValueAtRoot;
type SetCallback = (path: Path, newState: StateValueAtRoot,
    newValue: StateValueAtPath, prevValue: StateValueAtPath) => void;
type DestroyCallback = (state: StateValueAtRoot) => void;

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

const DowngradedID = Symbol('Downgraded');
const StateMemoID = Symbol('StateMemo');
const ProxyMarkerID = Symbol('ProxyMarker');

const RootPath: Path = [];
const DestroyedEdition = -1

class State implements Subscribable {
    private _edition: number = 0;

    private _subscribers: Set<Subscriber> = new Set();
    private _presetSubscribers: Set<PresetCallback> = new Set();
    private _setSubscribers: Set<SetCallback> = new Set();
    private _destroySubscribers: Set<DestroyCallback> = new Set();

    private _plugins: Map<symbol, PluginInstance> = new Map();
    
    private _promised: Promised | undefined;
    
    constructor(private _value: StateValueAtRoot) {
        if (typeof _value === 'object' &&
            Promise.resolve(_value) as StateValueAtRoot === _value) {
            this._promised = Promised.create(_value, this)
            this._value = None
        }
    }

    get edition() {
        return this._edition;
    }
    
    get promised() {
        return this._promised;
    }
    
    get(path: Path) {
        let result = this._value;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    set(path: Path, value: StateValueAtPath, mergeValue: Partial<StateValueAtPath> | undefined): Path {
        if (this._edition < 0) {
            // TODO convert to warning
            throw new StateLinkInvalidUsageError(
                `set state for the destroyed state`,
                path,
                'make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. ' +
                'Global state is explicitly destroyed at \'StateRef.destroy()\'. ' +
                'Local state is automatically destroyed when a component is unmounted.')
        }
        
        if (path.length === 0) {
            // Root value UPDATE case,

            if (value === None) {
                // never ending promise, unless it is displaced by antoher set later on
                this._promised = Promised.create(new Promise(() => { /* */ }), this)
            } else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = Promised.create(value, this)
                value = None
            } else {
                this._promised = undefined
            }
            
            let prevValue = this._value;
            this.beforeSet(path, value, prevValue)
            this._value = value;
            this.afterSet(path, value, prevValue)
            
            return path;
        }

        if (typeof value === 'object' && Promise.resolve(value) === value) {
            throw new StateLinkInvalidUsageError(
                // TODO add hint
                'set promise for nested property', path, ''
            )
        }
        
        let target = this._value;
        for (let i = 0; i < path.length - 1; i += 1) {
            target = target[path[i]];
        }
        
        const p = path[path.length - 1]
        if (p in target) {
            if (value !== None) {
                // Property UPDATE case
                let prevValue = target[p]
                this.beforeSet(path, value, prevValue)
                target[p] = value;
                this.afterSet(path, value, prevValue)
                
                return path;
            } else {
                // Property DELETE case
                let prevValue = target[p]
                this.beforeSet(path, value, prevValue)
                if (Array.isArray(target) && typeof p === 'number') {
                    target.splice(p, 1)
                } else {
                    delete target[p]
                }
                this.afterSet(path, value, prevValue)
                
                // if an array of object is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return path.slice(0, -1)
            }
        }
        
        if (value !== None) {
            // Property INSERT case
            this.beforeSet(path, value, None)
            target[p] = value;
            this.afterSet(path, value, None)
            
            // if an array of object is about to be extended by new property
            // we consider it is the whole object is changed
            // which is identified by upper path
            return path.slice(0, -1)
        }
        
        // Non-existing property DELETE case
        // no-op
        return path;
    }

    update(path: Path) {
        const actions: (() => void)[] = [];
        this._subscribers.forEach(s => s.onSet(path, actions));
        actions.forEach(a => a());
    }

    updateBatch(paths: Path[]) {
        const actions: (() => void)[] = [];
        paths.forEach(path => {
            this._subscribers.forEach(s => s.onSet(path, actions));
        })
        actions.forEach(a => a());
    }

    beforeSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath) {
        if (this._edition !== DestroyedEdition) {
            this._presetSubscribers.forEach(cb => {
                const presetResult = cb(path, this._value, value, prevValue)
                if (presetResult !== undefined) {
                    // plugin overrides the current value
                    // could be used for immutable later on
                    this._value = presetResult
                }
            })
        }
    }

    afterSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(cb => cb(path, this._value, value, prevValue))
        }
    }
    
    getPlugin(pluginId: symbol) {
        const existingInstance = this._plugins.get(pluginId)
        if (existingInstance) {
            return existingInstance;
        }
        throw new PluginUnknownError(pluginId)
    }

    register(plugin: Plugin, path?: Path | undefined) {
        const existingInstance = this._plugins.get(plugin.id)
        if (existingInstance) {
            return;
        }
        const pluginInstance = plugin.instanceFactory(
            this._value,
            () => useStateLinkUnmounted(new StateRefImpl(this))
        );
        this._plugins.set(plugin.id, pluginInstance);
        if (pluginInstance.onInit) {
            const initValue = pluginInstance.onInit()
            if (initValue !== undefined) {
                if (path) {
                    throw new PluginInvalidRegistrationError(plugin.id, path);
                }
                this._value = initValue;
            }
        }
        if (pluginInstance.onPreset) {
            this._presetSubscribers.add((p, s, v, pv) => pluginInstance.onPreset!(p, s, v, pv))
        }
        if (pluginInstance.onSet) {
            this._setSubscribers.add((p, s, v, pv) => pluginInstance.onSet!(p, s, v, pv))
        }
        if (pluginInstance.onDestroy) {
            this._destroySubscribers.add((s) => pluginInstance.onDestroy!(s))
        }
        return;
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }

    destroy() {
        this._destroySubscribers.forEach(cb => cb(this._value))
        this._edition = DestroyedEdition
    }
    
    toJSON() {
        throw new StateLinkInvalidUsageError('toJSON()', RootPath,
        'did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?');
    }
}

const SynteticID = Symbol('SynteticTypeInferenceMarker');
const ValueCache = Symbol('ValueCache');
const NestedCache = Symbol('NestedCache');
const UnmountedCallback = Symbol('UnmountedCallback');

class StateRefImpl<S> implements StateRef<S> {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerRef = SynteticID;
    public disabledTracking: boolean | undefined;

    constructor(public state: State) { }

    with(plugin: () => Plugin): StateRef<S> {
        const pluginMeta = plugin()
        if (pluginMeta.id === DowngradedID) {
            this.disabledTracking = true;
            return this;
        }
        this.state.register(pluginMeta);
        return this;
    }
    
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R> {
        return new StateInfImpl(this, transform)
    }
    
    destroy() {
        this.state.destroy()
    }
}

class StateInfImpl<S, R> implements StateInf<R> {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerInf = SynteticID;

    constructor(
        public readonly wrapped: StateRefImpl<S>,
        public readonly transform: (state: StateLink<S>, prev: R | undefined) => R,
    ) { }

    with(plugin: () => Plugin): StateInf<R> {
        this.wrapped.with(plugin);
        return this;
    }
    
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2> {
        return new StateInfImpl(this.wrapped, (s, p) => {
            return transform(this.transform(s, undefined), p)
        })
    }
    
    destroy() {
        this.wrapped.destroy()
    }
}

class Promised {
    public fullfilled?: true;
    public error?: ErrorValueAtPath;
    public value?: StateValueAtPath;
    
    constructor(public promise: Promise<StateValueAtPath> | undefined,
        onResolve: (r: StateValueAtPath) => void,
        onReject: () => void) {
        if (promise) {
            promise
            .then(r => {
                this.fullfilled = true
                this.value = r
                onResolve(r)
            })
            .catch(err => {
                this.fullfilled = true
                this.error = err
                onReject()
            })
        }
    }
    
    static create(newValue: StateValueAtPath, state: State) {
        const promised = new Promised(
            Promise.resolve(newValue),
            (r: StateValueAtPath) => {
                if (state.promised === promised) {
                    state.set(RootPath, r, undefined)
                    state.update(RootPath)
                }
            },
            () => {
                if (state.promised === promised) {
                    state.update(RootPath)
                }
            }
        );
        return promised;
    }
}

class StateLinkImpl<S> implements StateLink<S>,
    StateLinkPlugable<S>, Subscribable, Subscriber {
    public disabledTracking: boolean | undefined;
    private subscribers: Set<Subscriber> | undefined;

    private nestedLinksCache: Record<string | number, StateLinkImpl<S[keyof S]>> | undefined;

    constructor(
        public readonly state: State,
        public readonly path: Path,
        public onUpdateUsed: (() => void),
        public valueSource: S,
        public valueEdition: number
    ) { }

    getUntracked(allowPromised?: boolean) {
        if (this.valueEdition !== this.state.edition) {
            this.valueSource = this.state.get(this.path)
            this.valueEdition = this.state.edition

            if (this.onUpdateUsed[UnmountedCallback]) {
                // this link is not mounted to a component
                // for example, it might be global link or
                // a link which has been discarded after rerender
                // but still captured by some callback or an effect
                delete this[ValueCache]
                delete this[NestedCache]
            } else {
                // this link is still mounted to a component
                // populate cache again to ensure correct tracking of usage
                // when React scans which states to rerender on update
                if (ValueCache in this) {
                    delete this[ValueCache]
                    this.get(true)
                }
                if (NestedCache in this) {
                    delete this[NestedCache]
                    // tslint:disable-next-line no-unused-expression
                    this.nested // trigger call to mark 'nested' as used again
                }
            }
        }
        if (this.state.promised && !allowPromised) {
            if (this.state.promised.error) {
                throw this.state.promised.error;
            }
            // TODO add hint
            throw new StateLinkInvalidUsageError('read promised state', this.path)
        }
        return this.valueSource;
    }

    get(allowPromised?: boolean) {
        const currentValue = this.getUntracked(allowPromised)
        if (this[ValueCache] === undefined) {
            if (this.disabledTracking) {
                this[ValueCache] = currentValue;
            } else if (Array.isArray(currentValue)) {
                this[ValueCache] = this.valueArrayImpl(currentValue);
            } else if (typeof currentValue === 'object' && currentValue !== null) {
                this[ValueCache] = this.valueObjectImpl(currentValue as unknown as object);
            } else {
                this[ValueCache] = currentValue;
            }
        }
        return this[ValueCache] as S;
    }

    get value(): S {
        return this.get()
    }

    get promised() {
        if (this.state.promised && !this.state.promised.fullfilled) {
            return true;
        }
        return false;
    }
    
    get error() {
        if (this.state.promised) {
            if (this.state.promised.fullfilled) {
                return this.state.promised.error;
            }
            this.get() // will throw 'read while promised' exception
        }
        return undefined;
    }
    
    setUntracked(newValue: SetStateAction<S>, mergeValue?: Partial<StateValueAtPath>): Path {
        if (typeof newValue === 'function') {
            newValue = (newValue as ((prevValue: S) => S))(this.getUntracked());
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[ProxyMarkerID]) {
            throw new StateLinkInvalidUsageError(
                `set(state.get() at '/${newValue[ProxyMarkerID].path.join('/')}')`,
                this.path,
                'did you mean to use state.set(lodash.cloneDeep(value)) instead of state.set(value)?')
        }
        return this.state.set(this.path, newValue, mergeValue);
    }

    set(newValue: React.SetStateAction<S>) {
        this.state.update(this.setUntracked(newValue));
    }

    mergeUntracked(sourceValue: SetPartialStateAction<S>) {
        const currentValue = this.getUntracked()
        if (typeof sourceValue === 'function') {
            sourceValue = (sourceValue as Function)(currentValue);
        }

        const maximumPropsForCherryPickUpdate = 5;
        
        let updatedPath: Path;
        let deletedOrInsertedProps = false
        let totalUpdatedProps = 0
    
        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                updatedPath = this.setUntracked(currentValue.concat(sourceValue) as unknown as S, sourceValue)
            } else {
                const deletedIndexes: number[] = []
                Object.keys(sourceValue).sort().forEach(i => {
                    const index = Number(i);
                    const newPropValue = sourceValue[index]
                    if (newPropValue === None) {
                        deletedOrInsertedProps = true
                        deletedIndexes.push(index)
                    } else {
                        deletedOrInsertedProps = deletedOrInsertedProps || !(index in currentValue)
                        currentValue[index] = newPropValue
                    }
                    totalUpdatedProps += 1
                });
                // indexes are ascending sorted as per above
                // so, delete one by one from the end
                // this way index positions do not change
                deletedIndexes.reverse().forEach(p => {
                    (currentValue as unknown as []).splice(p, 1)
                })
                updatedPath = this.setUntracked(currentValue, sourceValue)
            }
        } else if (typeof currentValue === 'object' && currentValue !== null) {
            Object.keys(sourceValue).forEach(key => {
                const newPropValue = sourceValue[key]
                if (newPropValue === None) {
                    deletedOrInsertedProps = true
                    delete currentValue[key]
                } else {
                    deletedOrInsertedProps = deletedOrInsertedProps || !(key in currentValue)
                    currentValue[key] = newPropValue
                }
                totalUpdatedProps += 0
            })
            updatedPath = this.setUntracked(currentValue, sourceValue)
        } else if (typeof currentValue === 'string') {
            return this.setUntracked((currentValue + String(sourceValue)) as unknown as S)
        } else {
            return this.setUntracked(sourceValue as S)
        }

        if (updatedPath !== this.path || deletedOrInsertedProps ||
            totalUpdatedProps > maximumPropsForCherryPickUpdate) {
            return updatedPath
        }
        return Object.keys(sourceValue).map(p => updatedPath.slice().concat(p))
    }
    
    merge(sourceValue: SetPartialStateAction<S>) {
        this.update(this.mergeUntracked(sourceValue));
    }
    
    update(path: Path | Path[]) {
        if (path.length === 0 || typeof path[0] === 'string' || typeof path[0] === 'number') {
            this.state.update(path as Path)
        } else {
            this.state.updateBatch(path as Path[])
        }
    }

    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
    with(plugin: (() => Plugin) | symbol):
        StateLink<S> | [StateLink<S> & StateLinkPlugable<S>, PluginInstance] {
        if (typeof plugin === 'function') {
            const pluginMeta = plugin();
            if (pluginMeta.id === DowngradedID) {
                this.disabledTracking = true;
                return this;
            }
            this.state.register(pluginMeta, this.path);
            return this;
        } else {
            return [this, this.state.getPlugin(plugin)];
        }
    }

    subscribe(l: Subscriber) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this.subscribers!.delete(l);
    }

    onSet(path: Path, actions: (() => void)[]) {
        this.updateIfUsed(path, actions)
    }

    private updateIfUsed(path: Path, actions: (() => void)[]): boolean {
        const update = () => {
            if (this.disabledTracking &&
                (ValueCache in this || NestedCache in this)) {
                actions.push(this.onUpdateUsed);
                return true;
            }
            const firstChildKey = path[this.path.length];
            if (firstChildKey === undefined) {
                if (ValueCache in this || NestedCache in this) {
                    actions.push(this.onUpdateUsed);
                    return true;
                }
                return false;
            }
            const firstChildValue = this.nestedLinksCache && this.nestedLinksCache[firstChildKey];
            if (firstChildValue === undefined) {
                return false;
            }
            return firstChildValue.updateIfUsed(path, actions);
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(s => {
                s.onSet(path, actions)
            })
        }
        return updated;
    }

    get nested(): NestedInferredLink<S> {
        const currentValue = this.getUntracked()
        if (this[NestedCache] === undefined) {
            if (Array.isArray(currentValue)) {
                this[NestedCache] = this.nestedArrayImpl(currentValue);
            } else if (typeof currentValue === 'object' && currentValue !== null) {
                this[NestedCache] = this.nestedObjectImpl(currentValue as unknown as object);
            } else {
                this[NestedCache] = undefined;
            }
        }
        return this[NestedCache] as NestedInferredLink<S>;
    }

    private nestedArrayImpl(currentValue: StateValueAtPath[]): NestedInferredLink<S> {
        this.nestedLinksCache = this.nestedLinksCache || {};
        const proxyGetterCache = this.nestedLinksCache;

        const getter = (target: object, key: PropertyKey) => {
            if (key === 'length') {
                return (target as []).length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
            }
            if (key === ProxyMarkerID) {
                return this;
            }
            if (typeof key === 'symbol') {
                return undefined;
            }
            const index = Number(key);
            if (!Number.isInteger(index)) {
                return undefined;
            }
            const cachehit = proxyGetterCache[index];
            if (cachehit) {
                return cachehit;
            }
            const r = new StateLinkImpl(
                this.state,
                this.path.slice().concat(index),
                this.onUpdateUsed,
                target[index],
                this.valueEdition
            )
            if (this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter) as
            unknown as NestedInferredLink<S>;
    }

    private valueArrayImpl(currentValue: StateValueAtPath[]): S {
        return this.proxyWrap(currentValue,
            (target: object, key: PropertyKey) => {
                if (key === 'length') {
                    return (target as []).length;
                }
                if (key in Array.prototype) {
                    return Array.prototype[key];
                }
                if (key === ProxyMarkerID) {
                    return this;
                }
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    return target[key];
                }
                const index = Number(key);
                if (!Number.isInteger(index)) {
                    return undefined;
                }
                return (this.nested)![index].value;
            },
            (target: object, key: PropertyKey, value: StateValueAtPath) => {
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    target[key] = value;
                    return true;
                }
                throw new StateLinkInvalidUsageError('set', this.path,
                    `did you mean to use 'state.nested[${key}].set(value)' instead of 'state[${key}] = value'?`)
            }
        ) as unknown as S;
    }

    private nestedObjectImpl(currentValue: object): NestedInferredLink<S> {
        this.nestedLinksCache = this.nestedLinksCache || {};
        const proxyGetterCache = this.nestedLinksCache;

        const getter = (target: object, key: PropertyKey) => {
            if (key === ProxyMarkerID) {
                return this;
            }
            if (typeof key === 'symbol') {
                return undefined;
            }
            const cachehit = proxyGetterCache[key];
            if (cachehit) {
                return cachehit;
            }
            const r = new StateLinkImpl(
                this.state,
                this.path.slice().concat(key.toString()),
                this.onUpdateUsed,
                target[key],
                this.valueEdition
            );
            if (this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter) as
            unknown as NestedInferredLink<S>;
    }

    private valueObjectImpl(currentValue: object): S {
        return this.proxyWrap(currentValue,
            (target: object, key: PropertyKey) => {
                if (key === ProxyMarkerID) {
                    return this;
                }
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    return target[key];
                }
                return (this.nested)![key].value;
            },
            (target: object, key: PropertyKey, value: StateValueAtPath) => {
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    target[key] = value;
                    return true;
                }
                throw new StateLinkInvalidUsageError('set', this.path,
                    `did you mean to use 'state.nested.${key}.set(value)' instead of 'state.${key} = value'?`)
            }
        ) as unknown as S;
    }

    // tslint:disable-next-line: no-any
    private proxyWrap(objectToWrap: any,
        // tslint:disable-next-line: no-any
        getter: (target: any, key: PropertyKey) => any,
        // tslint:disable-next-line: no-any
        setter?: (target: any, p: PropertyKey, value: any, receiver: any) => boolean
    ) {
        const onInvalidUsage = (op: string) => {
            throw new StateLinkInvalidUsageError(op, this.path)
        }
        return new Proxy(objectToWrap, {
            getPrototypeOf: (target) => {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: (target, v) => {
                return onInvalidUsage('setPrototypeOf')
            },
            isExtensible: (target) => {
                // should satisfy the invariants:
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/
                // Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
                return Object.isExtensible(target);
            },
            preventExtensions: (target) => {
                return onInvalidUsage('preventExtensions')
            },
            getOwnPropertyDescriptor: (target, p) => {
                const origin = Object.getOwnPropertyDescriptor(target, p);
                if (origin && Array.isArray(target) && p in Array.prototype) {
                    return origin;
                }
                return origin && {
                    configurable: true, // JSON.stringify() does not work for an object without it
                    enumerable: origin.enumerable,
                    get: () => getter(target as object, p),
                    set: undefined
                };
            },
            has: (target, p) => {
                if (typeof p === 'symbol') {
                    return false;
                }
                return p in target;
            },
            get: getter,
            set: setter || ((target, p, value, receiver) => {
                return onInvalidUsage('set')
            }),
            deleteProperty: (target, p) => {
                return onInvalidUsage('deleteProperty')
            },
            defineProperty: (target, p, attributes) => {
                return onInvalidUsage('defineProperty')
            },
            enumerate: (target) => {
                if (Array.isArray(target)) {
                    return Object.keys(target).concat('length');
                }
                return Object.keys(target);
            },
            ownKeys: (target) => {
                if (Array.isArray(target)) {
                    return Object.keys(target).concat('length');
                }
                return Object.keys(target);
            },
            apply: (target, thisArg, argArray?) => {
                return onInvalidUsage('apply')
            },
            construct: (target, argArray, newTarget?) => {
                return onInvalidUsage('construct')
            }
        });
    }
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const NoAction = () => { /* empty */ };
const NoActionUnmounted = () => { /* empty */ };
NoActionUnmounted[UnmountedCallback] = true

function createState<S>(initial: InitialValueAtRoot<S>): State {
    let initialValue: S | Promise<S> = initial as (S | Promise<S>);
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S | Promise<S>))();
    }
    if (typeof initialValue === 'object' && initialValue[ProxyMarkerID]) {
        throw new StateLinkInvalidUsageError(
            `create/useStateLink(state.get() at '/${initialValue[ProxyMarkerID].path.join('/')}')`,
            RootPath,
            'did you mean to use create/useStateLink(state) OR ' +
            'create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?')
    }
    return new State(initialValue);
}

function useSubscribedStateLink<S>(
    state: State,
    path: Path,
    update: () => void,
    subscribeTarget: Subscribable,
    disabledTracking: boolean | undefined,
    onDestroy: () => void
) {
    const link = new StateLinkImpl<S>(
        state,
        path,
        update,
        state.get(path),
        state.edition
    );
    if (disabledTracking) {
        link.with(Downgraded)
    }
    useIsomorphicLayoutEffect(() => {
        subscribeTarget.subscribe(link);
        return () => {
            link.onUpdateUsed[UnmountedCallback] = true
            subscribeTarget.unsubscribe(link);
        }
    });
    React.useEffect(() => () => onDestroy(), []);
    return link;
}

function useGlobalStateLink<S>(stateRef: StateRefImpl<S>): StateLinkImpl<S> {
    const [value, setValue] = React.useState({ state: stateRef.state });
    return useSubscribedStateLink(
        value.state,
        RootPath,
        () => setValue({ state: value.state }),
        value.state,
        stateRef.disabledTracking,
        NoAction);
}

function useLocalStateLink<S>(initialState: InitialValueAtRoot<S>): StateLinkImpl<S> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState) }));
    return useSubscribedStateLink(
        value.state,
        RootPath,
        () => setValue({ state: value.state }),
        value.state,
        undefined,
        () => value.state.destroy());
}

function useScopedStateLink<S>(originLink: StateLinkImpl<S>): StateLinkImpl<S> {
    const [, setValue] = React.useState({});
    return useSubscribedStateLink(
        originLink.state,
        originLink.path,
        () => setValue({}),
        originLink,
        originLink.disabledTracking,
        NoAction);
}

function useAutoStateLink<S>(
    initialState: InitialValueAtRoot<S> | StateLink<S> | StateRef<S>
): StateLinkImpl<S> {
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useScopedStateLink(initialState as StateLinkImpl<S>);
    }
    if (initialState instanceof StateRefImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState as StateRefImpl<S>);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as InitialValueAtRoot<S>);
}

function injectTransform<S, R>(
    link: StateLinkImpl<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
) {
    if (link.onUpdateUsed[UnmountedCallback]) {
        // this is unmounted link
        return transform(link, undefined);
    }
    let injectedOnUpdateUsed: (() => void) | undefined = undefined;
    const originOnUpdateUsed = link.onUpdateUsed;
    link.onUpdateUsed = () => {
        if (injectedOnUpdateUsed) {
            return injectedOnUpdateUsed();
        }
        return originOnUpdateUsed();
    }

    const result = transform(link, undefined);
    const stateMemoEquals: ((a: R, b: R) => boolean) | undefined = link[StateMemoID];
    if (stateMemoEquals === undefined) {
        return result;
    }
    delete link[StateMemoID];

    injectedOnUpdateUsed = () => {
        const updatedResult = transform(link, result);
        // if result is not changed, it does not affect the rendering result too
        // so, we skip triggering rerendering in this case
        if (!stateMemoEquals(updatedResult, result)) {
            originOnUpdateUsed();
        }
    }
    return result;
}

///
/// EXPORTED IMPLEMENTATIONS
///
export function createStateLink<S>(
    initial: InitialValueAtRoot<S>
): StateRef<S>;
export function createStateLink<S, R>(
    initial: InitialValueAtRoot<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): StateInf<R>;
export function createStateLink<S, R>(
    initial: InitialValueAtRoot<S>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateRef<S> | StateInf<R> {
    const ref = new StateRefImpl<S>(createState(initial));
    if (transform) {
        return new StateInfImpl(ref, transform)
    }
    return ref;
}

export function useStateLink<R>(
    source: StateInf<R>
): R;
export function useStateLink<S>(
    source: StateLink<S> | StateRef<S>
): StateLink<S>;
export function useStateLink<S, R>(
    source: StateLink<S> | StateRef<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S>(
    source: InitialValueAtRoot<S>
): StateLink<S>;
export function useStateLink<S, R>(
    source: InitialValueAtRoot<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S, R>(
    source: InitialValueAtRoot<S> | StateLink<S> | StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateLink<S> | R {
    const state = source instanceof StateInfImpl
        ? source.wrapped as unknown as StateRef<S>
        : source as (InitialValueAtRoot<S> | StateLink<S> | StateRef<S>);
    const link = useAutoStateLink(state);
    if (source instanceof StateInfImpl) {
        return injectTransform(link, source.transform);
    }
    if (transform) {
        return injectTransform(link, transform);
    }
    return link;
}

/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<R>(
    source: StateInf<R>,
): R;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S>(
    source: StateRef<S>,
): StateLink<S>;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S, R>(
    source: StateRef<S>,
    transform: (state: StateLink<S>) => R
): R;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S, R>(
    source: StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    // tslint:disable-next-line: no-any
    type AnyArgument = any; // typesafety is guaranteed by overloaded functions above
    return accessStateLink(source as AnyArgument, transform as AnyArgument)
}

export function accessStateLink<R>(
    source: StateInf<R>,
): R;
export function accessStateLink<S>(
    source: StateRef<S>,
): StateLink<S>;
export function accessStateLink<S, R>(
    source: StateRef<S>,
    transform: (state: StateLink<S>) => R
): R;
export function accessStateLink<S, R>(
    source: StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    const stateRef = source instanceof StateInfImpl
        ? source.wrapped as StateRefImpl<S>
        : source as StateRefImpl<S>;
    const link = new StateLinkImpl<S>(
        stateRef.state,
        RootPath,
        NoActionUnmounted,
        stateRef.state.get(RootPath),
        stateRef.state.edition
    ).with(Downgraded) // it does not matter how it is used, it is not subscribed anyway
    if (source instanceof StateInfImpl) {
        return source.transform(link, undefined);
    }
    if (transform) {
        return transform(link);
    }
    return link;
}

export function StateFragment<R>(
    props: {
        state: StateInf<R>,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S>(
    props: {
        state: StateLink<S> | StateRef<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E extends {}, R>(
    props: {
        state: StateLink<S> | StateRef<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S>(
    props: {
        state: InitialValueAtRoot<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, R>(
    props: {
        state: InitialValueAtRoot<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E extends {}, R>(
    props: {
        state: InitialValueAtRoot<S> | StateLink<S> | StateRef<S> | StateInf<R>,
        transform?: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: StateLink<S> | R) => React.ReactElement,
    }
): React.ReactElement {
    // tslint:disable-next-line: no-any
    type AnyArgument = any; // typesafety is guaranteed by overloaded functions above
    const scoped = useStateLink<S, {}>(props.state as AnyArgument, props.transform as AnyArgument);
    return props.children(scoped as AnyArgument);
}

export function StateMemo<S, R>(
    transform: (state: StateLink<S>, prev: R | undefined) => R,
    equals?: (next: R, prev: R) => boolean) {
    return (link: StateLink<S>, prev: R | undefined) => {
        link[StateMemoID] = equals || ((n: R, p: R) => (n === p))
        return transform(link, prev);
    }
}

// tslint:disable-next-line: function-name
export function Downgraded(): Plugin {
    return {
        id: DowngradedID,
        instanceFactory: () => ({})
    }
}

export default useStateLink;
