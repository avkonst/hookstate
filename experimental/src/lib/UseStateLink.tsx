import React from 'react';
import { ObjectStateMutation, createObjectStateMutation, SetPartialStateAction } from './UseStateObject';
import { ArrayStateMutation, createArrayStateMutation } from './UseStateArray';

//
// DECLARATIONS
//

export interface StateLink<S, P extends {}> {
    with<E>(plugin: () => Plugin<S, E>): StateLink<S, P & E>;
}

// TODO add support for Map and Set
export type NestedInferredLink<S, P extends {}> =
    S extends ReadonlyArray<(infer U)> ? NestedArrayLink<U, P> :
    S extends null ? undefined :
    S extends object ? NestedObjectLink<S, P> :
    undefined;

export type NestedArrayLink<U, P extends {}> = ReadonlyArray<ValueLink<U, P>>;

export type NestedObjectLink<S extends object, P extends {}> = {
    readonly [K in keyof Required<S>]: ValueLink<S[K], P>;
};

// TODO add support for Map and Set
export type InferredStateMutation<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> :
    S extends null ? undefined :
    S extends object ? ObjectStateMutation<S> :
    undefined;

export type Path = ReadonlyArray<string | number>;

export interface ReadonlyValueLink<S, P extends {} = {}> {
    readonly path: Path;
    readonly value: S;

    readonly nested: NestedInferredLink<S, P>;
    readonly inferred: InferredStateMutation<S>;
    readonly extended: P;
}

export interface ValueLink<S, P extends {} = {}> extends ReadonlyValueLink<S, P> {
    set(newValue: React.SetStateAction<S>): void;
    with<E>(plugin: () => Plugin<S, E>): ValueLink<S, P & E>;
}

export interface Plugin<S, E extends {}> {
    defines: (keyof E)[],
    // tslint:disable-next-line: no-any
    onInit?: (initialValue: S) => S | void,
    // tslint:disable-next-line: no-any
    onSet?: (path: Path, newValue: S) => void,
    // tslint:disable-next-line: no-any
    extensions: (thisLink: ValueLink<S, {}>) => E
}

//
// INTERNAL IMPLEMENTATIONS
//

class ValueLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`ValueLink is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidUsageError extends Error {
    constructor(op: string, path: Path) {
        super(`Extension is used incorrectly. Attempted '${op}' at '/${path.join('/')}'`)
    }
}

class ExtensionInvalidRegistrationError extends Error {
    constructor(path: Path) {
        super(`Extension can not be registered on nested ValueLink. Attempted 'with' at '/${path.join('/')}'`)
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
    onSet(path: Path): void;
}

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

class State implements Subscribable {
    private _edition = 0;
    private _subscribers: Set<Subscriber> = new Set();

    // tslint:disable-next-line: no-any
    private _extensions: Record<string, Plugin<any, {}>> = {};

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
        this._edition += 1;
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
        this._subscribers.forEach(s => s.onSet(path));
    }

    extensions() {
        return this._extensions;
    }

    register<S, E extends {}>(pluginInit: () => Plugin<S, E>) {
        if (this._edition !== 0) {
            return;
        }

        const plugin = pluginInit();
        if (plugin.onInit) {
            const initValue = plugin.onInit(this._value)
            if (initValue !== undefined) {
                this._value = initValue;
            }
        }
        const extensions = plugin.defines;
        extensions.forEach(e => {
            if (e in this._extensions) {
                throw new ExtensionConflictRegistrationError(e as string);
            }
            // tslint:disable-next-line: no-any
            this._extensions[e as string] = plugin as unknown as Plugin<any, {}>;
        });
        if (plugin.onSet) {
            const onSet = plugin.onSet;
            this.subscribe({
                onSet: (p) => {
                    onSet(p, this._value);
                }
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

class StateLinkImpl<S, P extends {}> implements StateLink<S, P> {
    constructor(public state: State) { }

    with<E>(plugin: () => Plugin<S, E>): StateLink<S, P & E> {
        this.state.register(plugin);
        return this as unknown as StateLink<S, P & E>;
    }
}

class ValueLinkImpl<S, P extends {}> implements ValueLink<S, P>, Subscribable, Subscriber {
    private subscribers: Set<Subscriber> | undefined;

    private nestedCache: NestedInferredLink<S, P> | undefined;
    private nestedLinksCache: Record<string | number, ValueLinkImpl<S[keyof S], P>> | undefined;

    private valueTracked: S | undefined;
    private valueUsed: boolean | undefined;

    constructor(
        public readonly state: State,
        public readonly path: Path,
        // tslint:disable-next-line: no-any
        public onUpdate: () => void,
        public valueUntracked: S
    ) { }

    get value(): S {
        // console.log('value used', this.path);
        if (this.valueTracked === undefined) {
            if (Array.isArray(this.valueUntracked)) {
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
        // return this.nestedCache as NestedInferredLink<S>;
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

    with<E>(plugin: () => Plugin<S, E>): ValueLink<S, P & E> {
        if (this.path.length !== 0) {
            throw new ExtensionInvalidRegistrationError(this.path)
        }
        this.state.register(plugin);
        return this as unknown as ValueLink<S, P & E>;
    }

    get extended() {
        // tslint:disable-next-line: no-any
        const getter = (target: Record<string, Plugin<any, {}>>, key: PropertyKey): any => {
            if (typeof key === 'symbol') {
                return undefined;
            }
            const plugin = target[key];
            if (plugin === undefined) {
                throw new ExtensionUnknownError(key.toString());
            }
            const extension = plugin.extensions(this)[key];
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

    onSet(path: Path) {
        this.updateIfUsed(path)
    }

    updateIfUsed(path: Path): boolean {
        // console.log('updateIfUsed', this.path);
        const update = () => {
            const firstChildKey = path[this.path.length];
            if (firstChildKey === undefined) {
                if (this.valueTracked !== undefined || this.valueUsed === true) {
                    // console.log('updateIfUsed updated', this.path);
                    this.onUpdate();
                    return true;
                }
                // console.log('updateIfUsed not updated (firstChildKey Undefined)',
                // this.path, this.valueTracked || this.valueUsed, this.valueTracked, this.valueUsed);
                return false;
            }
            const firstChildValue = this.nestedLinksCache && this.nestedLinksCache[firstChildKey];
            if (firstChildValue === undefined) {
                // console.log('updateIfUsed not updated (firstChildValue Undefined)', this.path);
                return false;
            }
            // console.log('updateIfUsed offload to children', this.path);
            const r = firstChildValue.updateIfUsed(path);
            // console.log('updateIfUsed offload to children updated', this.path, r);
            return r;
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            // console.log('updateIfUsed not updated, loop subscribers', this.path, this.subscribers);
            this.subscribers.forEach(s => s.onSet(path))
        }
        // console.log('updateIfUsed returning', this.path, updated);
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
            const r = new ValueLinkImpl(
                this.state,
                this.path.slice().concat(index),
                this.onUpdate,
                target[index]
            )
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new ValueLinkInvalidUsageError(o, this.path)
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
            throw new ValueLinkInvalidUsageError(o, this.path)
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
            const r = new ValueLinkImpl(
                this.state,
                this.path.slice().concat(key.toString()),
                this.onUpdate,
                target[key]
            );
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new ValueLinkInvalidUsageError(o, this.path)
        }) as unknown as NestedInferredLink<S, P>;
    }

    private valueObjectImpl(): S {
        const getter = (target: object, key: PropertyKey) => {
            // console.log('value getter', key);
            if (typeof key === 'symbol') {
                return undefined;
            }
            return (this.nested)![key].value;
        };
        return this.proxyWrap(this.valueUntracked as unknown as object, getter, o => {
            throw new ValueLinkInvalidUsageError(o, this.path)
        }) as unknown as S;
    }

    // tslint:disable-next-line: no-any
    private proxyWrap(
        objectToWrap: any,
        getter: (target: any, key: PropertyKey) => any,
        onInvalidUsage: (op: string) => never
    ) {
        return new Proxy(objectToWrap, {
            getPrototypeOf: (target) => {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf: (target, v) => {
                throw new ValueLinkInvalidUsageError('setPrototypeOf', this.path)
            },
            isExtensible: (target) => {
                return false;
            },
            preventExtensions: (target) => {
                throw new ValueLinkInvalidUsageError('preventExtensions', this.path)
            },
            getOwnPropertyDescriptor: (target, p) => {
                const origin = Object.getOwnPropertyDescriptor(target, p);
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
                throw new ValueLinkInvalidUsageError('set', this.path)
            },
            deleteProperty: (target, p) => {
                throw new ValueLinkInvalidUsageError('deleteProperty', this.path)
            },
            defineProperty: (target, p, attributes) => {
                throw new ValueLinkInvalidUsageError('defineProperty', this.path)
            },
            enumerate: (target) => {
                return Object.keys(target);
            },
            ownKeys: (target) => {
                return Object.keys(target);
            },
            apply: (target, thisArg, argArray?) => {
                throw new ValueLinkInvalidUsageError('apply', this.path)
            },
            construct: (target, argArray, newTarget?) => {
                throw new ValueLinkInvalidUsageError('construct', this.path)
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
    subscribeTarget: Subscribable
) {
    const link = new ValueLinkImpl<S, P>(
        state,
        path,
        update,
        state.get(path)
    );
    useIsomorphicLayoutEffect(() => {
        subscribeTarget.subscribe(link);
        return () => subscribeTarget.unsubscribe(link);
    });
    return link;
}

function useGlobalStateLink<S, P>(stateLink: StateLinkImpl<S, P>): ValueLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(stateLink.state, [], () => setValue({}), stateLink.state);
}

function useLocalStateLink<S>(initialState: S | (() => S)): ValueLink<S, {}> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState) }));
    return useSubscribedStateLink(value.state, [], () => setValue({ state: value.state }), value.state);
}

function useDerivedStateLink<S, P extends {}>(originLink: ValueLinkImpl<S, P>): ValueLink<S, P> {
    const [_, setValue] = React.useState({});
    return useSubscribedStateLink(originLink.state, originLink.path, () => setValue({}), originLink);
}

///
/// EXPORTED IMPLEMENTATIONS
///

export function createStateLink<S>(initial: S | (() => S)): StateLink<S, {}> {
    return new StateLinkImpl(createState(initial));
}

export function useStateLink<S, P extends {}>(
    initialState: S | (() => S) | ValueLink<S, P> | StateLink<S, P>
): ValueLink<S, P> {
    // tslint:disable-next-line: no-any
    if (initialState instanceof ValueLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDerivedStateLink(initialState) as ValueLink<S, P>;
    }
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState) as ValueLink<S, P>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as S | (() => S)) as ValueLink<S, P>;
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
    state: ValueLink<S, P> | StateLink<S, P>,
    watcher: (state: ReadonlyValueLink<S, P>, prev: R | undefined) => R
) {
    const link = useStateLink(state) as ValueLinkImpl<S, P>;
    const originOnUpdate = link.onUpdate;
    const injectOnUpdate = {
        call: originOnUpdate
    }
    link.onUpdate = () => injectOnUpdate.call()
    const result = watcher(link, undefined);
    injectOnUpdate.call = () => {
        // need to create new one to make sure
        // it does not pickup the stale cache of the other after mutation
        const unconnected = new ValueLinkImpl<S, P>(
            link.state,
            link.path,
            () => {
                throw new Error('Internal Error: unexpected call');
            },
            link.state.get(link.path))
        const updatedResult = watcher(unconnected, result);
        if (updatedResult !== result) {
            originOnUpdate();
        }
    }
    return result;
}

export default useStateLink;
