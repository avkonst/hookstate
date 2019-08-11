import React from 'react';
import { ObjectStateMutation, createObjectStateMutation } from './UseStateObject';
import { ArrayStateMutation, createArrayStateMutation } from './UseStateArray';

//
// DECLARATIONS
//

export interface StateRef<S, P extends {}> {
    with<E>(plugin: (s: S) => Plugin<S, E>): StateRef<S, P & E>;

    use(onUpdate?: () => void): StateLink<S, P>;
}

// TODO add support for Map and Set
export type NestedInferredLink<S, P extends {}> =
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U, P>> :
    S extends null ? undefined :
    S extends object ? { readonly [K in keyof Required<S>]: StateLink<S[K], P>; } :
    undefined;

// TODO add support for Map and Set
export type InferredStateMutation<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> :
    S extends null ? undefined :
    S extends object ? ObjectStateMutation<S> :
    undefined;

export type Path = ReadonlyArray<string | number>;

export interface ReadonlyStateLink<S, P extends {} = {}> {
    readonly path: Path;
    readonly value: S;

    // shortcut for nested
    readonly _: NestedInferredLink<S, P>;
    readonly nested: NestedInferredLink<S, P>;

    readonly inferred: InferredStateMutation<S>;
    readonly extended: P;

    with<E>(plugin: (s: S) => Plugin<S, E>): StateLink<S, P & E>;
}
// keep temporary for backward compatibility with the previous version
export type ReadonlyValueLink<S, P extends {} = {}> = ReadonlyStateLink<S, P>;

export interface StateLink<S, P extends {} = {}> extends ReadonlyStateLink<S, P> {
    set(newValue: React.SetStateAction<S>): void;
}
// keep temporary for backward compatibility with the previous version
export type ValueLink<S, P extends {} = {}> = StateLink<S, P>;

export interface Plugin<S, E extends {}> {
    id: string;
    factory: () => PluginInstance<S, E>;
}

export interface PluginInstance<S, E extends {}> {
    // if returns defined value,
    // it overrides the current / initial value in the state
    onInit?: () => S | void,
    onSet?: (path: Path, newValue: S) => void,

    declaration: (keyof E)[],
    implementation: (thisLink: StateLink<S, {}>) => E
}

//
// INTERNAL IMPLEMENTATIONS
//

class StateLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`StateLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`Extension is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidRegistrationError extends Error {
    constructor(path: Path) {
        super(`Extension can not be registered on nested StateLink. Attempted 'with' at '/${path.join('/')}'`)
    }
}

class ExtensionConflictRegistrationError extends Error {
    constructor(ext: string) {
        super(`Extension '${ext}' is already registered'`)
    }
}

class ExtensionUnknownError extends Error {
    constructor(ext: string) {
        super(`Extension '${ext}' is unknown'`)
    }
}

interface Subscriber {
    onUpdate(path: Path, actions: (() => void)[]): void;
}

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

class State implements Subscribable {
    private _subscribers: Set<Subscriber> = new Set();

    // tslint:disable-next-line: no-any
    private _extensions: Record<string, PluginInstance<any, {}>> = {};
    private _plugins: Set<string> = new Set();

    // tslint:disable-next-line:no-any
    constructor(private _value: any) { }

    get(path: Path) {
        let result = this._value;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    // tslint:disable-next-line: no-any
    set(path: Path, value: any) {
        if (path.length === 0) {
            this._value = value;
        }
        let result = this._value;
        path.forEach((p, i) => {
            if (i === path.length - 1) {
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
        const actions: (() => void)[] = [];
        this._subscribers.forEach(s => s.onUpdate(path, actions));
        actions.forEach(a => a());
    }

    extensions() {
        return this._extensions;
    }

    register<S, E extends {}>(pluginInit: (s: S) => Plugin<S, E>) {
        const plugin = pluginInit(this._value);
        if (this._plugins.has(plugin.id)) {
            return;
        }
        this._plugins.add(plugin.id);
        const pluginInstance = plugin.factory();
        if (pluginInstance.onInit) {
            const initValue = pluginInstance.onInit()
            if (initValue !== undefined) {
                this._value = initValue;
            }
        }
        const extensions = pluginInstance.declaration;
        extensions.forEach(e => {
            if (e in this._extensions) {
                throw new ExtensionConflictRegistrationError(e as string);
            }
            // tslint:disable-next-line: no-any
            this._extensions[e as string] = pluginInstance as unknown as PluginInstance<any, {}>;
        });
        if (pluginInstance.onSet) {
            const onSet = pluginInstance.onSet;
            this.subscribe({
                onUpdate: (p) => onSet(p, this._value)
            })
        }
        return;
    }

    // tslint:disable-next-line: no-any
    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    // tslint:disable-next-line: no-any
    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }
}

class StateRefImpl<S, P extends {}> implements StateRef<S, P> {
    public disabledTracking: boolean | undefined;

    constructor(public state: State) { }

    with<E>(plugin: (s: S) => Plugin<S, E>): StateRef<S, P & E> {
        // tslint:disable-next-line: no-any
        if (plugin === DisabledTracking as any) {
            this.disabledTracking = true;
        }
        this.state.register(plugin);
        return this as unknown as StateRef<S, P & E>;
    }

    use(): StateLink<S, P> {
        const path: Path = [];
        const r = new StateLinkImpl<S, P>(
            this.state,
            path,
            // it is assumed the client discards the state link once it is used
            () => {
                throw new Error('Internal Error: unexpected call');
            },
            this.state.get(path)
        ).with(DisabledTracking) // it does not matter how it is used, it is not subscribed anyway
        return r;
    }
}

class StateLinkImpl<S, P extends {}> implements StateLink<S, P>, Subscribable, Subscriber {
    public disabledTracking: boolean | undefined;

    private subscribers: Set<Subscriber> | undefined;

    private nestedCache: NestedInferredLink<S, P> | undefined;
    private nestedLinksCache: Record<string | number, StateLinkImpl<S[keyof S], P>> | undefined;

    private valueTracked: S | undefined;
    private valueUsed: boolean | undefined;

    constructor(
        public readonly state: State,
        public readonly path: Path,
        // tslint:disable-next-line: no-any
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

    set(newValue: React.SetStateAction<S>): void {
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
            newValue = (newValue as ((prevValue: S) => S))(this.state.get(this.path));
        }
        this.state.set(this.path, newValue);
    }

    // tslint:disable-next-line: no-any
    with<E>(plugin: (s: S) => Plugin<S, E>): StateLink<S, P & E> {
        if (plugin === DisabledTracking as any) {
            this.disabledTracking = true;
            return this as unknown as StateLink<S, P & E>;
        }
        if (this.path.length !== 0) {
            throw new ExtensionInvalidRegistrationError(this.path)
        }
        this.state.register(plugin);
        return this as unknown as StateLink<S, P & E>;
    }

    get extended() {
        // tslint:disable-next-line: no-any
        const getter = (target: Record<string, PluginInstance<any, {}>>, key: PropertyKey): any => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            const plugin = target[key];
            if (plugin === undefined) {
                throw new ExtensionUnknownError(key.toString());
            }
            const extension = plugin.implementation(this)[key];
            if (extension === undefined) {
                throw new ExtensionUnknownError(key.toString());
            }
            return extension;
        };
        return this.proxyWrap(this.state.extensions(), getter, o => {
            throw new ExtensionInvalidUsageError(o, this.path)
        });
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

    onUpdate(path: Path, actions: (() => void)[]) {
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
                s.onUpdate(path, actions)
            })
        }
        return updated;
    }

    get inferred(): InferredStateMutation<S> {
        if (!this.valueTracked) {
            this.valueUsed = true;
        }
        if (Array.isArray(this.valueUntracked)) {
            return createArrayStateMutation((newValue) =>
            // tslint:disable-next-line: no-any
            this.set(newValue as any)) as unknown as InferredStateMutation<S>
        } else if (typeof this.valueUntracked === 'object' && this.valueUntracked !== null) {
            return createObjectStateMutation((newValue) =>
            // tslint:disable-next-line: no-any
            this.set(newValue as any)) as unknown as InferredStateMutation<S>;
        } else {
            return undefined as unknown as InferredStateMutation<S>;
        }
    }

    get _(): NestedInferredLink<S, P> {
        return this.nested;
    }

    get nested(): NestedInferredLink<S, P> {
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
        return this.nestedCache as NestedInferredLink<S, P>;
    }

    private nestedArrayImpl(): NestedInferredLink<S, P> {
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
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new StateLinkInvalidUsageError(o, this.path)
        }) as unknown as NestedInferredLink<S, P>;
    }

    private valueArrayImpl(): S {
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
            return (this.nested)![index].value;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new StateLinkInvalidUsageError(o, this.path)
        }) as unknown as S;
    }

    private nestedObjectImpl(): NestedInferredLink<S, P> {
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
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new StateLinkInvalidUsageError(o, this.path)
        }) as unknown as NestedInferredLink<S, P>;
    }

    private valueObjectImpl(): S {
        const getter = (target: object, key: PropertyKey) => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            return (this.nested)![key].value;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new StateLinkInvalidUsageError(o, this.path)
        }) as unknown as S;
    }

    // tslint:disable-next-line: no-any
    private proxyWrap(objectToWrap: any, getter: (target: any, key: PropertyKey) => any,
        onInvalidUsage: (op: string) => never
    ) {
        return new Proxy(objectToWrap, {
            getPrototypeOf: (target) => {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: (target, v) => {
                return onInvalidUsage('setPrototypeOf')
            },
            isExtensible: (target) => {
                return false;
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
            set: (target, p, value, receiver) => {
                return onInvalidUsage('set')
            },
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

function useSubscribedStateLink<S, P extends {}>(
    state: State,
    path: Path, update: () => void,
    subscribeTarget: Subscribable,
    disabledTracking?: boolean | undefined
) {
    const link = new StateLinkImpl<S, P>(
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

function useGlobalStateLink<S, P>(stateLink: StateRefImpl<S, P>): StateLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(stateLink.state, [], () => {
        setValue({})
    }, stateLink.state, stateLink.disabledTracking);
}

function useLocalStateLink<S>(initialState: S | (() => S)): StateLink<S, {}> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState) }));
    return useSubscribedStateLink(value.state, [], () => {
        setValue({ state: value.state })
    }, value.state);
}

function useWatchStateLink<S, P extends {}>(originLink: StateLinkImpl<S, P>): StateLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(originLink.state, originLink.path, () => {
        setValue({})
    }, originLink, originLink.disabledTracking);
}

///
/// EXPORTED IMPLEMENTATIONS
///

export function createStateLink<S>(initial: S | (() => S)): StateRef<S, {}> {
    return new StateRefImpl(createState(initial));
}

export function useStateLink<S, P extends {}>(
    initialState: S | (() => S) | StateLink<S, P> | StateRef<S, P>
): StateLink<S, P> {
    // tslint:disable-next-line: no-any
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useWatchStateLink(initialState) as StateLink<S, P>;
    }
    if (initialState instanceof StateRefImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState) as StateLink<S, P>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as S | (() => S)) as StateLink<S, P>;
}

/**
 * Forces rerender of a hooked component when result of `watcher`
 * is changed due to the change of the current value in `state`.
 * Change of the result is determined by the default tripple equality operator.
 * @param state state to watch for
 * @param watcher state-to-result redusing function. The second argument `prev` is
 * defined only when the `watcher` is invokded in reaction event after state is updated.
 * If the watcher returns the same value as the `prev`, the rerendering is not forced
 * by the watcher.
 */
export function useStateWatch<S, R, P extends {}>(
    state: StateLink<S, P> | StateRef<S, P>,
    watcher: (state: ReadonlyStateLink<S, P>, prev: R | undefined) => R
) {
    const link = useStateLink(state) as StateLinkImpl<S, P>;
    const originOnUpdate = link.onUpdateUsed;
    const injectOnUpdate = {
        call: originOnUpdate
    }
    link.onUpdateUsed = () => injectOnUpdate.call()
    const result = watcher(link, undefined);
    injectOnUpdate.call = () => {
        // need to create new one to make sure
        // it does not pickup the stale cache of the other after mutation
        const unconnected = new StateLinkImpl<S, P>(
            link.state,
            link.path,
            () => {
                throw new Error('Internal Error: unexpected call');
            },
            link.state.get(link.path)
        ).with(DisabledTracking) // this instance is not subscribed, so do not track it's usage
        const updatedResult = watcher(unconnected, result);
        if (updatedResult !== result) {
            originOnUpdate();
        }
    }
    return result;
}

// tslint:disable-next-line: no-any function-name
export function DisabledTracking(): Plugin<any, {}> {
    return {
        id: 'DisabledTracking',
        factory: () => ({
            declaration: [],
            implementation: () => ({})
        })
    }
}

export default useStateLink;
