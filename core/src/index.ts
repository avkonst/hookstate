import React from 'react';

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
 * Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.
 * 
 * [Learn more...](https://hookstate.js.org/docs/asynchronous-state#executing-an-action-when-state-is-loaded)
 */
export const postpone = Symbol('postpone')

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
export type InferredStateOrnullType<S> =
    S extends undefined ? undefined :
    S extends null ? null : State<S>;

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

/**
 * 
 */
enum StateValueMode {
    Tracked,
    Origin,
    Escaped,
}

/**
 * An interface to manage a state in Hookstate.
 * 
 * @typeparam S Type of a value of a state
 */
export interface StateMethods<S> {
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
    nested<K extends keyof S>(key: K): State<S[K]>;
    
    /**
     * Runs the provided action callback with optimised re-rendering.
     * Updating state within a batch action does not trigger immediate rerendering.
     * Instead, all required rerendering is done once the batch is finished.
     * 
     * [Learn more about batching...](https://hookstate.js.org/docs/performance-batched-updates
     * 
     * @param action callback function to execute in a batch
     * 
     * @param context custom user's value, which is passed to plugins
     */
    batch<R, C>(
        action: (s: State<S>) => R,
        context?: Exclude<C, Function>
    ): R;

    /**
     * If state value is null or undefined, returns state value.
     * Otherwise, it returns this state instance but
     * with null and undefined removed from the type parameter.
     * 
     * [Learn more...](https://hookstate.js.org/docs/nullable-state)
     */
    ornull: InferredStateOrnullType<S>;

    /**
     * Adds plugin to the state.
     * 
     * [Learn more...](https://hookstate.js.org/docs/extensions-overview)
     */
    attach(plugin: () => Plugin): State<S>
    
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
 * Type of a result of [createState](#createstate) and [useState](#usestate) functions
 * 
 * @typeparam S Type of a value of a state
 * 
 * [Learn more about global states...](https://hookstate.js.org/docs/global-state)
 * [Learn more about local states...](https://hookstate.js.org/docs/local-state)
 * [Learn more about nested states...](https://hookstate.js.org/docs/nested-state)
 */
export type State<S> = StateMethods<S> & (
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<State<U>> :
    S extends object ? Omit<
        { readonly [K in keyof Required<S>]: State<S[K]>; },
        keyof StateMethods<S> | keyof StateMethodsDestroy
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
     * As a workaround, you can [batch state updates](https://hookstate.js.org/docs/performance-batched-updates) or
     * replace merge calls with the immutable-style set operation like so:
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
 * PluginCallbacks.onBatchStart/Finish argument type.
 */
export interface PluginCallbacksOnBatchArgument {
    readonly path: Path,
    readonly state?: StateValueAtRoot,
    readonly context?: AnyContext,
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
    readonly onBatchStart?: (arg: PluginCallbacksOnBatchArgument) => void,
    readonly onBatchFinish?: (arg: PluginCallbacksOnBatchArgument) => void,
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
    readonly init?: (state: State<StateValueAtRoot>) => PluginCallbacks;
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
export function createState<S>(
    initial: SetInitialStateAction<S>
): State<S> & StateMethodsDestroy {
    const methods = createStore(initial).toMethods();
    const devtools = createState[DevToolsID]
    if (devtools) {
        methods.attach(devtools)
    }
    return methods.self as State<S> & StateMethodsDestroy;
}

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
    source: State<S>
): State<S>;
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
): State<S>;
export function useState<S>(
    source: SetInitialStateAction<S> | State<S>
): State<S> {
    return useHookstate(source as State<S>);
}

/**
 * Alias to [useState](#usestate) which provides a workaround
 * for [React 20613 bug](https://github.com/facebook/react/issues/20613)
 */
export function useHookstate<S>(
    source: State<S>
): State<S>;
/**
 * Alias to [useState](#usestate) which provides a workaround
 * for [React 20613 bug](https://github.com/facebook/react/issues/20613)
 */
export function useHookstate<S>(
    source: SetInitialStateAction<S>
): State<S>;
export function useHookstate<S>(
    source: SetInitialStateAction<S> | State<S>
): State<S> {
    const parentMethods = typeof source === 'object' && source !== null ?
        source[self] as StateMethodsImpl<S> | undefined :
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
                let state: StateMethodsImpl<S> = new StateMethodsImpl<S>(
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
            
            return value.state.self;
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
                let state: StateMethodsImpl<S> = new StateMethodsImpl<S>(
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
            
            let state: State<StateValueAtPath> =  value.state.self;
            for (let ind = 0; ind < parentMethods.path.length; ind += 1) {
                state = state.nested(parentMethods.path[ind]);
            }
            return state as State<S>;
        }
    } else {
        // Local state mount
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let initializer = () => {
            let store = createStore(source)
            let onSetUsedCallback = () => setValue({
                store: store,
                state: state,
            })
            let state: StateMethodsImpl<S> = new StateMethodsImpl<S>(
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

        if (isDevelopmentMode) {
            // This is a workaround for the issue:
            // https://github.com/avkonst/hookstate/issues/109
            // See technical notes on React behavior here:
            // https://github.com/apollographql/apollo-client/issues/5870#issuecomment-689098185
            const isEffectExecutedAfterRender = React.useRef(false);
            isEffectExecutedAfterRender.current = false; // not yet...
            
            React.useEffect(() => {
                isEffectExecutedAfterRender.current = true; // ... and now, yes!
                // The state is not destroyed intentionally
                // under hot reload case.
                return () => { isEffectExecutedAfterRender.current && value.store.destroy() }
            });
        } else {
            React.useEffect(() => () => value.store.destroy(), []);
        }
        const devtools = useState[DevToolsID]
        if (devtools) {
            value.state.attach(devtools)
        }
        return value.state.self;
    }
}

/**
 * Allows to use a state without defining a functional react component.
 * It can be also used in class-based React components. It is also
 * particularly useful for creating *scoped* states.
 *
 * [Learn more...](https://hookstate.js.org/docs/using-without-statehook)
 * 
 * @typeparam S Type of a value of a state
 */
export function StateFragment<S>(
    props: {
        state: State<S>,
        children: (state: State<S>) => React.ReactElement,
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
export function StateFragment<S>(
    props: {
        state: SetInitialStateAction<S>,
        children: (state: State<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S>(
    props: {
        state: State<S> | SetInitialStateAction<S>,
        children: (state: State<S>) => React.ReactElement,
    }
): React.ReactElement {
    const scoped = useState(props.state as State<S>);
    return props.children(scoped);
}

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
export function DevTools<S>(state: State<S>): DevToolsExtensions {
    const plugin = state.attach(DevToolsID);
    if (plugin[0] instanceof Error) {
        return EmptyDevToolsExtensions;
    }
    return plugin[0] as DevToolsExtensions;
}

///
/// INTERNAL SYMBOLS (LIBRARY IMPLEMENTATION)
///

const isDevelopmentMode = typeof process === 'object' && 
    typeof process.env === 'object' &&
    process.env.NODE_ENV === 'development'

const self = Symbol('self')

const EmptyDevToolsExtensions: DevToolsExtensions = {
    label() { /* */ },
    log() { /* */ }
}

enum ErrorId {
    InitStateToValueFromState = 101,
    SetStateToValueFromState = 102,
    GetStateWhenPromised = 103,
    SetStateWhenPromised = 104,
    SetStateNestedToPromised = 105,
    SetStateWhenDestroyed = 106,
    ToJson_Value = 108,
    ToJson_State = 109,
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
}

class StateInvalidUsageError extends Error {
    constructor(path: Path, id: ErrorId, details?: string) {
        super(`Error: HOOKSTATE-${id} [path: /${path.join('/')}${details ? `, details: ${details}` : ''}]. ` +
            `See https://hookstate.js.org/docs/exceptions#hookstate-${id}`)
    }
}

interface Subscriber {
    onSet(paths: Path[], actions: (() => void)[]): boolean;
}

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

function isNoProxyInitializer() {
    try {
        const used = new Proxy({}, {});
        return false;
    } catch (e) {
        return true;
    }
};
const IsNoProxy = isNoProxyInitializer()

const DowngradedID = Symbol('Downgraded');
const SelfMethodsID = Symbol('ProxyMarker');

const RootPath: Path = [];
const DestroyedEdition = -1

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

class Store implements Subscribable {
    private _edition = 0;

    private _subscribers: Set<Subscriber> = new Set();
    private _setSubscribers: Set<Required<PluginCallbacks>['onSet']> = new Set();
    private _destroySubscribers: Set<Required<PluginCallbacks>['onDestroy']> = new Set();
    private _batchStartSubscribers: Set<Required<PluginCallbacks>['onBatchStart']> = new Set();
    private _batchFinishSubscribers: Set<Required<PluginCallbacks>['onBatchFinish']> = new Set();

    private _plugins: Map<symbol, PluginCallbacks> = new Map();

    private _promised?: Promised;

    private _batches = 0;
    private _batchesPendingPaths?: Path[];
    private _batchesPendingActions?: (() => void)[];

    constructor(private _value: StateValueAtRoot) {
        if (typeof _value === 'object' &&
            Promise.resolve(_value) === _value) {
            this._promised = this.createPromised(_value)
            this._value = none
        } else if (_value === none) {
            this._promised = this.createPromised(undefined)
        }
    }

    createPromised(newValue: StateValueAtPath | undefined) {
        const promised = new Promised(
            newValue ? Promise.resolve(newValue) : undefined,
            (r: StateValueAtPath) => {
                if (this.promised === promised && this.edition !== DestroyedEdition) {
                    this._promised = undefined
                    this.set(RootPath, r, undefined)
                    this.update([RootPath])
                }
            },
            () => {
                if (this.promised === promised && this.edition !== DestroyedEdition) {
                    this._edition += 1
                    this.update([RootPath])
                }
            },
            () => {
                if (this._batchesPendingActions &&
                    this._value !== none &&
                    this.edition !== DestroyedEdition) {
                    const actions = this._batchesPendingActions
                    this._batchesPendingActions = undefined
                    actions.forEach(a => a())
                }
            }
        );
        return promised;
    }

    get edition() {
        return this._edition;
    }

    get promised() {
        return this._promised;
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

    set(path: Path, value: StateValueAtPath, mergeValue: Partial<StateValueAtPath> | undefined): Path {
        if (this._edition < 0) {
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
                this._promised = this.createPromised(undefined)
                delete onSetArg.value
                delete onSetArg.state
            } else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = this.createPromised(value)
                value = none
                delete onSetArg.value
                delete onSetArg.state
            } else if (this._promised && (!this._promised.resolver && !this._promised.fullfilled)) {
                throw new StateInvalidUsageError(path, ErrorId.SetStateWhenPromised)
            }

            let prevValue = this._value;
            if (prevValue === none) {
                delete onSetArg.previous
            }
            this._value = value;
            this.afterSet(onSetArg)

            if (prevValue === none && this._value !== none &&
                this.promised && this.promised.resolver) {
                this.promised.resolver(this._value)
            }

            return path;
        }

        if (typeof value === 'object' && Promise.resolve(value) === value) {
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

                return path;
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
                return path.slice(0, -1)
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
            return path.slice(0, -1)
        }

        // Non-existing property DELETE case
        // no-op
        return path;
    }

    update(paths: Path[]) {
        if (this._batches) {
            this._batchesPendingPaths = this._batchesPendingPaths || []
            this._batchesPendingPaths = this._batchesPendingPaths.concat(paths)
            return;
        }

        const actions: (() => void)[] = [];
        this._subscribers.forEach(s => s.onSet(paths, actions));
        // TODO action can be duplicate, so we can distinct them before calling
        actions.forEach(a => a());
    }

    afterSet(params: PluginCallbacksOnSetArgument) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(cb => cb(params))
        }
    }

    startBatch(path: Path, options?: { context?:  AnyContext }): void {
        this._batches += 1

        const cbArgument: Writeable<PluginCallbacksOnBatchArgument> = {
            path: path
        }
        if (options && 'context' in options) {
            cbArgument.context = options.context
        }
        if (this._value !== none) {
            cbArgument.state = this._value
        }
        this._batchStartSubscribers.forEach(cb => cb(cbArgument))
    }

    finishBatch(path: Path, options?: { context?:  AnyContext }): void {
        const cbArgument: Writeable<PluginCallbacksOnBatchArgument> = {
            path: path
        }
        if (options && 'context' in options) {
            cbArgument.context = options.context
        }
        if (this._value !== none) {
            cbArgument.state = this._value
        }
        this._batchFinishSubscribers.forEach(cb => cb(cbArgument))

        this._batches -= 1
        if (this._batches === 0) {
            if (this._batchesPendingPaths) {
                const paths = this._batchesPendingPaths
                this._batchesPendingPaths = undefined
                this.update(paths)
            }
        }
    }

    postponeBatch(action: () => void): void {
        this._batchesPendingActions = this._batchesPendingActions || []
        this._batchesPendingActions.push(action)
    }

    getPlugin(pluginId: symbol) {
        return this._plugins.get(pluginId)
    }

    register(plugin: Plugin) {
        const existingInstance = this._plugins.get(plugin.id)
        if (existingInstance) {
            return;
        }

        const pluginCallbacks = plugin.init ? plugin.init(this.toMethods().self) : {};
        this._plugins.set(plugin.id, pluginCallbacks);
        if (pluginCallbacks.onSet) {
            this._setSubscribers.add((p) => pluginCallbacks.onSet!(p))
        }
        if (pluginCallbacks.onDestroy) {
            this._destroySubscribers.add((p) => pluginCallbacks.onDestroy!(p))
        }
        if (pluginCallbacks.onBatchStart) {
            this._batchStartSubscribers.add((p) => pluginCallbacks.onBatchStart!(p))
        }
        if (pluginCallbacks.onBatchFinish) {
            this._batchFinishSubscribers.add((p) => pluginCallbacks.onBatchFinish!(p))
        }
    }

    toMethods() {
        return new StateMethodsImpl<StateValueAtRoot>(
            this,
            RootPath,
            this.get(RootPath),
            this.edition,
            OnSetUsedNoAction
        )
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }

    destroy() {
        this._destroySubscribers.forEach(cb => cb(this._value !== none ? { state: this._value } : {}))
        this._edition = DestroyedEdition
    }

    toJSON() {
        throw new StateInvalidUsageError(RootPath, ErrorId.ToJson_Value);
    }
}

class Promised {
    public fullfilled?: true;
    public error?: StateErrorAtRoot;
    public resolver?: (_: StateValueAtRoot) => void;

    constructor(public promise: Promise<StateValueAtPath> | undefined,
        onResolve: (r: StateValueAtPath) => void,
        onReject: () => void,
        onPostResolve: () => void) {
        if (!promise) {
            promise = new Promise<StateValueAtRoot>(resolve => {
                this.resolver = resolve;
            })
        }
        this.promise = promise
            .then(r => {
                this.fullfilled = true
                if (!this.resolver) {
                    onResolve(r)
                }
            })
            .catch(err => {
                this.fullfilled = true
                this.error = err
                onReject()
            })
            .then(() => onPostResolve())
    }
}

// use symbol property to allow for easier reference finding
const ValueUnusedMarker = Symbol('ValueUnusedMarker');

function OnSetUsedNoAction() { /** no action callback */ }

// use symbol to mark that a function has no effect anymore
const UnmountedMarker = Symbol('UnmountedMarker');
OnSetUsedNoAction[UnmountedMarker] = true

class StateMethodsImpl<S> implements StateMethods<S>, StateMethodsDestroy, Subscribable, Subscriber {
    private subscribers: Set<Subscriber> | undefined;

    private isDowngraded: boolean | undefined;
    private children: Record<string | number, StateMethodsImpl<StateValueAtPath>> | undefined;
    private childrenCache: Record<string | number, StateMethodsImpl<StateValueAtPath>> | undefined;
    private selfCache: State<S> | undefined;
    private valueCache: StateValueAtPath = ValueUnusedMarker;
    
    constructor(
        public readonly store: Store,
        public path: Path,
        private valueSource: S,
        private valueEdition: number,
        private onSetUsed: () => void
    ) { }

    reconstruct(path: Path, valueSource: S, valueEdition: number, forget: boolean) {
        this.path = path;
        this.valueSource = valueSource;
        this.valueEdition = valueEdition;
        
        this.valueCache = ValueUnusedMarker;
        delete this.isDowngraded;
        delete this.subscribers;

        if (forget) {
            delete this.selfCache;
            delete this.children
        } else {
            this.children = this.childrenCache;
        }
        delete this.childrenCache
    }
    
    reconnect() {
        this.childrenCache = {
            ...this.children,
            ...this.childrenCache
        }
    }
    
    getUntracked(allowPromised?: boolean) {
        if (this.valueEdition !== this.store.edition) {
            this.valueSource = this.store.get(this.path)
            this.valueEdition = this.store.edition

            if (this.isMounted) {
                // this link is still mounted to a component
                // populate cache again to ensure correct tracking of usage
                // when React scans which states to rerender on update
                if (this.valueCache !== ValueUnusedMarker) {
                    this.valueCache = ValueUnusedMarker
                    this.get(true) // renew cache to keep it marked used
                    // let walkedState: StateMethods<StateValueAtPath> = this.onSetUsed[RootStateAccessor];
                    // for (let pathElem of this.path) {
                    //     walkedState = walkedState.nested(pathElem)
                    // }
                    // walkedState.get()
                }
            } else {
                // This link is not mounted to a component
                // for example, it might be global link or
                // a link which has been discarded after rerender
                // but still captured by some callback or an effect.
                // If we are here and if it was mounted before,
                // it means it has not been garbage collected
                // when a component unmounted.
                // We take this opportunity to clean up caches
                // to avoid memory leaks via stale children states cache.
                this.valueCache = ValueUnusedMarker
                // TODO what do we need to do with this.children here?
                delete this.childrenCache
                delete this.selfCache
            }
        }
        if (this.valueSource === none && !allowPromised) {
            if (this.store.promised && this.store.promised.error) {
                throw this.store.promised.error;
            }
            throw new StateInvalidUsageError(this.path, ErrorId.GetStateWhenPromised)
        }
        return this.valueSource;
    }

    get(allowPromised?: boolean) {
        const currentValue = this.getUntracked(allowPromised)
        if (this.valueCache === ValueUnusedMarker) {
            if (this.isDowngraded) {
                this.valueCache = currentValue;
            } else if (Array.isArray(currentValue)) {
                this.valueCache = this.valueArrayImpl(currentValue as unknown as StateValueAtPath[]);
            } else if (typeof currentValue === 'object' && currentValue !== null) {
                this.valueCache = this.valueObjectImpl(currentValue as unknown as object);
            } else {
                this.valueCache = currentValue;
            }
        }
        return this.valueCache as S;
    }

    get value(): S {
        return this.get()
    }

    setUntracked(newValue: SetStateAction<S>, mergeValue?: Partial<StateValueAtPath>): Path[] {
        if (typeof newValue === 'function') {
            newValue = (newValue as ((prevValue: S) => S))(this.getUntracked());
        }
        if (typeof newValue === 'object' && newValue !== null && newValue[SelfMethodsID]) {
            throw new StateInvalidUsageError(this.path, ErrorId.SetStateToValueFromState)
        }
        if (newValue !== Object(newValue) && newValue === this.getUntracked(true)) {
            // this is primitive value and has not changed
            // so skip this set call as it does not make an effect
            return []
        }
        return [this.store.set(this.path, newValue, mergeValue)];
    }

    set(newValue: SetStateAction<S>) {
        this.store.update(this.setUntracked(newValue));
    }

    mergeUntracked(sourceValue: SetPartialStateAction<S>): Path[] {
        const currentValue = this.getUntracked()
        if (typeof sourceValue === 'function') {
            sourceValue = (sourceValue as Function)(currentValue);
        }

        let updatedPaths: Path[];
        let deletedOrInsertedProps = false

        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                return this.setUntracked(currentValue.concat(sourceValue) as unknown as S, sourceValue)
            } else {
                const deletedIndexes: number[] = []
                Object.keys(sourceValue).sort().forEach(i => {
                    const index = Number(i);
                    const newPropValue = sourceValue[index]
                    if (newPropValue === none) {
                        deletedOrInsertedProps = true
                        deletedIndexes.push(index)
                    } else {
                        deletedOrInsertedProps = deletedOrInsertedProps || !(index in currentValue);
                        (currentValue as StateValueAtPath[])[index] = newPropValue
                    }
                });
                // indexes are ascending sorted as per above
                // so, delete one by one from the end
                // this way index positions do not change
                deletedIndexes.reverse().forEach(p => {
                    (currentValue as unknown as []).splice(p, 1)
                })
                updatedPaths = this.setUntracked(currentValue, sourceValue)
            }
        } else if (typeof currentValue === 'object' && currentValue !== null) {
            Object.keys(sourceValue).forEach(key => {
                const newPropValue = sourceValue[key]
                if (newPropValue === none) {
                    deletedOrInsertedProps = true
                    delete currentValue[key]
                } else {
                    deletedOrInsertedProps = deletedOrInsertedProps || !(key in currentValue)
                    currentValue[key] = newPropValue
                }
            })
            updatedPaths = this.setUntracked(currentValue, sourceValue)
        } else if (typeof currentValue === 'string') {
            return this.setUntracked((currentValue + String(sourceValue)) as unknown as S, sourceValue)
        } else {
            return this.setUntracked(sourceValue as S)
        }

        if (updatedPaths.length !== 1 || updatedPaths[0] !== this.path || deletedOrInsertedProps) {
            return updatedPaths
        }
        const updatedPath = updatedPaths[0]
        return Object.keys(sourceValue).map(p => updatedPath.slice().concat(p))
    }

    merge(sourceValue: SetPartialStateAction<S>) {
        this.store.update(this.mergeUntracked(sourceValue));
    }

    nested<K extends keyof S>(key: K): State<S[K]> {
        return this.child(key as string | number).self as State<S[K]>
    }
    
    rerender(paths: Path[]) {
        this.store.update(paths)
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

    onSet(paths: Path[], actions: (() => void)[]): boolean {
        const update = () => {
            if (this.isDowngraded && this.valueCache !== ValueUnusedMarker) {
                actions.push(this.onSetUsed);
                delete this.selfCache;
                return true;
            }
            for (let path of paths) {
                const nextChildKey = path[this.path.length];
                if (nextChildKey === undefined) {
                    // There is no next child to dive into
                    // So it is this one which was updated
                    if (this.valueCache !== ValueUnusedMarker) {
                        actions.push(this.onSetUsed);
                        delete this.selfCache;
                        delete this.childrenCache;
                        return true;
                    }
                } else {
                    const nextChild = this.childrenCache && this.childrenCache[nextChildKey];
                    if (nextChild && nextChild.onSet(paths, actions)) {
                        delete this.selfCache;
                        return true;
                    }
                }
            }
            return false;
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(s => {
                if (s.onSet(paths, actions)) {
                    delete this.selfCache;
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
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value) as unknown as InferredStateKeysType<S>;
        }
        return undefined as InferredStateKeysType<S>;
    }

    child(key: number | string) {
        // if this state is not mounted to a hook,
        // we do not cache children to avoid unnecessary memory leaks
        if (this.isMounted) {
            this.childrenCache = this.childrenCache || {};
            const cachedChild = this.childrenCache[key];
            if (cachedChild) {
                return cachedChild;
            }
        }
        this.children = this.children || {};
        const child = this.children[key];
        let r;
        if (child) {
            child.reconstruct(
                this.path.slice().concat(key),
                this.valueSource[key],
                this.valueEdition,
                false
            )
            r = child;
        } else {
            r = new StateMethodsImpl(
                this.store,
                this.path.slice().concat(key),
                this.valueSource[key],
                this.valueEdition,
                this.onSetUsed,
            )
            this.children[key] = r;
        }
        if (this.isDowngraded) {
            r.isDowngraded = true;
        }
        if (this.childrenCache) {
            this.childrenCache[key] = r;
        }
        return r;
    }
    
    private valueArrayImpl(currentValue: StateValueAtPath[]): S {
        if (IsNoProxy) {
            this.isDowngraded = true
            return currentValue as unknown as S;
        }
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
        if (IsNoProxy) {
            this.isDowngraded = true
            return currentValue as unknown as S;
        }
        return proxyWrap(this.path, currentValue,
            () => currentValue,
            (target: object, key: PropertyKey) => {
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

    get self(): State<S> {
        if (this.selfCache) {
            return this.selfCache
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
                const currentDowngraded = this.isDowngraded; // relevant for IE11 only
                const currentValue = this.get(); // IE11 marks this as downgraded
                this.isDowngraded = currentDowngraded; // relevant for IE11 only
                if (// if currentValue is primitive type
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
                    return () => this.get()
                case 'set':
                    return (p: SetStateAction<S>) => this.set(p)
                case 'merge':
                    return (p: SetPartialStateAction<S>) => this.merge(p)
                case 'nested':
                    return (p: keyof S) => nestedGetter(p)
                case 'batch':
                    // tslint:disable-next-line: no-any
                    return <R, C>(action: () => R, context: Exclude<C, Function>) => this.batch(action, context)
                case 'attach':
                    return (p: symbol) => this.attach(p)
                case 'destroy':
                    return () => this.destroy()
                default:
                    return nestedGetter(key)
            }
        }
        
        if (IsNoProxy) {
            // minimal support for IE11
            const result = (Array.isArray(this.valueSource) ? [] : {}) as State<S>;
            [self, 'toJSON', 'path', 'keys', 'value', 'ornull',
                'promised', 'error', 'get', 'set', 'merge',
                'nested', 'batch', 'attach', 'destroy']
            .forEach(key => {
                Object.defineProperty(result, key, {
                    get: () => getter(result, key)
                })
            })
            if (typeof this.valueSource === 'object' && this.valueSource !== null) {
                Object.keys(this.valueSource).forEach(key => {
                    Object.defineProperty(result, key, {
                        enumerable: true,
                        get: () => getter(result, key)
                    })
                })
            }
            this.selfCache = result;
            return this.selfCache
        }
        
        this.selfCache = proxyWrap(this.path, this.valueSource,
            () => {
                return this.get();
            },
            getter,
            (_, key, value) => {
                throw new StateInvalidUsageError(this.path, ErrorId.SetProperty_State)
            },
            false) as unknown as State<S>;
        return this.selfCache
    }
    
    get promised(): boolean {
        const currentValue = this.get(true) // marks used
        if (currentValue === none && this.store.promised && !this.store.promised.fullfilled) {
            return true;
        }
        return false;
    }

    get error(): StateErrorAtRoot | undefined {
        const currentValue = this.get(true) // marks used
        if (currentValue === none) {
            if (this.store.promised && this.store.promised.fullfilled) {
                return this.store.promised.error;
            }
            this.get() // will throw 'read while promised' exception
        }
        return undefined;
    }

    batch<R, C>(
        action: (s: State<S>) => R,
        context?: Exclude<C, Function>
    ): R {
        const opts = { context: context }
        try {
            this.store.startBatch(this.path, opts)
            const result = action(this.self) as R
            if (result as unknown as Symbol === postpone) {
                this.store.postponeBatch(() => this.batch(action, context))
            }
            return result
        } finally {
            this.store.finishBatch(this.path, opts)
        }
    }

    get ornull(): InferredStateOrnullType<S> {
        const value = this.get()
        if (value === null || value === undefined) {
            return value as unknown as InferredStateOrnullType<S>;
        }
        return this.self as InferredStateOrnullType<S>;
    }

    attach(plugin: () => Plugin): State<S>
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>]
    attach(p: (() => Plugin) | symbol):
        State<S> | [PluginCallbacks | Error, PluginStateControl<S>] {
        if (typeof p === 'function') {
            const pluginMeta = p();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                if (this.valueCache !== ValueUnusedMarker) {
                    const currentValue = this.getUntracked(true);
                    this.valueCache = currentValue;
                }
                return this.self;
            }
            this.store.register(pluginMeta);
            return this.self;
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
    targetGetter: () => any,
    // tslint:disable-next-line: no-any
    propertyGetter: (unused: any, key: PropertyKey) => any,
    // tslint:disable-next-line: no-any
    propertySetter: (unused: any, p: PropertyKey, value: any, receiver: any) => boolean,
    isValueProxy: boolean
) {
    const onInvalidUsage = (op: ErrorId) => {
        throw new StateInvalidUsageError(path, op)
    }
    if (typeof targetBootstrap !== 'object' || targetBootstrap === null) {
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
            if (targetReal === undefined || targetReal === null) {
                return undefined;
            }
            const origin = Object.getOwnPropertyDescriptor(targetReal, p);
            if (origin && Array.isArray(targetReal) && p in Array.prototype) {
                return origin;
            }
            return origin && {
                configurable: true, // JSON.stringify() does not work for an object without it
                enumerable: origin.enumerable,
                get: () => propertyGetter(targetReal, p),
                set: undefined
            };
        },
        has: (_target, p) => {
            if (typeof p === 'symbol') {
                return false;
            }
            const targetReal = targetGetter()
            if (typeof targetReal === 'object' && targetReal !== null) {
                return p in targetReal;
            }
            return false;
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
                return Object.keys(targetReal).concat('length');
            }
            if (targetReal === undefined || targetReal === null) {
                return [];
            }
            return Object.keys(targetReal);
        },
        apply: (_target, thisArg, argArray?) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Apply_State:
                ErrorId.Apply_Value)
        },
        construct: (_target, argArray, newTarget?) => {
            return onInvalidUsage(isValueProxy ?
                ErrorId.Construct_State :
                ErrorId.Construct_Value)
        }
    });
}

function createStore<S>(initial: SetInitialStateAction<S>): Store {
    let initialValue: S | Promise<S> = initial as (S | Promise<S>);
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S | Promise<S>))();
    }
    if (typeof initialValue === 'object' && initialValue !== null && initialValue[SelfMethodsID]) {
        throw new StateInvalidUsageError(RootPath, ErrorId.InitStateToValueFromState)
    }
    return new Store(initialValue);
}

// Do not try to use useLayoutEffect if DOM not available (SSR)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

let originUseEffect: (effect: React.EffectCallback, deps?: React.DependencyList) => void;
function useHookEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    for (const dep of deps || []) {
        if (!dep || typeof dep !== 'object') continue
        let state = (dep as any)[self] as StateMethodsImpl<StateValueAtPath> | undefined
        if (state) {
            state.reconnect()
        }
    }
    return originUseEffect(effect, deps)
}
function interceptUseEffect() {
    if (!originUseEffect) {
        originUseEffect = React['useEffect'];
        React['useEffect'] = useHookEffect;
    }
}
interceptUseEffect()
