import React from 'react';
/**
 * 'JSON path' from root of a state object to a nested property.
 * Return type of [StateLink.path](#path).
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
 * Parameter type of [StateLink.set](#set).
 */
export declare type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));
/**
 * Parameter type of [StateLink.merge](#merge).
 */
export declare type SetPartialStateAction<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) : S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) : React.SetStateAction<S>;
/**
 * Parameter type of [createStateLink](#createstatelink) and [useStateLink](#usestatelink).
 */
export declare type SetInitialStateAction<S> = S | Promise<S> | (() => S | Promise<S>);
/**
 * Return type of [StateLink.nested](#nested).
 */
export declare type InferredStateLinkNestedType<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K]>;
} : undefined;
/**
 * Return type of [StateLink.keys](#keys).
 */
export declare type InferredStateLinkKeysType<S> = S extends ReadonlyArray<infer _> ? ReadonlyArray<number> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S> : undefined;
/**
 * Return type of [StateLink.denull](#denull).
 */
export declare type InferredStateLinkDenullType<S> = S extends null ? S extends undefined ? StateLink<NonNullable<S>> | null | undefined : StateLink<NonNullable<S>> | null : S extends undefined ? StateLink<NonNullable<S>> | undefined : StateLink<NonNullable<S>> | never;
/**
 * Parameter type of [StateLink.batch](#batch).
 */
export interface BatchOptions {
    /**
     * Setting to tune how a batch should be executed if a state is in [promised state](#promised)
     *
     * - `postpone` - defers execution of a batch until state value is resolved (promise is fullfilled)
     * - `discard` - does not execute a batch and silently discards one
     * - `reject` - throws an exception suggesting promised state is not expected
     * - `execute` - proceeds with executing a batch, which may or may not throw an exception
     * depending on whether [state's value](#value) is read during execution.
     */
    ifPromised?: 'postpone' | 'discard' | 'reject' | 'execute';
    /**
     * For plugin developers only.
     * Any custom data for batch operation.
     * It is forwarded to plugins, which subscribe to batch start/finish events.
     *
     * @hidden
     * @ignore
     */
    context?: CustomContext;
}
/**
 * Type of an object holding a reference to a state value.
 * It is the main and single interface to
 * manage a state in Hookstate.
 */
export interface StateLink<S> {
    /**
     * Returns current state value referred by
     * [path](#path) of this instance of [StateLink](#interfacesstatelinkmd).
     *
     * It return the same result as as [StateLink.value](#value) property.
     */
    get(): S;
    /**
     * Sets new value for a state.
     * If `this.path === []`,
     * it is similar to the `setState` variable returned by `React.useState` hook.
     * If `this.path !== []`, it sets only the segment of the state value, pointed out by the path.
     * The function will not accept partial updates.
     * It can be done by combining [set](#set) with [nested](#nested) or
     * use [merge](#merge) action.
     *
     * @param newValue new value to set to a state.
     * It can be a value, a promise resolving to a value
     * (only if this instance of StateLink points to root of a state, i.e. [path](#path) is `[]`),
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
     * Returns current state value referred by
     * [path](#path) of this instance of [StateLink](#interfacesstatelinkmd).
     *
     * It return the same result as as [StateLink.get](#get) method.
     *
     * This property is more useful than [get](#get) method for the cases,
     * when a value may hold null or undefined values.
     * Typescript compiler does not handle elimination of undefined with get(),
     * like in the following examples, but value does:
     *
     * ```tsx
     * const state = useStateLink<number | undefined>(0)
     * const myvalue: number = statelink.value
     *      ? statelink.value + 1
     *      : 0; // <-- compiles
     * const myvalue: number = statelink.get()
     *      ? statelink.get() + 1
     *      : 0; // <-- does not compile
     * ```
     */
    readonly value: S;
    /**
     * Returns true if state value is unresolved promise.
     */
    readonly promised: boolean;
    /**
     * Returns captured error value if a promise was fulfilled but rejected.
     * Type of an error can be anything. It is the same as what the promise
     * provided on rejection.
     */
    readonly error: any | undefined;
    /**
     * 'Javascript' object 'path' to an element relative to the root object
     * in the state. For example:
     *
     * ```tsx
     * const state = useStateLink([{ name: 'First Task' }])
     * state.path IS []
     * state.nested[0].path IS [0]
     * state.nested[0].nested.name.path IS [0, 'name']
     * ```
     */
    readonly path: Path;
    /**
     * If `this.value` is an object,
     * it returns an object of nested `StateLink`s.
     * If `this.value` is an array,
     * it returns an array of nested `StateLink`s.
     * Otherwise, returns `undefined`.
     *
     * This allows to *walk* the tree and access/mutate nested
     * compex data in very convenient way.
     *
     * Typescript intellisence will handle correctly
     * any complexy of the data structure.
     * The conditional type definition of [InferredStateLinkNestedType](#inferredstatelinknestedtype) facilitates this.
     *
     * The result of `Object.keys(state.nested)`
     * is the same as `Object.keys(state.get())`.
     * However, the returned object will have **ANY** property defined
     * (although not every will pass Typescript compiler check).
     * It is very convenient for managing dynamic directories, for example:
     *
     * ```tsx
     * const state = useStateLink<Record<string, number>>({});
     * // initially:
     * state.value; // will be {}
     * state.nested['newProperty'].value; // will be undefined
     * // setting non existing nested property:
     * state.nested['newProperty'].set('newValue');
     * // will update the state to:
     * state.value; // will be { newProperty: 'newValue' }
     * state.nested['newProperty'].value; // will be 'newValue'
     * ```
     */
    readonly nested: InferredStateLinkNestedType<S>;
    /**
     * Return the same as `Object.keys(this.nested)`
     * or `Object.keys(this.value)`
     * with one minor difference:
     * if `this.value` is an array, the returned result will be
     * an array of numbers, not strings like with `Object.keys`.
     */
    readonly keys: InferredStateLinkKeysType<S>;
    /**
     * For an instance of type `StateLink<T | undefined | null>`, where `T` is not `Nullable`,
     * it return `this` instance typed as `StateLink<T>`, if `this.value` is defined.
     * Otherwise, it returns `this.value`, which would be `null` or `undefined`.
     *
     * You can use it like the following:
     *
     * ```tsx
     * const MyInputField = (props: { state: StateLink<string | null >}) => {
     *     const state = props.state.denull();
     *     // state is either null or an instance of StateLink<string>:
     *     if (!state) {
     *         // state value was null:
     *         return <></>;
     *     }
     *     // state.value is an instance of string, can not be null here:
     *     return <input value={state.value} onChange={(v) => state.set(v.target.value)} />
     * }
     * ```
     */
    denull(): InferredStateLinkDenullType<S>;
    /**
     * Allows to group state updates in a single batch. It helps to
     * minimise rerendering by React. It also allows plugins (if any used)
     * to opt-in into atomic transactions for state persistance.
     *
     * @param action a function to be executed in scope of a batch.
     * The function receives `this` instance as an argument.
     *
     * @param options various batch options to tune batching behaviour.
     *
     * For example:
     *
     * ```tsx
     * const MyComponent = () => {
     *     state = useStateLink<{ user?: string, email?: string }>({});
     *     return <>
     *         {state.value.user && <p>Hello {state.value.user}!</p>}
     *         {state.value.email && <p>We will message you to {state.value.email}!</p>}
     *         <button onClick={() => {
     *              // this will rerender the current component only once
     *              // even if the state is changed twice
     *              state.batch(() => {
     *                  state.nested.user.set('Peter');
     *                  state.nested.email.set('peter@example.com');
     *              })
     *         }}>Initialize user</button>
     *     </>
     * }
     * ```
     */
    batch(action: (s: StateLink<S>) => void, options?: BatchOptions): void;
    /**
     * Wraps the state link instance by a custom defined interface.
     * It can be used by libraries, which would not like to expose dependency to Hookstate.
     *
     * @param transform a function which receives this instance and previous state value (if available),
     * and returns a custom object of any type, defined by a client.
     *
     * @returns an instance of wrapped state link, which can be used with [useStateLink](#usestatelink)
     * within a React component or accessed directly, typically in an event handler or callback.
     */
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R>;
    /**
     * Adds new plugin to the state. See more about plugins and extensions in the documentation.
     */
    with(plugin: () => Plugin): StateLink<S>;
    /**
     * For plugin developers only.
     * A function to get more exposed capabilities of a StateLink
     * and an instance of the attached plugin by it's id.
     *
     * @hidden
     * @ignore
     */
    with(pluginId: symbol): [StateLink<S> & ExtendedStateLinkMixin<S>, PluginCallbacks];
    /**
     * @hidden
     * @ignore
     * @internal
     * @deprecated declared for backward compatibility
     */
    access(): StateLink<S>;
}
/**
 * Mixin for the [StateLink](#interfacesstatelinkmd), which can be destroyed by a client.
 */
export interface DestroyMixin {
    /**
     * Destroys an instance where it is mixed into, so
     * it can clear the allocated native resources (if any)
     * and can not be used anymore after it has been destroyed.
     */
    destroy(): void;
}
/**
 * Return type of [StateLink.wrap](#wrap).
 */
export interface WrappedStateLink<R> {
    /**
     * Placed to make sure type inference does not match empty structure on useStateLink call
     *
     * @hidden
     * @ignore
     * @internal
     */
    __synteticTypeInferenceMarkerInf: symbol;
    /**
     * Returns an instance of custom user-defined interface to use, typically outside of
     * a React component, i.e. in a callback or event handler.
     */
    access(): R;
    /**
     * Adds new plugin to the state. See more about plugins and extensions in the documentation.
     */
    with(plugin: () => Plugin): WrappedStateLink<R>;
    /**
     * Similarly to [StateLink.wrap](#wrap), wraps the state link instance by a custom defined interface.
     * It can be used by libraries, which would want to abstract state management operation.
     *
     * @param transform a function which receives `this.access()` and
     * previous `this.access()` state value (if available),
     * and returns a custom object of any type, defined by a client.
     *
     * @returns an instance of wrapped state link, which can be used with [useStateLink](#usestatelink)
     * within a React component or accessed directly, typically in an event handler or callback.
     */
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): WrappedStateLink<R2>;
}
/**
 * @experimental
 */
export declare const None: any;
/**
 * For plugin developers only.
 * More exposed capabilities of a StateLink.
 *
 * @hidden
 * @ignore
 */
export interface ExtendedStateLinkMixin<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(paths: Path[]): void;
}
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
 * Type alias for any type of batch context data.
 *
 * @hidden
 * @ignore
 */
export declare type CustomContext = any;
/**
 * For plugin developers only.
 * Reserved plugin ID for developers tools extension.
 *
 * @hidden
 * @ignore
 */
export declare const DevTools: unique symbol;
/**
 * For plugin developers only.
 * PluginCallbacks.onSet argument type.
 *
 * @hidden
 * @ignore
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
 *
 * @hidden
 * @ignore
 */
export interface PluginCallbacksOnDestroyArgument {
    readonly state?: StateValueAtRoot;
}
/**
 * For plugin developers only.
 * PluginCallbacks.onBatchStart/Finish argument type.
 *
 * @hidden
 * @ignore
 */
export interface PluginCallbacksOnBatchArgument {
    readonly path: Path;
    readonly state?: StateValueAtRoot;
    readonly context?: CustomContext;
}
/**
 * For plugin developers only.
 * Set of callbacks, a plugin may subscribe to.
 *
 * @hidden
 * @ignore
 */
export interface PluginCallbacks {
    readonly onSet?: (arg: PluginCallbacksOnSetArgument) => void;
    readonly onDestroy?: (arg: PluginCallbacksOnDestroyArgument) => void;
    readonly onBatchStart?: (arg: PluginCallbacksOnBatchArgument) => void;
    readonly onBatchFinish?: (arg: PluginCallbacksOnBatchArgument) => void;
}
/**
 * For plugin developers only.
 * Hookstate plugin specification and constructor.
 *
 * @hidden
 * @ignore
 */
export interface Plugin {
    readonly id: symbol;
    readonly create: (state: StateLink<StateValueAtRoot>) => PluginCallbacks;
}
/**
 * Creates new state and returns an instance of state link
 * interface to manage the state or to hook in React components.
 *
 * You can create as many global states as you need.
 *
 * When you do not need the global state anymore,
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
 * @returns [StateLink](#interfacesstatelinkmd) instance,
 * which can be used directly to get and set state value
 * outside of React components.
 * When you need to use the state in a functional `React` component,
 * pass the created state to `useStateLink` function and
 * use the returned result in the component's logic.
 */
export declare function createStateLink<S>(initial: SetInitialStateAction<S>): StateLink<S> & DestroyMixin;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function createStateLink<S, R>(initial: SetInitialStateAction<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R> & DestroyMixin;
/**
 * Enables a functional React component to use a state,
 * either created by [createStateLink](#createstatelink) (*global* state) or
 * derived from another call to `useStateLink` (*scoped* state).
 *
 * The `useStateLink` forces a component to rerender everytime, when:
 * - a segment/part of the state data is updated *AND only if*
 * - this segement was **used** by the component during or after the latest rendering.
 *
 * For example, if the state value is `{ a: 1, b: 2 }` and
 * a component uses only `a` property of the state, it will rerender
 * only when the whole state object is updated or when `a` property is updated.
 * Setting the state value/property to the same value is also considered as an update.
 *
 * A component can use one or many states,
 * i.e. you may call `useStateLink` multiple times for multiple states.
 *
 * The same state can be used by multiple different components.
 *
 * @param source a reference to the state to hook into
 *
 * The `useStateLink` is a hook and should follow React's rules of hooks.
 *
 * @returns an instance of [StateLink](#interfacesstatelinkmd) interface,
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
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
 * The same as [useStateLink](#usestatelink) for [StateLink](#interfacesstatelinkmd),
 * but accepts the result of [StateLink.wrap](#wrap) as an argument.
 *
 * @param source a reference to the state to hook into
 *
 * @typeparam return type of the function
 *
 * @returns an instance of custom state access interface,
 * which **must be** used within the component (during rendering
 * or in effects) or it's children
 */
export declare function useStateLink<R>(source: WrappedStateLink<R>): R;
/**
 * This function enables a functional React component to use a state,
 * created per component by `useStateLink` (*local* state).
 * In this case `useStateLink` behaves similarly to `React.useState`,
 * but the returned instance of [StateLink](#interfacesstatelinkmd)
 * has got more features.
 *
 * When a state is used by only one component, and maybe it's children,
 * it is recommended to use *local* state instead of *global*,
 * which is created by [createStateLink](#createstatelink).
 *
 * *Local* (per component) state is created when a component is mounted
 * and automatically destroyed when a component is unmounted.
 *
 * The same as with the usage of a *global* state,
 * `useStateLink` forces a component to rerender when:
 * - a segment/part of the state data is updated *AND only if*
 * - this segement was **used** by the component during or after the latest rendering.
 *
 * You can use as many local states within the same component as you need.
 *
 * @param source a reference to the state to hook into
 *
 * @returns an instance of [StateLink](#interfacesstatelinkmd) interface,
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
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
 * Allows to use a state without defining a functional react component.
 * It can be also used in class-based React components. It is also
 * particularly usefull for creating *scoped* states.
 *
 * For example the following 3 code samples are equivivalent:
 *
 * ```tsx
 * const globalState = createStateLink('');
 *
 * const MyComponent = () => {
 *     const state = useStateLink(globalState);
 *     return <input value={state.value}
 *         onChange={e => state.set(e.target.value)} />;
 * }
 *
 * const MyComponent = () => <StateFragment state={globalState}>{
 *     state => <input value={state.value}
 *         onChange={e => state.set(e.target.value)}>
 * }</StateFragment>
 *
 * class MyComponent extends React.Component {
 *     render() {
 *         return <StateFragment state={globalState}>{
 *             state => <input value={state.value}
 *                 onChange={e => state.set(e.target.value)}>
 *         }</StateFragment>
 *     }
 * }
 * ```
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
 * Allows to use a state without defining a functional react component.
 * See more at [StateFragment](#statefragment)
 */
export declare function StateFragment<R>(props: {
    state: WrappedStateLink<R>;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
/**
 * Allows to use a state without defining a functional react component.
 * See more at [StateFragment](#statefragment)
 */
export declare function StateFragment<S>(props: {
    state: SetInitialStateAction<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
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
 * It is used in combination with [StateLink.wrap](#wrap).
 * It minimises rerendering for states reduced down to a comparable values.
 *
 * @param transform the original transform function for [StateLink.wrap](#wrap).
 * The first argument is a state link to wrap.
 * The second argument, if available,
 * is the previous result returned by the function.
 *
 * @param equals a function which compares the next and the previous
 * wrapped state values and return true, if there is no change. By default,
 * it is shallow triple-equal comparison, i.e. `===`.
 */
export declare function StateMemo<S, R>(transform: (state: StateLink<S>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S>, prev: R | undefined) => R;
/**
 * A plugin which allows to opt-out from usage of Javascript proxies for
 * state usage tracking. It is useful for performance tuning. For example:
 *
 * ```tsx
 * const globalState = createStateLink(someLargeObject as object)
 * const MyComponent = () => {
 *     const state = useStateLink(globalState)
 *         .with(Downgraded); // the whole state will be used
 *                            // by this component, so no point
 *                            // to track usage of individual properties
 *     return <>JSON.stringify(state.value)</>
 * }
 * ```
 */
export declare function Downgraded(): Plugin;
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
export declare type DestroyableStateLink<S> = StateLink<S> & DestroyMixin;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyableWrappedStateLink<R> = WrappedStateLink<R> & DestroyMixin;
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
