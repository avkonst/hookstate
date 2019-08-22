import React from 'react';

//
// DECLARATIONS
//

export interface StateRef<S> {
    // placed to make sure type inference does not match compatible structure
    // on useStateLink call
    __synteticTypeInferenceMarkerRef: symbol;
    with(plugin: () => Plugin): StateRef<S>;
}

// R captures the type of result of transform function
export interface StateInf<R> {
    // placed to make sure type inference does not match empty structure
    // on useStateLink call
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): StateInf<R>;
}

// TODO add support for Map and Set
export type NestedInferredLink<S> =
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> :
    S extends null ? undefined :
    S extends object ? { readonly [K in keyof Required<S>]: StateLink<S[K]>; } :
    undefined;

export type Path = ReadonlyArray<string | number>;

export interface StateLink<S> {
    readonly path: Path;
    readonly value: S;

    readonly nested: NestedInferredLink<S>;

    get(): S;
    set(newValue: React.SetStateAction<S>): void;

    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
}

export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: React.SetStateAction<S>): Path;
    update(path: Path): void;
    updateBatch(paths: Path[]): void;
}

// type alias to highlight the places where we are dealing with root state value
// tslint:disable-next-line: no-any
export type StateValueAtRoot = any;
// tslint:disable-next-line: no-any
export type StateValueAtPath = any;
// tslint:disable-next-line: no-any
export type TransformResult = any;

export interface PluginInstance {
    // if returns defined value,
    // it overrides the current / initial value in the state
    // it is only applicable for plugins attached via stateref, not via statelink
    readonly onInit?: () => StateValueAtRoot | void,
    readonly onPreset?: (path: Path, newValue: StateValueAtRoot,
        prevValue: StateValueAtPath, prevState: StateValueAtRoot) => void,
    readonly onSet?: (path: Path, newValue: StateValueAtRoot) => void,
};

export interface Plugin {
    readonly id: symbol;
    // initial value may not be of the same type as the target value type,
    // because it is coming from the state and represents the type of the root value
    readonly instanceFactory: (initial: StateValueAtRoot) => PluginInstance;
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

type PresetCallback = (path: Path, newValue: StateValueAtPath,
        prevValue: StateValueAtPath, prevState: StateValueAtRoot) => void;

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

const DisabledTrackingID = Symbol('DisabledTrackingID');
const StateMemoID = Symbol('StateMemoID');

const RootPath: Path = [];

class State implements Subscribable {
    private _subscribers: Set<Subscriber> = new Set();
    private _presetSubscribers: Set<PresetCallback> = new Set();

    private _plugins: Map<symbol, PluginInstance> = new Map();

    constructor(private _value: StateValueAtRoot) { }

    get(path: Path) {
        let result = this._value;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    set(path: Path, value: StateValueAtPath): Path {
        if (path.length === 0) {
            this._value = value;
        }
        let result = this._value;
        path.forEach((p, i) => {
            if (i === path.length - 1) {
                this._presetSubscribers.forEach(cb => cb(path, value, result[p], this._value))
                if (!(p in result)) {
                    // if an array of object is about to be extended by new property
                    // we consider it is the whole object is changed
                    // which is identified by upper path
                    path = path.slice(0, -1)
                }
                result[p] = value;
            } else {
                result = result[p];
            }
        });
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
        const pluginInstance = plugin.instanceFactory(this._value);
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
        if (pluginInstance.onSet) {
            this.subscribe({
                onSet: (p) => pluginInstance.onSet!(p, this._value)
            })
        }
        if (pluginInstance.onPreset) {
            this._presetSubscribers.add(pluginInstance.onPreset)
        }
        return;
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }
}

const SynteticID = Symbol('SynteticTypeInferenceMarker');

class StateRefImpl<S> implements StateRef<S> {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerRef = SynteticID;
    public disabledTracking: boolean | undefined;

    constructor(public state: State) { }

    with(plugin: () => Plugin): StateRef<S> {
        const pluginMeta = plugin()
        if (pluginMeta.id === DisabledTrackingID) {
            this.disabledTracking = true;
            return this;
        }
        this.state.register(pluginMeta);
        return this;
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
}

class StateLinkImpl<S> implements StateLink<S>,
    StateLinkPlugable<S>, Subscribable, Subscriber {
    public disabledTracking: boolean | undefined;
    private subscribers: Set<Subscriber> | undefined;

    private nestedCache: NestedInferredLink<S> | undefined;
    private nestedLinksCache: Record<string | number, StateLinkImpl<S[keyof S]>> | undefined;

    private valueTracked: S | undefined;
    private valueUsed: boolean | undefined;

    constructor(
        public readonly state: State,
        public readonly path: Path,
        public onUpdateUsed: () => void,
        public valueUntracked: S
    ) { }

    get value(): S {
        if (this.valueTracked === undefined) {
            if (this.disabledTracking) {
                this.valueTracked = this.valueUntracked;
                if (this.valueTracked === undefined) {
                    this.valueUsed = true;
                }
            } else if (Array.isArray(this.valueUntracked)) {
                this.valueTracked = this.valueArrayImpl();
            } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                this.valueTracked = this.valueObjectImpl();
            } else {
                this.valueTracked = this.valueUntracked;
                if (this.valueTracked === undefined) {
                    this.valueUsed = true;
                }
            }
        }
        return this.valueTracked!;
    }

    getUntracked() {
        return this.valueUntracked;
    }

    get() {
        return this.value
    }

    setUntracked(newValue: React.SetStateAction<S>): Path {
        // inferred() function checks for the nullability of the current value:
        // If value is not null | undefined, it resolves to ArrayLink or ObjectLink
        // which can not take null | undefined as a value.
        // However, it is possible that a user of this StateLink
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
            newValue = (newValue as ((prevValue: S) => S))(this.state.get(this.path));
        }
        return this.state.set(this.path, newValue);
    }

    set(newValue: React.SetStateAction<S>) {
        this.state.update(this.setUntracked(newValue));
    }

    update(path: Path) {
        this.state.update(path)
    }

    updateBatch(paths: Path[]) {
        this.state.updateBatch(paths)
    }

    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
    with(plugin: (() => Plugin) | symbol):
        StateLink<S> | [StateLink<S> & StateLinkPlugable<S>, PluginInstance] {
        if (typeof plugin === 'function') {
            const pluginMeta = plugin();
            if (pluginMeta.id === DisabledTrackingID) {
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

    updateIfUsed(path: Path, actions: (() => void)[]): boolean {
        const update = () => {
            if (this.disabledTracking && (this.valueTracked !== undefined || this.valueUsed === true)) {
                actions.push(this.onUpdateUsed);
                return true;
            }
            const firstChildKey = path[this.path.length];
            if (firstChildKey === undefined) {
                if (this.valueTracked !== undefined || this.valueUsed === true) {
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
        if (!this.valueTracked) {
            this.valueUsed = true;
        }
        if (this.nestedCache === undefined) {
            if (Array.isArray(this.valueUntracked)) {
                this.nestedCache = this.nestedArrayImpl();
            } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
                this.nestedCache = this.nestedObjectImpl();
            } else {
                this.nestedCache = undefined;
            }
        }
        return this.nestedCache as NestedInferredLink<S>;
    }

    private nestedArrayImpl(): NestedInferredLink<S> {
        const proxyGetterCache = {};
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: object, key: PropertyKey) => {
            if (key === 'length') {
                return (target as []).length;
            }
            if (key in Array.prototype) {
                return Array.prototype[key];
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
                target[index]
            )
            if (this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as
            unknown as NestedInferredLink<S>;
    }

    private valueArrayImpl(): S {
        return this.proxyWrap(
            this.valueUntracked as unknown as object,
            (target: object, key: PropertyKey) => {
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    return target[key];
                }
                if (key === 'length') {
                    return (target as []).length;
                }
                if (key in Array.prototype) {
                    return Array.prototype[key];
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
                    `use StateLink.set(...) API: replace 'state[${key}] = value' by ` +
                    `'state.nested[${key}].set(value)' to update an element in the state array`)
            }
        ) as unknown as S;
    }

    private nestedObjectImpl(): NestedInferredLink<S> {
        const proxyGetterCache = {}
        this.nestedLinksCache = proxyGetterCache;

        const getter = (target: object, key: PropertyKey) => {
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
                target[key]
            );
            if (this.disabledTracking) {
                r.disabledTracking = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter) as
            unknown as NestedInferredLink<S>;
    }

    private valueObjectImpl(): S {
        return this.proxyWrap(
            this.valueUntracked as unknown as object,
            (target: object, key: PropertyKey) => {
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
                    `use StateLink.set(...) API: replace 'state.${key} = value' by ` +
                    `'state.nested.${key}.set(value)' to update a property in the state object`)
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
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
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

function createState<S>(initial: S | (() => S)): State {
    let initialValue: S = initial as S;
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S))();
    }
    return new State(initialValue);
}

function useSubscribedStateLink<S>(
    state: State,
    path: Path, update: () => void,
    subscribeTarget: Subscribable,
    disabledTracking?: boolean | undefined
) {
    const link = new StateLinkImpl<S>(
        state,
        path,
        update,
        state.get(path)
    );
    if (disabledTracking) {
        link.with(DisabledTracking)
    }
    useIsomorphicLayoutEffect(() => {
        subscribeTarget.subscribe(link);
        return () => subscribeTarget.unsubscribe(link);
    });
    return link;
}

function useGlobalStateLink<S>(stateLink: StateRefImpl<S>): StateLinkImpl<S> {
    const [, setValue] = React.useState({});
    return useSubscribedStateLink(stateLink.state, RootPath, () => {
        setValue({})
    }, stateLink.state, stateLink.disabledTracking);
}

function useLocalStateLink<S>(initialState: S | (() => S)): StateLinkImpl<S> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState) }));
    return useSubscribedStateLink(value.state, RootPath, () => {
        setValue({ state: value.state })
    }, value.state);
}

function useScopedStateLink<S>(originLink: StateLinkImpl<S>): StateLinkImpl<S> {
    const [, setValue] = React.useState({});
    return useSubscribedStateLink(originLink.state, originLink.path, () => {
        setValue({})
    }, originLink, originLink.disabledTracking);
}

function useAutoStateLink<S>(
    initialState: S | (() => S) | StateLink<S> | StateRef<S>
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
    return useLocalStateLink(initialState as S | (() => S));
}

function injectTransform<S, R>(
    link: StateLinkImpl<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
) {
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
        // need to create new one to make sure
        // it does not pickup the stale cache of the original link after mutation
        const overidingLink = new StateLinkImpl<S>(
            link.state,
            link.path,
            link.onUpdateUsed,
            link.state.get(link.path)
        )
        // and we should inject to onUpdate now
        // so the overriding link is used to track used properties
        link.onSet = (path, actions) => overidingLink.onSet(path, actions);
        const updatedResult = transform(overidingLink, result);
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
    initial: S | (() => S)
): StateRef<S>;
export function createStateLink<S, R>(
    initial: S | (() => S),
    transform: (state: StateLink<S>, prev: R | undefined) => R
): StateInf<R>;
export function createStateLink<S, R>(
    initial: S | (() => S),
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateRef<S> | StateInf<R> {
    const ref =  new StateRefImpl<S>(createState(initial));
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
    source: S | (() => S)
): StateLink<S>;
export function useStateLink<S, R>(
    source: S | (() => S),
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S, R>(
    source: S | (() => S) | StateLink<S> | StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateLink<S> | R {
    const state = source instanceof StateInfImpl
        ? source.wrapped as StateRef<S>
        : source as (S | (() => S) | StateLink<S> | StateRef<S>);
    const link = useAutoStateLink(state);
    if (source instanceof StateInfImpl) {
        return injectTransform(link, source.transform);
    }
    if (transform) {
        return injectTransform(link, transform);
    }
    return link;
}

export function useStateLinkUnmounted<R>(
    source: StateInf<R>,
): R;
export function useStateLinkUnmounted<S>(
    source: StateRef<S>,
): StateLink<S>;
export function useStateLinkUnmounted<S, R>(
    source: StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    const stateRef = source instanceof StateInfImpl
        ? source.wrapped as StateRefImpl<S>
        : source as StateRefImpl<S>;
    const link = new StateLinkImpl<S>(
        stateRef.state,
        RootPath,
        // it is assumed the client discards the state link once it is used
        () => {
            throw new Error('Internal Error: unexpected call');
        },
        stateRef.state.get(RootPath)
    ).with(DisabledTracking) // it does not matter how it is used, it is not subscribed anyway
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
        state: S | (() => S),
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, R>(
    props: {
        state: S | (() => S),
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E extends {}, R>(
    props: {
        state: S | (() => S) | StateLink<S> | StateRef<S> | StateInf<R>,
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
export function DisabledTracking(): Plugin {
    return {
        id: DisabledTrackingID,
        instanceFactory: () => ({})
    }
}

export default useStateLink;
