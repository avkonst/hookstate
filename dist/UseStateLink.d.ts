import React from 'react';
/**
 * 'JSON path' from root of a state object to a nested property.
 * Return type of [StateMethod.path](#path).
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
export declare type Path = ReadonlyArray<string | number>;
/**
 * Type of an argument of [StateMethods.set](#set).
 *
 * @typeparam S Type of a value of a state
 */
export declare type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));
/**
 * Type of an argument of [StateMethods.merge](#merge).
 *
 * @typeparam S Type of a value of a state
 */
export declare type SetPartialStateAction<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) : S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) : React.SetStateAction<S>;
/**
 * Type of an argument of [createState](#createstate) and [useState](#usestate).
 *
 * @typeparam S Type of a value of a state
 */
export declare type SetInitialStateAction<S> = S | Promise<S> | (() => S | Promise<S>);
/**
 * Special symbol which is used as a property to switch
 * between [StateMethods](#interfacesstatemethodsmd) and the corresponding [State](#state).
 */
export declare const self: unique symbol;
/**
 * Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.
 */
export declare const postpone: unique symbol;
/**
 * Special symbol which might be used to delete properties
 * from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).
 */
export declare const none: any;
/**
 * Return type of [StateMethods.keys](#keys).
 *
 * @typeparam S Type of a value of a state
 */
export declare type InferredStateKeysType<S> = S extends ReadonlyArray<infer _> ? ReadonlyArray<number> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S> : undefined;
/**
 * Return type of [StateMethods.map()](#map).
 *
 * @typeparam S Type of a value of a state
 */
export declare type InferredStateOrnullType<S> = S extends undefined ? undefined : S extends null ? null : State<S>;
/**
 * For plugin developers only.
 * An instance to manipulate the state in more controlled way.
 *
 * @typeparam S Type of a value of a state
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
/**
 * An interface to manage a state in Hookstate.
 *
 * @typeparam S Type of a value of a state
 */
export interface StateMethods<S> {
    /**
     * Returns the state instance managed by these methods.
     *
     *
     */
    [self]: State<S>;
    /**
     * 'Javascript' object 'path' to an element relative to the root object
     * in the state. For example:
     *
     * ```tsx
     * const state = useState([{ name: 'First Task' }])
     * state[self].path IS []
     * state[0][self].path IS [0]
     * state.[0].name[self].path IS [0, 'name']
     * ```
     */
    readonly path: Path;
    /**
     * Return the keys of nested states.
     * For a given state of [State](#state) type,
     * `state[self].keys` will be structurally equal to Object.keys(state),
     * with two minor difference:
     * 1. if `state[self].value` is an array, the returned result will be
     * an array of numbers, not strings like with `Object.keys`.
     * 2. if `state[self].value` is not an object, the returned result will be undefined.
     */
    readonly keys: InferredStateKeysType<S>;
    /**
     * Unwraps and returns the underlying state value referred by
     * [path](#path) of this state instance.
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
     * const myvalue: number = state[self].value
     *      ? state[self].value + 1
     *      : 0; // <-- compiles
     * const myvalue: number = state[self].get()
     *      ? state[self].get() + 1
     *      : 0; // <-- does not compile
     * ```
     */
    readonly value: S;
    /**
     * Unwraps and returns the underlying state value referred by
     * [path](#path) of this state instance.
     *
     * It returns the same result as [StateMethods.value](#value) method.
     */
    get(): S;
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
     * (only if [this.path](#path) is `[]`),
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
     * Maps this state to the result via the provided action.
     *
     * @param action mapper function
     *
     * @param onPromised this will be invoked instead of the action function,
     * if a state value is unresolved promise.
     *
     * @param onError this will be invoked instead of the action function,
     * if a state value is a promise resolved to an error.
     *
     * @param context if specified, the callbacks will be invoked in a batch.
     * Updating state within a batch does not trigger immediate rerendering.
     * Instead, all required rerendering is done once once the batch is finished.
     */
    map<R, RL, RE, C>(action: (s: State<S>) => R, onPromised: (s: State<S>) => RL, onError: (e: StateErrorAtRoot, s: State<S>) => RE, context?: Exclude<C, Function>): R | RL | RE;
    /**
     * Maps this state to the result via the provided action.
     *
     * @param action mapper function
     *
     * @param onPromised this will be invoked instead of the action function,
     * if a state value is unresolved promise.
     *
     * @param context if specified, the callbacks will be invoked in a batch.
     * Updating state within a batch does not trigger immediate rerendering.
     * Instead, all required rerendering is done once once the batch is finished.
     */
    map<R, RL, C>(action: (s: State<S>) => R, onPromised: (s: State<S>) => RL, context?: Exclude<C, Function>): R | RL;
    /**
     * Maps this state to the result via the provided action.
     *
     * @param action mapper function
     *
     * @param context if specified, the callbacks will be invoked in a batch.
     * Updating state within a batch does not trigger immediate rerendering.
     * Instead, all required rerendering is done once once the batch is finished.
     */
    map<R, C>(action: (s: State<S>) => R, context?: Exclude<C, Function>): R;
    /**
     * If state value is null or undefined, returns state value.
     * Otherwise, it returns this state instance but
     * with null and undefined removed from the type parameter.
     */
    ornull: InferredStateOrnullType<S>;
    /**
     * Adds plugin to the state.
     */
    attach(plugin: () => Plugin): State<S>;
    /**
     * For plugin developers only.
     * It is a method to get the instance of the previously attached plugin.
     * If a plugin has not been attached to a state,
     * it returns an Error as the first element.
     * A plugin may trhow an error to indicate that plugin has not been attached.
     */
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>];
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
 * User's state mixin with the special `self`-symbol property,
 * which allows to get [StateMethods](#interfacesstatemethodsmd) for a [State](#state).
 *
 * @typeparam S Type of a value of a state
 */
export interface StateMixin<S> {
    /**
     * Returns [StateMethods](#interfacesstatemethodsmd) for a [State](#state)
     */
    [self]: StateMethods<S>;
}
/**
 * User's state mixin with the special `self`-symbol property,
 * which allows to get [StateMethodsDestroy](#interfacesstatemethodsdestroymd) for a [State](#state).
 */
export interface StateMixinDestroy {
    /**
     * Returns [StateMethodsDestroy](#interfacesstatemethodsdestroymd) for a [State](#state)
     */
    [self]: StateMethodsDestroy;
}
/**
 * Type of a result of [createState](#createstate) and [useState](#usestate) functions
 *
 * @typeparam S Type of a value of a state
 */
export declare type State<S> = StateMixin<S> & (S extends ReadonlyArray<(infer U)> ? ReadonlyArray<State<U>> : S extends (true | false) ? Omit<StateMethods<boolean>, keyof StateMixin<S>> : S extends (undefined | null | number | boolean | string | bigint) ? Omit<StateMethods<S>, keyof StateMixin<S>> : S extends object ? {
    readonly [K in keyof Required<S>]: State<S[K]>;
} : {});
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with root state value.
 *
 * @hidden
 * @ignore
 */
export declare type StateValueAtRoot = any;
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with nested state value.
 *
 * @hidden
 * @ignore
 */
export declare type StateValueAtPath = any;
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with state error.
 *
 * @hidden
 * @ignore
 */
export declare type StateErrorAtRoot = any;
/**
 * For plugin developers only.
 * Type alias to highlight the places where we are dealing with context value.
 *
 * @hidden
 * @ignore
 */
export declare type AnyContext = any;
/**
 * For plugin developers only.
 * PluginCallbacks.onSet argument type.
 */
export interface PluginCallbacksOnSetArgument {
    readonly path: Path;
    readonly state?: StateValueAtRoot;
    readonly previous?: StateValueAtPath;
    readonly value?: StateValueAtPath;
    readonly merged?: StateValueAtPath;
}
/**
 * For plugin developers only.
 * PluginCallbacks.onDestroy argument type.
 */
export interface PluginCallbacksOnDestroyArgument {
    readonly state?: StateValueAtRoot;
}
/**
 * For plugin developers only.
 * PluginCallbacks.onBatchStart/Finish argument type.
 */
export interface PluginCallbacksOnBatchArgument {
    readonly path: Path;
    readonly state?: StateValueAtRoot;
    readonly context?: AnyContext;
}
/**
 * For plugin developers only.
 * Set of callbacks, a plugin may subscribe to.
 */
export interface PluginCallbacks {
    readonly onSet?: (arg: PluginCallbacksOnSetArgument) => void;
    readonly onDestroy?: (arg: PluginCallbacksOnDestroyArgument) => void;
    readonly onBatchStart?: (arg: PluginCallbacksOnBatchArgument) => void;
    readonly onBatchFinish?: (arg: PluginCallbacksOnBatchArgument) => void;
}
/**
 * For plugin developers only.
 * Hookstate plugin specification and factory method.
 */
export interface Plugin {
    /**
     * Unique identifier of a plugin.
     */
    readonly id: symbol;
    /**
     * Initializer for a plugin when it is attached for the first time.
     */
    readonly init?: (state: State<StateValueAtRoot>) => PluginCallbacks;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function createStateLink<S>(initial: SetInitialStateAction<S>): StateLink<S> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function createStateLink<S, R>(initial: SetInitialStateAction<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S>(source: StateLink<S>): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S, R>(source: StateLink<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<R>(source: WrappedStateLink<R>): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S>(source: SetInitialStateAction<S>): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S, R>(source: SetInitialStateAction<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
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
export declare function createState<S>(initial: SetInitialStateAction<S>): State<S> & StateMixinDestroy;
/**
 * Enables a functional React component to use a state,
 * either created by [createState](#createstate) (*global* state) or
 * derived from another call to [useState](#usestate) (*scoped* state).
 *
 * The `useState` forces a component to rerender everytime, when:
 * - a segment/part of the state data is updated *AND only if*
 * - this segement was **used** by the component during or after the latest rendering.
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
export declare function useState<S>(source: State<S>): State<S>;
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
 * - this segement was **used** by the component during or after the latest rendering.
 *
 * You can use as many local states within the same component as you need.
 *
 * @param source An initial value state.
 *
 * @returns an instance of [State](#state),
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
 */
export declare function useState<S>(source: SetInitialStateAction<S>): State<S>;
/**
 * Allows to use a state without defining a functional react component.
 * It can be also used in class-based React components. It is also
 * particularly usefull for creating *scoped* states.
 *
 * For example the following 3 code samples are equivivalent:
 *
 * ```tsx
 * const globalState = createState('');
 *
 * const MyComponent = () => {
 *     const state = useState(globalState);
 *     return <input value={state[self].value}
 *         onChange={e => state[self].set(e.target.value)} />;
 * }
 *
 * const MyComponent = () => <StateFragment state={globalState}>{
 *     state => <input value={state[self].value}
 *         onChange={e => state[self].set(e.target.value)}>
 * }</StateFragment>
 *
 * class MyComponent extends React.Component {
 *     render() {
 *         return <StateFragment state={globalState}>{
 *             state => <input value={state[self].value}
 *                 onChange={e => state[self].set(e.target.value)}>
 *         }</StateFragment>
 *     }
 * }
 * ```
 *
 * @typeparam S Type of a value of a state
 */
export declare function StateFragment<S>(props: {
    state: State<S>;
    children: (state: State<S>) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateFragment<S>(props: {
    state: StateLink<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use StateFragment(state={state.wrap(transform)}) instead
 */
export declare function StateFragment<S, E extends {}, R>(props: {
    state: StateLink<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateFragment<R>(props: {
    state: WrappedStateLink<R>;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateFragment<S>(props: {
    state: SetInitialStateAction<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
/**
 * Allows to use a state without defining a functional react component.
 * See more at [StateFragment](#statefragment)
 *
 * @typeparam S Type of a value of a state
 * // TODO uncomment once moved to version 2
 */
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateFragment<S, R>(props: {
    state: SetInitialStateAction<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateMemo<S, R>(transform: (state: StateLink<S>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S>, prev: R | undefined) => R;
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
export declare function Downgraded(): Plugin;
/**
 * For plugin developers only.
 * Reserved plugin ID for developers tools extension.
 *
 * @hidden
 * @ignore
 */
export declare const DevToolsID: unique symbol;
/**
 * Return type of [DevTools](#devtools).
 */
export interface DevToolsExtensions {
    label(name: string): void;
    log(str: string, data?: any): void;
}
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
export declare function DevTools<S>(state: StateLink<S> | State<S>): DevToolsExtensions;
/**
 * @hidden
 * @ignore
 * @internal
 * remove export when plugins are migrated to version 2
 */
export declare const StateMarkerID: unique symbol;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source directly instead
 */
export declare function useStateLinkUnmounted<S>(source: DestroyableStateLink<S>): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source.wrap(transform).access() instead
 */
export declare function useStateLinkUnmounted<S, R>(source: DestroyableStateLink<S>, transform: (state: StateLink<S>) => R): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source.access() instead
 */
export declare function useStateLinkUnmounted<R>(source: DestroyableWrappedStateLink<R>): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @depracated default export is deprecated
 */
export default useStateLink;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type NestedInferredLink<S> = InferredStateLinkNestedType<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type NestedInferredKeys<S> = InferredStateLinkKeysType<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyableStateLink<S> = StateLink<S> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyableWrappedStateLink<R> = WrappedStateLink<R> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type StateRef<S> = StateInf<StateLink<S>>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type StateInf<S> = S extends StateLink<infer U> ? DestroyableStateLink<U> : DestroyableWrappedStateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type StateLinkPlugable<S> = ExtendedStateLinkMixin<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type InitialValueAtRoot<S> = SetInitialStateAction<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type InferredStateLinkNestedType<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K]>;
} : undefined;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type InferredStateLinkKeysType<S> = InferredStateKeysType<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type InferredStateLinkDenullType<S> = S extends undefined ? undefined : S extends null ? null : StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface BatchOptions {
    ifPromised?: 'postpone' | 'discard' | 'reject' | 'execute';
    context?: AnyContext;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare const None: any;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface StateLink<S> extends StateMethods<S> {
    readonly promised: boolean;
    readonly error: StateErrorAtRoot | undefined;
    readonly nested: InferredStateLinkNestedType<S>;
    denull(): InferredStateLinkDenullType<S>;
    batch(action: (s: StateLink<S>) => void, options?: BatchOptions): void;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R>;
    with(plugin: () => Plugin): this;
    with<R = never>(pluginId: symbol, alt?: () => R): [StateLink<S> & ExtendedStateLinkMixin<S>, PluginCallbacks] | R;
    access(): StateLink<S>;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyMixin = StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface WrappedStateLink<R> {
    __synteticTypeInferenceMarkerInf: symbol;
    access(): R;
    with(plugin: () => Plugin): this;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): WrappedStateLink<R2>;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface ExtendedStateLinkMixin<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(paths: Path[]): void;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface Plugin {
    readonly create?: (state: StateLink<StateValueAtRoot>) => PluginCallbacks;
}
