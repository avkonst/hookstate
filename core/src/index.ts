import React from 'react';
import { shallowEqual } from './is-shallow-equal';

///
/// EXPORTED SYMBOLS (LIBRARY INTERFACE)
///

/**
 * 'JSON path' from root of a state object to a nested property.
 * Return type of [StateMethod.path](#readonly-path).
 *
 * For example, an object `{ a: [{ b: 1 }, { 1000: 'value' }, '3rd'] }`,
 * has got the following paths pointing to existing properties:
 *
 * - `[]`
 * - `['a']`
 * - `['a', 0]`
 * - `['a', 0, 'b']`
 * - `['a', 1]`
 * - `['a', 1, 1000]`
 * - `['a', 2]`
 */
export type Path = ReadonlyArray<string | number>;

/**
 * Type of an argument of [StateMethods.set](#set).
 * 
 * @typeparam S Type of a value of a state
 */
export type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));

/**
 * Type of an argument of [StateMethods.merge](#merge).
 * 
 * @typeparam S Type of a value of a state
 */
export type SetPartialStateAction<S> =
    S extends ReadonlyArray<(infer U)> ?
    ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) :
    S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) :
    React.SetStateAction<S>;

/**
 * Type of an argument of [createState](#createstate) and [useState](#usestate).
 * 
 * @typeparam S Type of a value of a state
 */
export type SetInitialStateAction<S> = S | Promise<S> | (() => S | Promise<S>)

/**
 * Special symbol which might be used to delete properties
 * from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).
 * 
 * [Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)
 */
export const none = Symbol('none') as StateValueAtPath;

/**
 * Return type of [StateMethods.keys](#readonly-keys).
 * 
 * @typeparam S Type of a value of a state
 */
export type InferredStateKeysType<S> =
    S extends ReadonlyArray<infer _> ? ReadonlyArray<number> :
    S extends null ? undefined :
    S extends object ? ReadonlyArray<keyof S> :
    undefined;

/**
 * Return type of [StateMethods.map()](#map).
 * 
 * @typeparam S Type of a value of a state
 */
export type InferredStateOrnullType<S, E> =
    S extends undefined ? undefined :
    S extends null ? null : State<S, E>;

/**
 * For plugin developers only.
 * An instance to manipulate the state in more controlled way.
 * 
 * @typeparam S Type of a value of a state
 * 
 * [Learn more...](https://hookstate.js.org/docs/writing-plugin)
 */
export interface PluginStateControl<S> {
    /**
     * Get state value, but do not leave the traces of reading it.
     */
    getUntracked(): S;
    /**
     * Set new state value, but do not trigger rerender.
     * 
     * @param newValue new value to set to a state.
     */
    setUntracked(newValue: SetStateAction<S>): Path[];
    /**
     * Merge new state value, but do not trigger rerender.
     * 
     * @param mergeValue new partial value to merge with the current state value and set.
     */
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path[];
    /**
     * Trigger rerender for hooked states, where values at the specified paths are used.
     * 
     * @param paths paths of the state variables to search for being used by components and rerender
     */
    rerender(paths: Path[]): void;
}

// TODO move __State to State definition, so StateMethods are not used directly by user
// TODO and declare incompatible __synthetic marker, so StateMethods would become forced to be replaced by State
/**
 * An interface to manage a state in Hookstate.
 * 
 * @typeparam S Type of a value of a state
 */
export interface StateMethods<S, E = {}> extends State_<S, E> {
    // TODO remove default value for E parameter
    /**
     * 'Javascript' object 'path' to an element relative to the root object
     * in the state. For example:
     *
     * ```tsx
     * const state = useState([{ name: 'First Task' }])
     * state.path IS []
     * state[0].path IS [0]
     * state.[0].name.path IS [0, 'name']
     * ```
     */
    readonly path: Path;

    /**
     * Return the keys of nested states.
     * For a given state of [State](#state) type,
     * `state.keys` will be structurally equal to Object.keys(state),
     * with two minor difference:
     * 1. if `state.value` is an array, the returned result will be
     * an array of numbers, not strings like with `Object.keys`.
     * 2. if `state.value` is not an object, the returned result will be undefined.
     */
    readonly keys: InferredStateKeysType<S>;

    /**
     * Unwraps and returns the underlying state value referred by
     * [path](#readonly-path) of this state instance.
     *
     * It returns the same result as [StateMethods.get](#get) method.
     *
     * This property is more useful than [get](#get) method for the cases,
     * when a value may hold null or undefined values.
     * Typescript compiler does not handle elimination of undefined with get(),
     * like in the following examples, but value does:
     *
     * ```tsx
     * const state = useState<number | undefined>(0)
     * const myvalue: number = state.value
     *      ? state.value + 1
     *      : 0; // <-- compiles
     * const myvalue: number = state.get()
     *      ? state.get() + 1
     *      : 0; // <-- does not compile
     * ```
     */
    readonly value: S;

    /**
     * True if state value is not yet available (eg. equal to a promise)
     */
    readonly promised: boolean;

    /**
     * If a state was set to a promise and the promise was rejected,
     * this property will return the error captured from the promise rejection
     */
    readonly error: StateErrorAtRoot | undefined;

    /**
     * Unwraps and returns the underlying state value referred by
     * [path](#readonly-path) of this state instance.
     *
     * It returns the same result as [StateMethods.value](#readonly-value) method.
     * 
     * If the additional option `noproxy` is set, the method will return
     * the original data object without wrapping it by proxy.
     * All properties of the object will be marked as used and on change will trigger the rerender.
     * 
     * If the additional option `stealth` is set, the method will not mark
     * the object as used and it will not trigger the rerender if it is changed.
     * It might be helpful to use it during debugging, for example:
     * `console.log(state.get({ stealth: true }))`.
     * If you use it, make sure you know what you are doing. 
     */
    get(options?: { noproxy?: boolean, stealth?: boolean }): S;

    /**
     * Sets new value for a state.
     * If `this.path === []`,
     * it is similar to the `setState` variable returned by `React.useState` hook.
     * If `this.path !== []`, it sets only the segment of the state value, pointed out by the path.
     * Unlike [merge](#merge) method, this method will not accept partial updates.
     * Partial updates can be also done by walking the nested states and setting those.
     *
     * @param newValue new value to set to a state.
     * It can be a value, a promise resolving to a value
     * (only if [this.path](#readonly-path) is `[]`),
     * or a function returning one of these.
     * The function receives the current state value as an argument.
     */
    set(newValue: SetStateAction<S>): void;

    /**
     * Similarly to [set](#set) method updates state value.
     *
     * - If current state value is an object, it does partial update for the object.
     * - If state value is an array and the argument is an array too,
     * it concatenates the current value with the value of the argument and sets it to the state.
     * - If state value is an array and the `merge` argument is an object,
     * it does partial update for the current array value.
     * - If current state value is a string, it concatenates the current state
     * value with the argument converted to string and sets the result to the state.
     */
    merge(newValue: SetPartialStateAction<S>): void;

    /**
     * Returns nested state by key.
     * `state.nested('myprop')` returns the same as `state.myprop` or `state['myprop']`,
     * but also works for properties, which names collide with names of state methods.
     * 
     * [Learn more about nested states...](https://hookstate.js.org/docs/nested-state)
     * 
     * @param key child property name or index
     */
    nested<K extends keyof S>(key: K): State<S[K], E>;

    /**
     * If state value is null or undefined, returns state value.
     * Otherwise, it returns this state instance but
     * with null and undefined removed from the type parameter.
     * 
     * [Learn more...](https://hookstate.js.org/docs/nullable-state)
     */
    ornull: InferredStateOrnullType<S, E>;

    // TODO deprecate
    /**
     * Adds plugin to the state.
     * 
     * [Learn more...](https://hookstate.js.org/docs/extensions-overview)
     */
    attach(plugin: () => Plugin): State<S, E>

    // TODO deprecate
    /**
     * For plugin developers only.
     * It is a method to get the instance of the previously attached plugin.
     * If a plugin has not been attached to a state,
     * it returns an Error as the first element.
     * A plugin may trhow an error to indicate that plugin has not been attached.
     * 
     * [Learn more...](https://hookstate.js.org/docs/writing-plugin)
     */
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>]
}

/**
 * Mixin for the [StateMethods](#interfacesstatemethodsmd) for a [State](#state),
 * which can be destroyed by a client.
 */
export interface StateMethodsDestroy {
    /**
     * Destroys an instance of a state, so
     * it can clear the allocated native resources (if any)
     * and can not be used anymore after it has been destroyed.
     */
    destroy(): void;
}

/**
 * Returns an interface stripped of all keys that don't resolve to U, defaulting 
 * to a non-strict comparison of T[key] extends U. Setting B to true performs
 * a strict type comparison of T[key] extends U & U extends T[key]
 */
type KeysOfType<T, U, B = false> = {
    [P in keyof T]: B extends true
    ? T[P] extends U
    ? (U extends T[P]
        ? P
        : never)
    : never
    : T[P] extends U
    ? P
    : never;
}[keyof T];

// type PickByType<T, U, B = false> = Pick<T, KeysOfType<T, U, B>>;

export const __state = Symbol('__state')
export interface State_<S, E> {
    [__state]: (s: S, e: E) => never
}

// TODO document, give example how to use in extension method signatures
export type StateValue<V> = V extends State_<(infer S), (infer _)> ? S : V
// TODO document, give example how to use in extension method signatures
export type StateExtension<V> = V extends State_<(infer _), (infer E)> ? E : V

/**
 * Type of a result of [createState](#createstate) and [useState](#usestate) functions
 * 
 * @typeparam S Type of a value of a state
 * 
 * [Learn more about global states...](https://hookstate.js.org/docs/global-state)
 * [Learn more about local states...](https://hookstate.js.org/docs/local-state)
 * [Learn more about nested states...](https://hookstate.js.org/docs/nested-state)
 */
export type State<S, E = {}> = StateMethods<S, E> & E & (
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<State<U, E>> :
    S extends object ? Omit<
        { readonly [K in keyof Required<S>]: State<S[K], E>; },
        keyof StateMethods<S, E> | keyof StateMethodsDestroy | KeysOfType<S, Function> | keyof E
    > : {}
);

/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with root state value.
 *
 * @hidden
 * @ignore
 */
export type StateValueAtRoot = any; //tslint:disable-line: no-any
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with nested state value.
 *
 * @hidden
 * @ignore
 */
export type StateValueAtPath = any; //tslint:disable-line: no-any
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with state error.
 *
 * @hidden
 * @ignore
 */
export type StateErrorAtRoot = any; //tslint:disable-line: no-any
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with context value.
 *
 * @hidden
 * @ignore
 */
export type AnyContext = any; //tslint:disable-line: no-any

/**
 * For plugin developers only.
 * Extension.onSet argument type.
 */
export interface ExtensionOnSetArgument {
    readonly state: State<StateValueAtRoot, {}>,
    readonly descriptor: SetActionDescriptor
}

/**
 * For plugin developers only.
 * PluginCallbacks.onSet argument type.
 */
export interface PluginCallbacksOnSetArgument {
    readonly path: Path,
    readonly state?: StateValueAtRoot,
    /**
     * **A note about previous values and merging:**
     * State values are muteable in Hookstate for performance reasons. This causes a side effect in the merge operation.
     * While merging, the previous state object is mutated as the desired changes are applied. This means the value of
     * `previous` will reflect the merged changes as well, matching the new `state` value rather than the previous
     * state value. As a result, the `previous` property is unreliable when merge is used. The
     * [merged](#optional-readonly-merged) property can be used to detect which values were merged in but it will not
     * inform you whether those values are different from the previous state.
     *
     * As a workaround, you can replace merge calls with the immutable-style set operation like so:
     *
     * ```
     * state.set(p => {
     *     let copy = p.clone(); /// here it is up to you to define how to clone the current state
     *     copy.field = 'new value for field';
     *     delete copy.fieldToDelete;
     *     return copy;
     * })
     * ```
     */
    readonly previous?: StateValueAtPath,
    readonly value?: StateValueAtPath,
    readonly merged?: StateValueAtPath,
}

/**
 * For plugin developers only.
 * PluginCallbacks.onDestroy argument type.
 */
export interface PluginCallbacksOnDestroyArgument {
    readonly state?: StateValueAtRoot,
}

/**
 * For plugin developers only.
 * Set of callbacks, a plugin may subscribe to.
 * 
 * [Learn more...](https://hookstate.js.org/docs/writing-plugin)
 */
export interface PluginCallbacks {
    readonly onSet?: (arg: PluginCallbacksOnSetArgument) => void,
    readonly onDestroy?: (arg: PluginCallbacksOnDestroyArgument) => void,
};

/**
 * For plugin developers only.
 * Hookstate plugin specification and factory method.
 * 
 * [Learn more...](https://hookstate.js.org/docs/writing-plugin)
 */
export interface Plugin {
    /**
     * Unique identifier of a plugin.
     */
    readonly id: symbol;
    /**
     * Initializer for a plugin when it is attached for the first time.
     */
    readonly init?: (state: State<StateValueAtRoot, {}>) => PluginCallbacks;
}

// TODO document
export interface Extension<E extends {}> {
    readonly onInit: (state: () => State<StateValueAtRoot, {}>) => {
        readonly [K in keyof Required<E>]: (state: State<StateValueAtPath, {}>) => E[K];
    },
    readonly onSet?: (state: State<StateValueAtRoot, {}>, descriptor: SetActionDescriptor) => void,
    readonly onDestroy?: (state: State<StateValueAtRoot, {}>) => void,
};

// TODO deprecate
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
export function createState<S>(
    initial: SetInitialStateAction<S>
): State<S, {}> & StateMethodsDestroy {
    return createHookstate(initial)
}

export function createHookstate<S, E>(
    initial: SetInitialStateAction<S>,
    extension?: () => Extension<E>
): State<S, E> & StateMethodsDestroy {
    const methods = createStore(initial, extension).toMethods();
    const devtools = createState[DevToolsID]
    if (devtools) {
        methods.attach(devtools)
    }
    return methods.self() as unknown as State<S, E> & StateMethodsDestroy;
}

// TODO deprectate useState
/**
 * @warning Initializing a local state to a promise without using 
 * an initializer callback function, which returns a Promise,
 * is almost always a mistake. So, it is blocked.
 * Use `useState(() => your_promise)` instead of `useState(your_promise)`.
 */
export function useState<S>(
    source: Promise<S>
): never;
/**
 * Enables a functional React component to use a state,
 * either created by [createState](#createstate) (*global* state) or
 * derived from another call to [useState](#usestate) (*scoped* state).
 *
 * The `useState` forces a component to rerender every time, when:
 * - a segment/part of the state data is updated *AND only if*
 * - this segment was **used** by the component during or after the latest rendering.
 *
 * For example, if the state value is `{ a: 1, b: 2 }` and
 * a component uses only `a` property of the state, it will rerender
 * only when the whole state object is updated or when `a` property is updated.
 * Setting the state value/property to the same value is also considered as an update.
 *
 * A component can use one or many states,
 * i.e. you may call `useState` multiple times for multiple states.
 *
 * The same state can be used by multiple different components.
 *
 * @param source a reference to the state to hook into
 *
 * The `useState` is a hook and should follow React's rules of hooks.
 *
 * @returns an instance of [State](#state),
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
 */
export function useState<S>(
    source: State<S, {}>
): State<S, {}>;
/**
 * This function enables a functional React component to use a state,
 * created per component by [useState](#usestate) (*local* state).
 * In this case `useState` behaves similarly to `React.useState`,
 * but the returned instance of [State](#state)
 * has got more features.
 *
 * When a state is used by only one component, and maybe it's children,
 * it is recommended to use *local* state instead of *global*,
 * which is created by [createState](#createstate).
 *
 * *Local* (per component) state is created when a component is mounted
 * and automatically destroyed when a component is unmounted.
 *
 * The same as with the usage of a *global* state,
 * `useState` forces a component to rerender when:
 * - a segment/part of the state data is updated *AND only if*
 * - this segment was **used** by the component during or after the latest rendering.
 *
 * You can use as many local states within the same component as you need.
 *
 * @param source An initial value state.
 *
 * @returns an instance of [State](#state),
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
 */
export function useState<S>(
    source: SetInitialStateAction<S>
): State<S, {}>;
export function useState<S>(
    source: SetInitialStateAction<S> | State<S, {}>
): State<S, {}> {
    return useHookstate(source as State<S, {}>);
}

// TODO document
export function extend<
    E1 extends {} = {},
    E2 extends {} = {},
    E3 extends {} = {},
    E4 extends {} = {},
    E5 extends {} = {}
>(extensions: [
    Extension<E1>, Extension<E2>?, Extension<E3>?, Extension<E4>?, Extension<E5>?
]): Extension<E5 & E4 & E3 & E2 & E1> {
    let exts = extensions.filter(i => i);
    let onSetCbs = exts.map(i => i!.onSet).filter(i => i)
    let onDestroyCbs = exts.map(i => i!.onDestroy).filter(i => i)
    let result: Writeable<Extension<{}>> = {
        onInit: (instanceFactory) => {
            let combinedMethods: Record<string, (i: State<StateValueAtPath, {}>) => any> = {}
            for (let ext of exts) {
                let extMethods = ext!.onInit(instanceFactory)
                combinedMethods = {
                    ...combinedMethods,
                    ...extMethods,
                }
            }
            return combinedMethods
        }
    }
    if (onSetCbs.length > 0) {
        result.onSet = (s, d) => {
            for (let cb of onSetCbs) {
                cb!(s, d);
            }
        }
    }
    if (onDestroyCbs.length > 0) {
        result.onDestroy = (s) => {
            for (let cb of onDestroyCbs) {
                cb!(s);
            }
        }
    }
    return result as Extension<E1 & E2 & E3 & E4 & E5>
}

/**
 * @warning Initializing a local state to a promise without using 
 * an initializer callback function, which returns a Promise,
 * is almost always a mistake. So, it is blocked.
 * Use `useHookstate(() => your_promise)` instead of `useHookstate(your_promise)`.
 */
export function useHookstate<S, E>(
    source: Promise<S>,
    extension?: () => Extension<E>
): never;
// TODO block this on type system level
export function useHookstate<S, E, E2>(
    source: State_<S, E>,
    extension: () => Extension<E2>
): never;
/**
 * Alias to [useState](#usestate) which provides a workaround
 * for [React 20613 bug](https://github.com/facebook/react/issues/20613)
 */
export function useHookstate<S, E>(
    source: State_<S, E>
): State<S, E>;
/**
 * Alias to [useState](#usestate) which provides a workaround
 * for [React 20613 bug](https://github.com/facebook/react/issues/20613)
 */
export function useHookstate<S, E>(
    source: SetInitialStateAction<S>,
    extension?: () => Extension<E>
): State<S, E>;
export function useHookstate<S, E>(
    source: SetInitialStateAction<S> | State<S, E>,
    extension?: () => Extension<E>
): State<S, E> {
    const parentMethods = Object(source) === source ?
        source[self] as StateMethodsImpl<S, E> | undefined :
        undefined;
    if (parentMethods) {
        if (parentMethods.isMounted) {
            // Scoped state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const initializer = () => {
                let store = parentMethods.store
                let onSetUsedCallback = () => setValue({
                    store: store, // immutable
                    state: state, // immutable
                    source: value.source // mutable, get the latest from value
                })
                let state = new StateMethodsImpl<S, E>(
                    store,
                    parentMethods.path,
                    store.get(parentMethods.path),
                    store.edition,
                    onSetUsedCallback
                );
                return {
                    store: store,
                    state: state,
                    source: source
                }
            };
            const [value, setValue] = React.useState(initializer);
            // TODO move to a class hide props on prototype level
            // hide props from development tools
            Object.defineProperty(value, 'store', { enumerable: false });
            Object.defineProperty(value, 'state', { enumerable: false });
            Object.defineProperty(value, 'source', { enumerable: false });

            value.state.reconstruct(
                parentMethods.path,
                value.store.get(parentMethods.path),
                value.store.edition,
                // parent state object has changed its reference object
                // so the scopped state should change too
                value.source !== source
            );
            value.source = source;

            parentMethods.subscribe(value.state); // in sync here, not in effect
            useIsomorphicLayoutEffect(() => {
                return () => {
                    value.state.onUnmount()
                    parentMethods.unsubscribe(value.state);
                }
            }, []);

            let state = value.state.self();
            // expose property in development tools
            value['[hookstate(scoped)]'] = state; // TODO use label here, add core extension to label states
            return state
        } else {
            // Global state mount or destroyed link
            // eslint-disable-next-line react-hooks/rules-of-hooks
            let initializer = () => {
                let store = parentMethods.store
                let onSetUsedCallback = () => setValue({
                    store: store, // immutable
                    state: state, // immutable
                    source: value.source // mutable, get the latest from value
                })
                let state = new StateMethodsImpl<S, E>(
                    store,
                    RootPath,
                    store.get(RootPath),
                    store.edition,
                    onSetUsedCallback
                );
                return {
                    store: store,
                    state: state,
                    source: source
                }
            }
            const [value, setValue] = React.useState(initializer);
            // hide props from development tools
            Object.defineProperty(value, 'store', { enumerable: false });
            Object.defineProperty(value, 'state', { enumerable: false });
            Object.defineProperty(value, 'source', { enumerable: false });

            value.state.reconstruct(
                RootPath,
                value.store.get(RootPath),
                value.store.edition,
                // parent state object has changed its reference object
                // so the scopped state should change too
                value.source !== source
            );
            value.source = source;

            value.store.subscribe(value.state); // in sync here, not in effect
            useIsomorphicLayoutEffect(() => {
                return () => {
                    value.state.onUnmount()
                    value.store.unsubscribe(value.state);
                }
            }, []);

            let state: State<StateValueAtPath, E> = value.state.self();
            for (let ind = 0; ind < parentMethods.path.length; ind += 1) {
                state = state.nested(parentMethods.path[ind]);
            }
            // expose property in development tools
            value['[hookstate(global)]'] = state; // TODO use label here, add core extension to label states
            return state as State<S, E>;
        }
    } else {
        // Local state mount
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let initializer = () => {
            let store = createStore(source, extension)
            let onSetUsedCallback = () => setValue({
                store: store,
                state: state,
            })
            let state = new StateMethodsImpl<S, E>(
                store,
                RootPath,
                store.get(RootPath),
                store.edition,
                onSetUsedCallback
            );
            return {
                store: store,
                state: state
            }
        }
        const [value, setValue] = React.useState(initializer);
        // hide props from development tools
        Object.defineProperty(value, 'store', { enumerable: false });
        Object.defineProperty(value, 'state', { enumerable: false });

        value.state.reconstruct(
            RootPath,
            value.store.get(RootPath),
            value.store.edition,
            false
        );

        value.store.subscribe(value.state); // in sync here, not in effect
        useIsomorphicLayoutEffect(() => {
            return () => {
                value.state.onUnmount()
                value.store.unsubscribe(value.state);
            }
        }, []);

        if (configuration.isDevelopmentMode) {
            // This is a workaround for the issue:
            // https://github.com/avkonst/hookstate/issues/109
            // See technical notes on React behavior here:
            // https://github.com/apollographql/apollo-client/issues/5870#issuecomment-689098185
            const isEffectExecutedAfterRender = React.useRef(false);
            isEffectExecutedAfterRender.current = false; // not yet...

            // TODO make this origin and not intercepted (visible in devtools)
            useEffectOrigin(() => {
                isEffectExecutedAfterRender.current = true; // ... and now, yes!
                // The state is not destroyed intentionally
                // under hot reload case.
                return () => { isEffectExecutedAfterRender.current && value.store.destroy() }
            });
        } else {
            // TODO make this origin and not intercepted (visible in devtools)
            useEffectOrigin(() => () => value.store.destroy(), []);
        }
        const devtools = useState[DevToolsID]
        if (devtools) {
            value.state.attach(devtools)
        }
        let state = value.state.self();
        // expose property in development tools
        value['[hookstate(local)]'] = state; // TODO use label here, add core extension to label states
        return state
    }
}

// TODO block on type system
export function StateFragment<S, E>(
    props: {
        state: State_<S, E>,
        extension: () => Extension<E>,
        children: (state: State<S, E>) => React.ReactElement,
    }
): never;
/**
 * Allows to use a state without defining a functional react component.
 * It can be also used in class-based React components. It is also
 * particularly useful for creating *scoped* states.
 *
 * [Learn more...](https://hookstate.js.org/docs/using-without-statehook)
 * 
 * @typeparam S Type of a value of a state
 */
export function StateFragment<S, E>(
    props: {
        state: State_<S, E>,
        children: (state: State<S, E>) => React.ReactElement,
    }
): React.ReactElement;
/**
 * Allows to use a state without defining a functional react component.
 * See more at [StateFragment](#statefragment)
 * 
 * [Learn more...](https://hookstate.js.org/docs/using-without-statehook)
 * 
 * @typeparam S Type of a value of a state
 */
export function StateFragment<S, E>(
    props: {
        state: SetInitialStateAction<S>,
        extension?: () => Extension<E>,
        children: (state: State<S, E>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E>(
    props: {
        state: State<S, E> | SetInitialStateAction<S>,
        extension?: () => Extension<E>,
        children: (state: State<S, E>) => React.ReactElement,
    }
): React.ReactElement {
    const scoped = useHookstate(props.state as SetInitialStateAction<S>, props.extension);
    return props.children(scoped);
}

// TODO deprecate
/**
 * A plugin which allows to opt-out from usage of Javascript proxies for
 * state usage tracking. It is useful for performance tuning.
 * 
 * [Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)
 */
export function Downgraded(): Plugin { // tslint:disable-line: function-name
    return {
        id: DowngradedID
    }
}

/**
 * For plugin developers only.
 * Reserved plugin ID for developers tools extension.
 *
 * @hidden
 * @ignore
 */
export const DevToolsID = Symbol('DevTools');

/**
 * Return type of [DevTools](#devtools).
 */
export interface DevToolsExtensions {
    /**
     * Assigns custom label to identify the state in the development tools
     * @param name label for development tools
     */
    label(name: string): void;
    /**
     * Logs to the development tools
     */
    log(str: string, data?: any): void;    // tslint:disable-line: no-any
}

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
export function DevTools<S, E>(state: State<S, E>): DevToolsExtensions {
    const plugin = state.attach(DevToolsID);
    if (plugin[0] instanceof Error) {
        return EmptyDevToolsExtensions;
    }
    return plugin[0] as DevToolsExtensions;
}

///
/// INTERNAL SYMBOLS (LIBRARY IMPLEMENTATION)
///

const self = Symbol('self')

const EmptyDevToolsExtensions: DevToolsExtensions = {
    label() { /* */ },
    log() { /* */ }
}

enum ErrorId {
    // TODO document
    StateUsedInDependencyList = 100,

    InitStateToValueFromState = 101,
    SetStateToValueFromState = 102,
    GetStateWhenPromised = 103,
    SetStateWhenPromised = 104,
    SetStateNestedToPromised = 105,
    SetStateWhenDestroyed = 106,
    ToJson_Value = 108,
    ToJson_State = 109,

    // TODO document
    GetProperty_Function = 110,

    GetUnknownPlugin = 120,

    SetProperty_State = 201,
    SetProperty_Value = 202,
    SetPrototypeOf_State = 203,
    SetPrototypeOf_Value = 204,
    PreventExtensions_State = 205,
    PreventExtensions_Value = 206,
    DefineProperty_State = 207,
    DefineProperty_Value = 208,
    DeleteProperty_State = 209,
    DeleteProperty_Value = 210,
    Construct_State = 211,
    Construct_Value = 212,
    Apply_State = 213,
    Apply_Value = 214,

    // TODO document
    InternalError = 0,
}

class StateInvalidUsageError extends Error {
    constructor(path: Path, id: ErrorId, details?: string) {
        super(`Error: HOOKSTATE-${id} [path: /${path.join('/')}${details ? `, details: ${details}` : ''}]. ` +
            `See https://hookstate.js.org/docs/exceptions#hookstate-${id}`)
    }
}

interface Subscriber {
    onSet(paths: SetActionDescriptor, actions: Set<() => void>): boolean;
}

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

// TODO deprecate
const DowngradedID = Symbol('Downgraded');
const SelfMethodsID = Symbol('ProxyMarker');

const RootPath: Path = [];
const DestroyedEdition = -1

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

// TODO document move
export interface SetActionDescriptor {
    path: Path,
    actions?: Record<string | number, "I" | "U" | "D">
}

class Store implements Subscribable {
    private _edition = 0;
    private _stateMethods: StateMethodsImpl<StateValueAtRoot, {}>;

    private _subscribers: Set<Subscriber> = new Set();
    private _setSubscribers: Set<Required<PluginCallbacks>['onSet']> = new Set();
    private _destroySubscribers: Set<Required<PluginCallbacks>['onDestroy']> = new Set();

    private _plugins: Map<symbol, PluginCallbacks> = new Map();
    private _extensionMethods: {} | undefined;

    private _promise?: Promise<StateValueAtRoot>;
    private _promiseResolver?: (_: StateValueAtRoot) => void;
    private _promiseError?: StateValueAtRoot;

    constructor(private _value: StateValueAtRoot, private _extension?: Extension<{}>) {
        if (Object(_value) === _value &&
            configuration.promiseDetector(_value)) {
            this.setPromised(_value)
        } else if (_value === none) {
            this.setPromised(undefined)
        }

        let onSetUsedStoreStateMethods = () => {
            this._stateMethods.reconstruct(
                RootPath,
                this.get(RootPath),
                this.edition,
                false
            )
        }
        onSetUsedStoreStateMethods[UnmountedMarker] = true

        this._stateMethods = new StateMethodsImpl<StateValueAtRoot, {}>(
            this,
            RootPath,
            this.get(RootPath),
            this.edition,
            onSetUsedStoreStateMethods
        )
        this.subscribe(this._stateMethods)

        this._extensionMethods = this._extension?.onInit(() => this.toMethods().self())
    }

    setPromised(promise: StateValueAtPath | undefined) {
        this._value = none
        this._promiseError = undefined
        this._promiseResolver = undefined

        if (!promise) {
            this._promise = new Promise<StateValueAtRoot>(resolve => {
                this._promiseResolver = resolve;
            })
            return;
        }

        promise = promise
            .then((r: StateValueAtRoot) => {
                if (this._promise === promise && this.edition !== DestroyedEdition) {
                    this._promise = undefined
                    this._promiseError = undefined
                    this._promiseResolver === undefined
                    this.update(this.set(RootPath, r, undefined))
                }
            })
            .catch((err: StateValueAtRoot) => {
                if (this._promise === promise && this.edition !== DestroyedEdition) {
                    this._promise = undefined
                    this._promiseResolver = undefined
                    this._promiseError = err
                    this._edition += 1
                    let ad = { path: RootPath };
                    this.update(ad)
                }
            })
        this._promise = promise
    }

    get extension() {
        return this._extensionMethods
    }

    get edition() {
        return this._edition;
    }

    get promise() {
        return this._promise;
    }

    get promiseError() {
        return this._promiseError;
    }

    get(path: Path) {
        let result = this._value;
        if (result === none) {
            return result;
        }
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    set(path: Path, value: StateValueAtPath, mergeValue: Partial<StateValueAtPath> | undefined): SetActionDescriptor {
        if (this._edition < 0) {
            // TODO convert to console log
            throw new StateInvalidUsageError(path, ErrorId.SetStateWhenDestroyed)
        }

        if (path.length === 0) {
            // Root value UPDATE case,

            const onSetArg: Writeable<PluginCallbacksOnSetArgument> = {
                path: path,
                state: value,
                value: value,
                previous: this._value,
                merged: mergeValue
            }
            if (value === none) {
                this.setPromised(undefined)
                delete onSetArg.value
                delete onSetArg.state
            } else if (Object(value) === value && configuration.promiseDetector(value)) {
                this.setPromised(value)
                value = none
                delete onSetArg.value
                delete onSetArg.state
            } else if (this._promise && !this._promiseResolver) {
                throw new StateInvalidUsageError(path, ErrorId.SetStateWhenPromised)
            } else {
                this._promiseError = undefined
            }

            let prevValue = this._value;
            if (prevValue === none) {
                delete onSetArg.previous
            }
            this._value = value;
            this.afterSet(onSetArg)

            if (prevValue === none && this._value !== none && this._promiseResolver) {
                this._promise = undefined
                this._promiseError = undefined
                let resolver = this._promiseResolver
                this._promiseResolver === undefined
                resolver(this._value)
            }

            return {
                path
            };
        }

        if (Object(value) === value && configuration.promiseDetector(value)) {
            // TODO this one still can get into the state as nested property, need to check on read instead
            throw new StateInvalidUsageError(path, ErrorId.SetStateNestedToPromised)
        }

        let target = this._value;
        for (let i = 0; i < path.length - 1; i += 1) {
            target = target[path[i]];
        }

        const p = path[path.length - 1]
        if (p in target) {
            if (value !== none) {
                // Property UPDATE case
                let prevValue = target[p]
                target[p] = value;
                this.afterSet({
                    path: path,
                    state: this._value,
                    value: value,
                    previous: prevValue,
                    merged: mergeValue
                })

                return {
                    path
                };
            } else {
                // Property DELETE case
                let prevValue = target[p]
                if (Array.isArray(target) && typeof p === 'number') {
                    target.splice(p, 1)
                } else {
                    delete target[p]
                }
                this.afterSet({
                    path: path,
                    state: this._value,
                    previous: prevValue,
                    merged: mergeValue
                })

                // if an array of objects is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return {
                    path: path.slice(0, -1),
                    actions: { [p]: "D" as "D" }
                }
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
            })

            // if an array of objects is about to be extended by new property
            // we consider it is the whole object is changed
            // which is identified by upper path
            return {
                path: path.slice(0, -1),
                actions: { [p]: "I" as "I" }
            }
        }

        // Non-existing property DELETE case
        // no-op
        return {
            path
        };
    }

    update(ad: SetActionDescriptor) {
        this._extension?.onSet?.(this.toMethods().self(), ad)

        const actions = new Set<() => void>();
        // check if actions descriptor can be unfolded into a number of individual update actions
        // this is the case when merge call swaps to properties for example
        // so we optimize rerendering only these properties
        if (ad.actions && Object.values(ad.actions).findIndex(i => i !== "U") === -1) {
            // all actions are update actions
            Object.keys(ad.actions).forEach(key => {
                this._subscribers.forEach(s => s.onSet({ path: ad.path.concat(key) }, actions));
            })
        } else {
            this._subscribers.forEach(s => s.onSet(ad, actions));
        }
        actions.forEach(a => a());
    }

    afterSet(params: PluginCallbacksOnSetArgument) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(cb => cb(params))
        }
    }

    getPlugin(pluginId: symbol) {
        return this._plugins.get(pluginId)
    }

    register(plugin: Plugin) {
        const existingInstance = this._plugins.get(plugin.id)
        if (existingInstance) {
            return;
        }

        const pluginCallbacks = plugin.init ? plugin.init(this.toMethods().self()) : {};
        this._plugins.set(plugin.id, pluginCallbacks);
        if (pluginCallbacks.onSet) {
            this._setSubscribers.add((p) => pluginCallbacks.onSet!(p))
        }
        if (pluginCallbacks.onDestroy) {
            this._destroySubscribers.add((p) => pluginCallbacks.onDestroy!(p))
        }
    }

    toMethods() {
        return this._stateMethods;
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }

    destroy() {
        this._extension?.onDestroy?.(this.toMethods().self())

        let params = this._value !== none ? { state: this._value } : {};
        this._destroySubscribers.forEach(cb => cb(params))
        this._edition = DestroyedEdition
    }

    toJSON() {
        throw new StateInvalidUsageError(RootPath, ErrorId.ToJson_Value);
    }
}

// use symbol property to allow for easier reference finding
const ValueUnusedMarker = Symbol('ValueUnusedMarker');

// use symbol to mark that a function has no effect anymore
const UnmountedMarker = Symbol('UnmountedMarker');

// TODO remove from the docs IE11 support

class StateMethodsImpl<S, E> implements StateMethods<S, E>, StateMethodsDestroy, Subscribable, Subscriber {
    private subscribers: Set<Subscriber> | undefined;

    private downgraded: boolean | undefined;
    private childrenCreated: Record<string | number, StateMethodsImpl<StateValueAtPath, E>> | undefined;
    private childrenUsedPrevious: Record<string | number, StateMethodsImpl<StateValueAtPath, E>> | undefined;
    private childrenUsed: Record<string | number, StateMethodsImpl<StateValueAtPath, E>> | undefined;
    private selfUsed: State<S, E> | undefined;
    private valueUsed: StateValueAtPath = ValueUnusedMarker;

    [__state]: (s: S, e: E) => never = () => {
        // this is impossible (from the typescript point of view) to reach 
        // to this function and call it from the client side
        throw new StateInvalidUsageError(this.path, ErrorId.InternalError)
    };

    constructor(
        public readonly store: Store,
        public path: Path,
        private valueSource: S,
        private valueEdition: number,
        private onSetUsed: () => void
    ) { }

    reconstruct(path: Path, valueSource: S, valueEdition: number, reset: boolean) {
        this.path = path;
        this.valueSource = valueSource;
        this.valueEdition = valueEdition;

        this.valueUsed = ValueUnusedMarker;
        delete this.downgraded;

        if (reset) {
            delete this.selfUsed;
            delete this.childrenCreated
            delete this.childrenUsedPrevious
        } else {
            this.childrenUsedPrevious = this.childrenUsed;
        }
        delete this.childrenUsed

        // We should not delete subscribers as these are self cleaned up when unmounted
        // Theoretically it is possible to reconnect subscribers like we done it for 
        // children, but it is easier and more efficient to leave subscribers to have independent lifecycle
        // If we delete subscribers here, scoped states wrapped in React.memo
        // will lose state change propagation and rerendering for scopped states
        // delete this.subscribers;
    }

    reconnect() {
        this.childrenUsed = {
            ...this.childrenUsedPrevious,
            ...this.childrenUsed
        }
    }

    getUntracked(__internalAllowPromised?: boolean) {
        if (this.valueEdition !== this.store.edition) {
            this.valueSource = this.store.get(this.path)
            this.valueEdition = this.store.edition

            if (this.valueUsed !== ValueUnusedMarker) {
                this.valueUsed = ValueUnusedMarker
                this.get({ __internalAllowPromised: true }) // renew cache to keep it marked used
            }
        }
        if (__internalAllowPromised) {
            return this.valueSource
        }
        if (this.store.promiseError) {
            throw this.store.promiseError;
        }
        if (this.store.promise) {
            throw new StateInvalidUsageError(this.path, ErrorId.GetStateWhenPromised)
        }
        return this.valueSource;
    }

    get(options?: { noproxy?: boolean, stealth?: boolean, __internalAllowPromised?: boolean }) {
        const valueSource = this.getUntracked(options?.__internalAllowPromised)
        if (options?.stealth) {
            return valueSource;
        }
        if (this.valueUsed === ValueUnusedMarker) {
            if (Array.isArray(valueSource)) {
                this.valueUsed = this.valueArrayImpl(valueSource as unknown as StateValueAtPath[]);
            } else if (Object(valueSource) === valueSource) {
                if ((valueSource as StateValueAtPath).constructor?.name === "Object") {
                    this.valueUsed = this.valueObjectImpl(valueSource as unknown as object);
                } else {
                    // any other object except Object, for example Date
                    this.downgraded = true
                    this.valueUsed = valueSource;
                }
            } else {
                this.valueUsed = valueSource;
            }
        }
        if (options?.noproxy) {
            this.downgraded = true
            return valueSource;
        }
        return this.valueUsed as S;
    }

    get value(): S {
        // various tools, including react dev tools and webpack import
        // inspect an object and it's properties
        // so these should not throw
        // return this.get({ __internalAllowPromised: true })
        return this.get()
    }

    setUntracked(newValue: SetStateAction<S>, mergeValue?: Partial<StateValueAtPath>): Path[] {
        let r = this.setUntrackedV4(newValue, mergeValue);
        if (r) {
            return [r.path]
        }
        return []
    }

    setUntrackedV4(newValue: SetStateAction<S>, mergeValue?: Partial<StateValueAtPath>): SetActionDescriptor | null {
        if (typeof newValue === 'function') {
            newValue = (newValue as ((prevValue: S) => S))(this.getUntracked());
        }
        if (Object(newValue) === newValue && newValue[SelfMethodsID]) {
            // TODO check on read instead as it might escape as nested on set anyway
            throw new StateInvalidUsageError(this.path, ErrorId.SetStateToValueFromState)
        }
        if (newValue !== Object(newValue) && newValue === this.getUntracked(true)) {
            // this is primitive value and has not changed
            // so skip this set call as it does not make an effect
            return null
        }
        return this.store.set(this.path, newValue, mergeValue);
    }

    set(newValue: SetStateAction<S>) {
        let ad = this.setUntrackedV4(newValue);
        if (ad) {
            this.store.update(ad);
        }
    }

    mergeUntracked(sourceValue: SetPartialStateAction<S>): Path[] {
        let r = this.mergeUntrackedV4(sourceValue);
        if (r) {
            return [r.path]
        }
        return []
    }

    mergeUntrackedV4(sourceValue: SetPartialStateAction<S>): SetActionDescriptor | null {
        const currentValue = this.getUntracked()
        if (typeof sourceValue === 'function') {
            sourceValue = (sourceValue as Function)(currentValue);
        }

        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                let ad: Required<SetActionDescriptor> = { path: this.path, actions: {} };
                sourceValue.forEach((e, i) => {
                    ad.actions[currentValue.push(e) - 1] = "I"
                })
                if (Object.keys(ad.actions).length > 0) {
                    this.setUntrackedV4(currentValue, sourceValue)
                    return ad
                }
                return null
            } else {
                let ad: Required<SetActionDescriptor> = { path: this.path, actions: {} };
                const deletedIndexes: number[] = []
                Object.keys(sourceValue).sort().forEach(i => {
                    const index = Number(i);
                    const newPropValue = sourceValue[index]
                    if (newPropValue === none) {
                        ad.actions[index] = "D"
                        deletedIndexes.push(index)
                    } else {
                        if (index in currentValue) {
                            ad.actions[index] = "U"
                        } else {
                            ad.actions[index] = "I"
                        }
                        (currentValue as StateValueAtPath[])[index] = newPropValue
                    }
                });
                // indexes are ascending sorted as per above
                // so, delete one by one from the end
                // this way index positions do not change
                deletedIndexes.reverse().forEach(p => {
                    (currentValue as unknown as []).splice(p, 1)
                })
                if (Object.keys(ad.actions).length > 0) {
                    this.setUntrackedV4(currentValue, sourceValue)
                    return ad
                }
                return null
            }
        } else if (Object(currentValue) === currentValue) {
            let ad: Required<SetActionDescriptor> = { path: this.path, actions: {} };
            Object.keys(sourceValue).forEach(key => {
                const newPropValue = sourceValue[key]
                if (newPropValue === none) {
                    ad.actions[key] = "D"
                    delete currentValue[key]
                } else {
                    if (key in currentValue) {
                        ad.actions[key] = "U"
                    } else {
                        ad.actions[key] = "I"
                    }
                    currentValue[key] = newPropValue
                }
            })
            if (Object.keys(ad.actions).length > 0) {
                this.setUntrackedV4(currentValue, sourceValue)
                return ad
            }
            return null
        } else if (typeof currentValue === 'string') {
            return this.setUntrackedV4((currentValue + String(sourceValue)) as unknown as S, sourceValue)
        } else {
            return this.setUntrackedV4(sourceValue as S)
        }
    }

    merge(sourceValue: SetPartialStateAction<S>) {
        let r = this.mergeUntrackedV4(sourceValue);
        if (r) {
            this.store.update(r)
        }
    }

    nested<K extends keyof S>(key: K): State<S[K], E> {
        return this.child(key as string | number).self() as State<S[K], E>
    }

    rerender(paths: Path[]) {
        for (let path of paths) {
            this.store.update({ path })
        }
    }

    destroy(): void {
        this.store.destroy()
    }

    subscribe(l: Subscriber) {
        if (this.subscribers === undefined) {
            this.subscribers = new Set();
        }
        this.subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        if (this.subscribers) {
            this.subscribers.delete(l);
        }
    }

    get isMounted(): boolean {
        return !this.onSetUsed[UnmountedMarker]
    }

    onMount() {
        delete this.onSetUsed[UnmountedMarker];
    }

    onUnmount() {
        this.onSetUsed[UnmountedMarker] = true
    }

    onSet(ad: SetActionDescriptor, actions: Set<() => void>): boolean {
        const update = () => {
            let isAffected = false
            if (this.downgraded
                // TODO this condition becomes redundant when Downgraded plugins is deleted
                && this.valueUsed !== ValueUnusedMarker) {
                actions.add(this.onSetUsed);
                delete this.selfUsed;
                isAffected = true;
            }
            let path = ad.path;
            const nextChildKey = path[this.path.length];
            if (nextChildKey === undefined) {
                // There is no next child to dive into
                // So it is this one which was updated
                if (this.valueUsed !== ValueUnusedMarker) {
                    actions.add(this.onSetUsed);
                    delete this.selfUsed;
                    delete this.childrenUsed;

                    if (ad.actions && this.childrenCreated) {
                        // TODO add automated unit tests for this part
                        if (Array.isArray(this.valueSource)
                            && Object.values(ad.actions).includes("D")) {
                            // this is an array and some elements were removed
                            // so invalidate cache for all children after the first deleted
                            let firstDeletedIndex = Object.keys(ad.actions)
                                .map(i => Number(i))
                                .sort()
                                .find(i => ad.actions?.[i] === "D")!
                            for (let childKey in this.childrenCreated) {
                                if (Number(childKey) >= firstDeletedIndex ||
                                    childKey in ad.actions) {
                                    delete this.childrenCreated[childKey]
                                }
                            }
                        } else {
                            for (let childKey in ad.actions) {
                                delete this.childrenCreated[childKey]
                            }
                        }
                    } else {
                        delete this.childrenCreated;
                    }
                    return true;
                }
            } else {
                const nextChild = this.childrenUsed?.[nextChildKey];
                if (nextChild && nextChild.onSet(ad, actions)) {
                    delete this.selfUsed;
                    return true;
                }
            }
            return isAffected;
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(s => {
                if (s.onSet(ad, actions)) {
                    delete this.selfUsed;
                }
            })
        }
        return updated;
    }

    get keys(): InferredStateKeysType<S> {
        const value = this.get()
        if (Array.isArray(value)) {
            return Object.keys(value).map(i => Number(i)).filter(i => Number.isInteger(i)) as
                unknown as InferredStateKeysType<S>;
        }
        if (Object(value) === value) {
            return Object.keys(value) as unknown as InferredStateKeysType<S>;
        }
        return undefined as InferredStateKeysType<S>;
    }

    child(key: number | string) {
        this.childrenUsed = this.childrenUsed || {};
        const cachedChild = this.childrenUsed.hasOwnProperty(key) && this.childrenUsed[key];
        if (cachedChild) {
            return cachedChild;
        }

        const valueSource = this.valueSource[key]
        if (typeof valueSource === 'function') {
            // hitting a method of a custom type, should be no-op
            throw new StateInvalidUsageError(this.path, ErrorId.GetProperty_Function)
        }
        this.childrenCreated = this.childrenCreated || {};
        const child = this.childrenCreated[key];
        let r;
        if (child) {
            child.reconstruct(
                this.path.concat(key),
                valueSource,
                this.valueEdition,
                false
            )
            r = child;
        } else {
            r = new StateMethodsImpl<StateValueAtPath, E>(
                this.store,
                this.path.concat(key),
                valueSource,
                this.valueEdition,
                this.onSetUsed,
            )
            this.childrenCreated[key] = r;
        }
        if (this.downgraded) {
            // TODO this is redundant when Downgraded plugin is deleted
            r.downgraded = true;
        }
        this.childrenUsed[key] = r;
        return r;
    }

    private valueArrayImpl(currentValue: StateValueAtPath[]): S {
        return proxyWrap(this.path, currentValue,
            () => currentValue,
            (target: object, key: PropertyKey) => {
                if (key === 'length') {
                    return (target as []).length;
                }
                if (key in Array.prototype) {
                    return Array.prototype[key];
                }
                if (key === SelfMethodsID) {
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
                return this.child(index).get();
            },
            (target: object, key: PropertyKey, value: StateValueAtPath) => {
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    target[key] = value;
                    return true;
                }
                throw new StateInvalidUsageError(this.path, ErrorId.SetProperty_Value)
            },
            true
        ) as unknown as S;
    }

    private valueObjectImpl(currentValue: object): S {
        return proxyWrap(this.path, currentValue,
            () => currentValue,
            (target: object, key: PropertyKey) => {
                if (key in Object.prototype) {
                    return Object.prototype[key];
                }
                if (key === SelfMethodsID) {
                    return this;
                }
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    return target[key];
                }
                return this.child(key).get();
            },
            (target: object, key: PropertyKey, value: StateValueAtPath) => {
                if (typeof key === 'symbol') {
                    // allow clients to associate hidden cache with state values
                    target[key] = value;
                    return true;
                }
                throw new StateInvalidUsageError(this.path, ErrorId.SetProperty_Value)
            },
            true
        ) as unknown as S;
    }

    self(): State<S, E> {
        if (this.selfUsed) {
            return this.selfUsed
        }

        const getter = (_: object, key: PropertyKey) => {
            if (key === self) {
                return this
            }
            if (typeof key === 'symbol') {
                return undefined
            }
            if (key === 'toJSON') {
                throw new StateInvalidUsageError(this.path, ErrorId.ToJson_State);
            }

            let nestedGetter = (prop: PropertyKey) => {
                const currentValue = this.get({ __internalAllowPromised: prop === '$$typeof' || prop === 'constructor' });

                if (prop in Object.prototype) {
                    // Mark it used entirely, so changes to the value
                    // invalidate and rerender results for Object.prototype.toString(),
                    // for example.
                    // We check for Object prototype functions
                    // even for primitive values, because primitive values still
                    // can have object methods.
                    return Object.prototype[prop];
                }

                if (// if currentValue is primitive type
                    (Object(currentValue) !== currentValue) &&
                    // if promised, it will be none
                    currentValue !== none) {
                    // This was an error case, but various tools like webpack bundler
                    // and react dev tools attempt to get props out of non-null object,
                    // so this was changed to return just undefined for any property request
                    // as there is no way to fix 3rd party tools.
                    // Logging a warning to console is also not an option
                    // as it pollutes console for legitimate apps on app start app.
                    // Ref: https://github.com/avkonst/hookstate/issues/125
                    return undefined
                }

                if (Array.isArray(currentValue)) {
                    if (prop === 'length') {
                        return currentValue.length;
                    }
                    if (prop in Array.prototype) {
                        return Array.prototype[prop];
                    }
                    const index = Number(prop);
                    if (!Number.isInteger(index)) {
                        return undefined;
                    }
                    return this.nested(index as keyof S)
                }
                return this.nested(prop.toString() as keyof S)
            }

            switch (key) {
                case 'path':
                    return this.path
                case 'keys':
                    return this.keys
                case 'value':
                    return this.value
                case 'ornull':
                    return this.ornull
                case 'promised':
                    return this.promised
                case 'error':
                    return this.error
                case 'get':
                    return (opts: { noproxy: boolean, stealth: boolean }) => this.get(opts)
                case 'set':
                    return (p: SetStateAction<S>) => this.set(p)
                case 'merge':
                    return (p: SetPartialStateAction<S>) => this.merge(p)
                case 'nested':
                    return (p: keyof S) => nestedGetter(p)
                case 'attach':
                    return (p: symbol) => this.attach(p)
                case 'destroy': // TODO move destroy to the state, otherwise State type hides this well existing property
                    return () => this.destroy()
                default:
                    // check if extension method
                    let ext = this.store.extension
                    if (ext && key in ext) {
                        return ext[key](this.self())
                    }
                    // otherwise nested child
                    return nestedGetter(key)
            }
        }

        this.selfUsed = proxyWrap(this.path, this.valueSource,
            (opts) => {
                return this.get({ __internalAllowPromised: true, stealth: opts?.stealth });
            },
            getter,
            (_, key, value) => {
                throw new StateInvalidUsageError(this.path, ErrorId.SetProperty_State)
            },
            false) as unknown as State<S, E>;
        return this.selfUsed
    }

    get promised(): boolean {
        this.get({ __internalAllowPromised: true }) // marks used
        return !!this.store.promise;
    }

    get error(): StateErrorAtRoot | undefined {
        this.get({ __internalAllowPromised: !!this.store.promiseError }) // marks used
        return this.store.promiseError;
    }

    get ornull(): InferredStateOrnullType<S, E> {
        const value = this.get()
        if (value === null || value === undefined) {
            return value as unknown as InferredStateOrnullType<S, E>;
        }
        return this.self() as InferredStateOrnullType<S, E>;
    }

    attach(plugin: () => Plugin): State<S, E>
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>]
    attach(p: (() => Plugin) | symbol):
        State<S, E> | [PluginCallbacks | Error, PluginStateControl<S>] {
        if (typeof p === 'function') {
            const pluginMeta = p();
            if (pluginMeta.id === DowngradedID) {
                this.downgraded = true;
                if (this.valueUsed !== ValueUnusedMarker) {
                    const currentValue = this.getUntracked(true);
                    this.valueUsed = currentValue;
                }
                return this.self();
            }
            this.store.register(pluginMeta);
            return this.self();
        } else {
            return [
                this.store.getPlugin(p) ||
                (new StateInvalidUsageError(this.path, ErrorId.GetUnknownPlugin, p.toString())),
                this
            ];
        }
    }
}

function proxyWrap(
    path: Path,
    // tslint:disable-next-line: no-any
    targetBootstrap: any,
    // tslint:disable-next-line: no-any
    targetGetter: (opts?: { stealth?: boolean }) => any,
    // tslint:disable-next-line: no-any
    propertyGetter: (unused: any, key: PropertyKey) => any,
    // tslint:disable-next-line: no-any
    propertySetter: (unused: any, p: PropertyKey, value: any, receiver: any) => boolean,
    isValueProxy: boolean
) {
    const onInvalidUsage = (op: ErrorId) => {
        throw new StateInvalidUsageError(path, op)
    }
    if (Object(targetBootstrap) !== targetBootstrap) {
        targetBootstrap = {}
    }
    return new Proxy(targetBootstrap, {
        getPrototypeOf: (_target) => {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getPrototypeOf#Invariants
            const targetReal = targetGetter()
            if (targetReal === undefined || targetReal === null) {
                return null;
            }
            if (targetReal === none) {
                return Object.getPrototypeOf(new Promise(() => { }));
            }
            return Object.getPrototypeOf(targetReal);
        },
        setPrototypeOf: (_target, v) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.SetPrototypeOf_State :
                ErrorId.SetPrototypeOf_Value)
        },
        isExtensible: (_target) => {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
            return true; // required to satisfy the invariants of the getPrototypeOf
            // return Object.isExtensible(target);
        },
        preventExtensions: (_target) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.PreventExtensions_State :
                ErrorId.PreventExtensions_Value)
        },
        getOwnPropertyDescriptor: (_target, p) => {
            const targetReal = targetGetter()

            if (Object(targetReal) === targetReal) {
                const origin = Object.getOwnPropertyDescriptor(targetReal, p);
                if (Array.isArray(targetReal) && p in Array.prototype) {
                    return origin;
                }
                return origin && {
                    // should be configurable as may not exist on proxy target
                    configurable: true, // JSON.stringify() does not work for an object without it
                    enumerable: origin.enumerable,
                    get: () => propertyGetter(targetReal, p),
                    set: undefined
                };
            }

            if (isValueProxy || targetReal === none) {
                return undefined;
            }
            if (p === 'value') {
                return {
                    // should be configurable as does not exist on proxy target
                    configurable: true,
                    enumerable: true,
                    get: () => targetGetter({ stealth: true }),
                    set: undefined
                };
            }
            if (p === 'path') {
                return {
                    // should be configurable as does not exist on proxy target
                    configurable: true,
                    enumerable: true,
                    get: () => path,
                    set: undefined
                };
            }
            return undefined;
        },
        has: (_target, p) => {
            if (typeof p === 'symbol') {
                return false;
            }
            const targetReal = targetGetter()
            if (Object(targetReal) === targetReal) {
                return p in targetReal;
            }
            if (isValueProxy || targetReal === none) {
                return false;
            }
            return p === 'value' || p === 'path';
        },
        get: propertyGetter,
        set: propertySetter,
        deleteProperty: (_target, p) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.DeleteProperty_State :
                ErrorId.DeleteProperty_Value)
        },
        defineProperty: (_target, p, attributes) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.DefineProperty_State :
                ErrorId.DefineProperty_Value)
        },
        ownKeys: (_target) => {
            const targetReal = targetGetter()
            if (Array.isArray(targetReal)) {
                if (_target.length === undefined) {
                    // an object turned into an array now
                    // inject length property now as it is defined on the array
                    // to enable getOwnPropertyDescriptor for length not throw
                    Object.defineProperty(targetBootstrap, 'length', {
                        value: 0, writable: true, enumerable: false, configurable: false
                    })
                }
            }
            if (Object(targetReal) === targetReal) {
                return Object.getOwnPropertyNames(targetReal);
            }
            if (isValueProxy || targetReal === none) {
                return []
            }
            return ['value', 'path']
        },
        apply: (_target, thisArg, argArray?) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Apply_State :
                ErrorId.Apply_Value)
        },
        construct: (_target, argArray, newTarget?) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Construct_State :
                ErrorId.Construct_Value)
        }
    });
}

function createStore<S, E>(initial: SetInitialStateAction<S>, extensions?: () => Extension<E>): Store {
    let initialValue: S | Promise<S> = initial as (S | Promise<S>);
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S | Promise<S>))();
    }
    if (Object(initialValue) === initialValue && initialValue[SelfMethodsID]) {
        throw new StateInvalidUsageError(RootPath, ErrorId.InitStateToValueFromState)
    }
    return new Store(initialValue, extensions?.());
}

export interface Configuration {
    interceptDependencyListsMode: 'always' | 'development' | 'never',
    isDevelopmentMode: boolean,
    promiseDetector: (p: any) => boolean,
}
let configuration: Configuration & { hiddenInterceptDependencyListsModeDebug: boolean } = {
    interceptDependencyListsMode: 'always',
    // TODO this does not always work, so it is better if it is set by the app explictly. Document this
    isDevelopmentMode: typeof process === 'object' &&
        typeof process.env === 'object' &&
        process.env.NODE_ENV === 'development',
    promiseDetector: (p) => Promise.resolve(p) === p,
    hiddenInterceptDependencyListsModeDebug: false
}
// TODO document
export function configure(config: Partial<Configuration>) {
    configuration = {
        interceptDependencyListsMode: config.interceptDependencyListsMode ?? configuration.interceptDependencyListsMode,
        isDevelopmentMode: config.isDevelopmentMode ?? configuration.isDevelopmentMode,
        promiseDetector: config.promiseDetector ?? configuration.promiseDetector,
        hiddenInterceptDependencyListsModeDebug: false
    }

    interceptReactHooks() // not really required, but for safety

    if (configuration.interceptDependencyListsMode === 'never') {
        configuration.hiddenInterceptDependencyListsModeDebug = false;
        React['useEffect'] = useEffectOrigin;
        React['useLayoutEffect'] = useLayoutEffectOrigin;
        React['useInsertionEffect'] = useInsertionEffectOrigin;
        React['useImperativeHandle'] = useImperativeHandleOrigin;
        React['useMemo'] = useMemoOrigin;
        React['useCallback'] = useCallbackOrigin;
        // the following does not make an effect as memo calls happen on module load
        // so it is always set to memoIntercept
        React['memo'] = memoOrigin as any;
    } else {
        React['useEffect'] = useEffectIntercept;
        React['useLayoutEffect'] = useLayoutEffectIntercept;
        React['useInsertionEffect'] = useInsertionEffectIntercept;
        React['useImperativeHandle'] = useImperativeHandleIntercept;
        React['useMemo'] = useMemoIntercept;
        React['useCallback'] = useCallbackIntercept;
        // the following does not make an effect as memo calls happen on module load
        // so it is always set to memoIntercept
        React['memo'] = memoIntercept as any;
        if (configuration.interceptDependencyListsMode === 'development'
            && configuration.isDevelopmentMode) {
            configuration.hiddenInterceptDependencyListsModeDebug = true;
        }
    }
}

function reconnectDependencies(deps?: React.DependencyList, fromIntercept?: boolean): React.DependencyList | undefined {
    for (const i of deps || []) {
        if (i === Object(i)) {
            let state = (i as any)[self] as StateMethodsImpl<StateValueAtPath, {}> | undefined
            if (state) {
                if (fromIntercept && configuration.hiddenInterceptDependencyListsModeDebug) {
                    // TODO document this exception
                    throw new StateInvalidUsageError(state.path, ErrorId.StateUsedInDependencyList)
                }
                state.reconnect()
            }
        }
    }
    return deps;
}

let useEffectOrigin: (effect: React.EffectCallback, deps?: React.DependencyList) => void;
export function useHookEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps)
    return useEffectOrigin(effect, deps)
}
function useEffectIntercept(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps, true)
    return useEffectOrigin(effect, deps)
}

let useLayoutEffectOrigin: (effect: React.EffectCallback, deps?: React.DependencyList) => void;
export function useHookLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps)
    return useLayoutEffectOrigin(effect, deps)
}
function useLayoutEffectIntercept(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps, true)
    return useLayoutEffectOrigin(effect, deps)
}

let useInsertionEffectOrigin: (effect: React.EffectCallback, deps?: React.DependencyList) => void;
export function useHookInsertionEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps)
    return useInsertionEffectOrigin(effect, deps)
}
function useInsertionEffectIntercept(effect: React.EffectCallback, deps?: React.DependencyList) {
    reconnectDependencies(deps, true)
    return useInsertionEffectOrigin(effect, deps)
}

let useImperativeHandleOrigin: <T, R extends T>(ref: React.Ref<T> | undefined, init: () => R, deps?: React.DependencyList) => void;
export function useHookImperativeHandle<T, R extends T>(ref: React.Ref<T> | undefined, init: () => R, deps?: React.DependencyList): void {
    reconnectDependencies(deps)
    return useImperativeHandleOrigin(ref, init, deps)
}
function useImperativeHandleIntercept<T, R extends T>(ref: React.Ref<T> | undefined, init: () => R, deps?: React.DependencyList): void {
    reconnectDependencies(deps, true)
    return useImperativeHandleOrigin(ref, init, deps)
}

let useMemoOrigin: <T>(factory: () => T, deps: React.DependencyList | undefined) => T;
export function useHookMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T {
    reconnectDependencies(deps)
    return useMemoOrigin(factory, deps)
}
function useMemoIntercept<T>(factory: () => T, deps: React.DependencyList | undefined): T {
    reconnectDependencies(deps, true)
    return useMemoOrigin(factory, deps)
}

let useCallbackOrigin: <T extends Function>(callback: T, deps: React.DependencyList) => T;
export function useHookCallback<T extends Function>(callback: T, deps: React.DependencyList): T {
    reconnectDependencies(deps)
    return useCallbackOrigin(callback, deps)
}
function useCallbackIntercept<T extends Function>(callback: T, deps: React.DependencyList): T {
    reconnectDependencies(deps, true)
    return useCallbackOrigin(callback, deps)
}

let memoOrigin: <P extends object>(
    Component: React.FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) => React.NamedExoticComponent<P>;
export function hookMemo<T extends React.ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T>;
export function hookMemo<P extends object>(
    Component: React.FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.NamedExoticComponent<P> {
    return memoOrigin(Component, (prevProps, nextProps) => {
        reconnectDependencies(Object.keys(nextProps).map(i => nextProps[i]))
        return (propsAreEqual || shallowEqual)(prevProps, nextProps)
    })
}
function memoIntercept<T extends React.ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T>;
function memoIntercept<P extends object>(
    Component: React.FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.NamedExoticComponent<P> {
    return memoOrigin(Component, (prevProps, nextProps) => {
        reconnectDependencies(Object.keys(nextProps).map(i => nextProps[i]), true)
        return (propsAreEqual || shallowEqual)(prevProps, nextProps)
    })
}

function interceptReactHooks() {
    if (!useEffectOrigin) {
        useEffectOrigin = React['useEffect'];
        React['useEffect'] = useEffectIntercept;
    }
    if (!useLayoutEffectOrigin) {
        useLayoutEffectOrigin = React['useLayoutEffect'];
        React['useLayoutEffect'] = useLayoutEffectIntercept;
    }
    if (!useInsertionEffectOrigin) {
        useInsertionEffectOrigin = React['useInsertionEffect'];
        React['useInsertionEffect'] = useInsertionEffectIntercept;
    }
    if (!useImperativeHandleOrigin) {
        useImperativeHandleOrigin = React['useImperativeHandle'];
        React['useImperativeHandle'] = useImperativeHandleIntercept;
    }
    if (!useMemoOrigin) {
        useMemoOrigin = React['useMemo'];
        React['useMemo'] = useMemoIntercept;
    }
    if (!useCallbackOrigin) {
        useCallbackOrigin = React['useCallback'];
        React['useCallback'] = useCallbackIntercept;
    }
    if (!memoOrigin) {
        memoOrigin = React['memo'];
        React['memo'] = memoIntercept;
    }
}
interceptReactHooks()

// Do not try to use useLayoutEffect if DOM not available (SSR)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffectOrigin! : useEffectOrigin!;
