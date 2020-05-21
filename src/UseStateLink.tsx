import React from 'react';

///
/// EXPOTED SYMBOLS (LIBRARY INTERFACE)
///

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
export type Path = ReadonlyArray<string | number>;

/**
 * Type of an argument of [StateMethods.set](#set).
 */
export type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));

/**
 * Type of an argument of [StateMethods.merge](#merge).
 */
export type SetPartialStateAction<S> =
    S extends ReadonlyArray<(infer U)> ?
        ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) :
    S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) :
    React.SetStateAction<S>;

/**
 * Type of an argument of [createState](#createstate) and [useState](#usestate).
 */
export type SetInitialStateAction<S> = S | Promise<S> | (() => S | Promise<S>)

/**
 * Special symbol which is used as a property to switch
 * between [StateMethods](#interfacesstatemethodsmd) and the corresponding [State](#interfacesstatemd).
 */
export const self = Symbol('self')

/**
 * Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.
 */
export const postpone = Symbol('postpone')

/**
 * Special symbol which might be used to delete properties
 * from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).
 */
export const none = Symbol('none') as StateValueAtPath;

/**
 * Return type of [StateMethods.keys](#keys).
 */
export type InferredStateKeysType<S> =
    S extends ReadonlyArray<infer _> ? ReadonlyArray<number> :
    S extends null ? undefined :
    S extends object ? ReadonlyArray<keyof S> :
    undefined;

/**
 * Return type of [StateMethods.map()](#map).
 */
export type InferredStateOrNullType<S> =
    S extends undefined ? undefined :
    S extends null ? null : State<S>;

/**
 * For plugin developers only.
 * An instance to manipulate the state in more controlled way.
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
 */
export interface StateMethods<S> {
    /**
     * Returns the state instance managed by these methods.
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
     * For a given state of [State](#interfacesstatemd) type,
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
    map<R, RL, RE, C>(
        action: (s: State<S>) => R,
        onPromised: (s: State<S>) => RL,
        onError: (e: StateErrorAtRoot, s: State<S>) => RE,
        context?: Exclude<C, Function>
    ): R | RL | RE;

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
    map<R, RL, C>(
        action: (s: State<S>) => R,
        onPromised: (s: State<S>) => RL,
        context?: Exclude<C, Function>
    ): R | RL;

    /**
     * Maps this state to the result via the provided action.
     * 
     * @param action mapper function
     * 
     * @param context if specified, the callbacks will be invoked in a batch.
     * Updating state within a batch does not trigger immediate rerendering.
     * Instead, all required rerendering is done once once the batch is finished.
     */
    map<R, C>(
        action: (s: State<S>) => R,
        context?: Exclude<C, Function>
    ): R;

    /**
     * If state value is null or undefined, returns state value.
     * Otherwise, it returns this state instance but
     * with null and undefined removed from the type parameter.
     * It is very useful to handle states potentially holding undefined values.
     * For example:
     * 
     * ```tsx
     * const state: State<number | undefined> = useState<number | undefined>(undefined)
     * const stateOrNull: State<number> | undefined = state.map()
     * if (stateOrNull) {
     *     stateOrNull[self].value // <-- will be of type number
     * }
     * ```
     */
    map(): InferredStateOrNullType<S>;

    /**
     * Adds plugin to the state.
     */
    attach(plugin: () => Plugin): State<S>
    
    /**
     * For plugin developers only.
     * It is a method to get the instance of the previously attached plugin.
     * If a plugin has not been attached to a state,
     * it returns an Error as the first element.
     * A plugin may trhow an error to indicate that plugin has not been attached.
     */
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>]
}

/**
 * Mixin for the [StateMethods](#interfacesstatemethodsmd), which can be destroyed by a client.
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
 * An interface to jump to [StateMethods][#interfacesstatemethodsmd] from [State](#interfacesstatemd).
 */
export interface StateMixin<S> {
    [self]: StateMethods<S>;
}

/**
 * An interface to jump to destroyable [StateMethods][#interfacesstatemethodsmd] from [State](#interfacesstatemd).
 */
export interface StateMixinDestroy {
    [self]: StateMethodsDestroy;
}

/**
 * Type of a result of [createState](#createstate) and [useState](#usestate) functions
 */
export type State<S> = StateMixin<S> & (
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<State<U>> :
    S extends object ?  { readonly [K in keyof Required<S>]: State<S[K]>; } :
    {}
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
export function createStateLink<S>(
    initial: SetInitialStateAction<S>
): StateLink<S> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function createStateLink<S, R>(
    initial: SetInitialStateAction<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): WrappedStateLink<R> & StateMethodsDestroy;
export function createStateLink<S, R>(
    initial: SetInitialStateAction<S>,
    transform?: ((state: StateLink<S>, prev: R | undefined) => R)
): (StateLink<S> & StateMethodsDestroy) |
    (WrappedStateLink<R> & StateMethodsDestroy) {
    const stateLink = createStore(initial).accessUnmounted() as StateLinkImpl<S>
    if (createStateLink[DevToolsID]) {
        stateLink.with(createStateLink[DevToolsID])
    }
    if (transform) {
        return stateLink.wrap(transform)
    }
    return stateLink
}

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function useStateLink<S>(
    source: StateLink<S>
): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function useStateLink<S, R>(
    source: StateLink<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function useStateLink<R>(
    source: WrappedStateLink<R>
): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function useStateLink<S>(
    source: SetInitialStateAction<S>
): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function useStateLink<S, R>(
    source: SetInitialStateAction<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S, R>(
    source: SetInitialStateAction<S> | StateLink<S> | WrappedStateLink<R>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateLink<S> | R {
    const [parentLink, tf] =
        source instanceof StateLinkImpl ?
            [source as StateLinkImpl<S>, transform] :
            source instanceof WrappedStateLinkImpl ?
                [source.state as StateLinkImpl<S>, source.transform] :
                [undefined, transform];
    if (parentLink) {
        if (parentLink.onUpdateUsed === NoActionOnUpdate) {
            // Global state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [value, setValue] = React.useState({ state: parentLink.state });
            const link = useSubscribedStateLink<S>(
                value.state,
                parentLink.path,
                () => setValue({ state: value.state }),
                value.state,
                undefined);
            return tf ? injectTransform(link, tf) : link;
        } else {
            // Scoped state mount
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [, setValue] = React.useState({});
            const link = useSubscribedStateLink<S>(
                parentLink.state,
                parentLink.path,
                () => setValue({}),
                parentLink,
                parentLink.isDowngraded);
            return tf ? injectTransform(link, tf) : link;
        }
    } else {
        // Local state mount
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setValue] = React.useState(() => ({ state: createStore(source) }));
        const link = useSubscribedStateLink<S>(
            value.state,
            RootPath,
            () => setValue({ state: value.state }),
            value.state,
            undefined);
        React.useEffect(() => () => value.state.destroy(), []);
        if (useStateLink[DevToolsID]) {
            link.with(useStateLink[DevToolsID])
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
 * @returns [State](#interfacesstatemd) instance,
 * which can be used directly to get and set state value
 * outside of React components.
 * When you need to use the state in a functional `React` component,
 * pass the created state to [useState](#usestate) function and
 * use the returned result in the component's logic.
 */
export function createState<S>(
    initial: SetInitialStateAction<S>
): State<S> & StateMixinDestroy {
    const stateLink = createStateLink(initial);
    if (createState[DevToolsID]) {
        stateLink.attach(createState[DevToolsID])
    }
    return stateLink[self] as State<S> & StateMixinDestroy;
}

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
 * @returns an instance of [State](#interfacesstatemd),
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
 * but the returned instance of [State](#interfacesstatemd)
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
 * @returns an instance of [State](#interfacesstatemd),
 * which **must be** used within the component (during rendering
 * or in effects) or it's children.
 */
export function useState<S>(
    source: SetInitialStateAction<S>
): State<S>;
export function useState<S>(
    source: SetInitialStateAction<S> | State<S>
): State<S> {
    if (typeof source === 'object' && source !== null) {
        const sl = source[StateMarkerID];
        if (sl) {
            // it is already state object
            source = sl; // get underlying StateLink
        }
    }
    const statelink = useStateLink(source as SetInitialStateAction<S>);
    if (useState[DevToolsID]) {
        statelink.attach(useState[DevToolsID])
    }
    return statelink[self];
}

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
 */
export function StateFragment<S>(
    props: {
        state: State<S>,
        children: (state: State<S>) => React.ReactElement,
    }
): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateFragment<S>(
    props: {
        state: StateLink<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use StateFragment(state={state.wrap(transform)}) instead
 */
export function StateFragment<S, E extends {}, R>(
    props: {
        state: StateLink<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateFragment<R>(
    props: {
        state: WrappedStateLink<R>,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateFragment<S>(
    props: {
        state: SetInitialStateAction<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
/**
 * Allows to use a state without defining a functional react component.
 * See more at [StateFragment](#statefragment)
 * // TODO uncomment once moved to version 2
 */
// export function StateFragment<S>(
//     props: {
//         state: SetInitialStateAction<S>,
//         children: (state: State<S>) => React.ReactElement,
//     }
// ): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateFragment<S, R>(
    props: {
        state: SetInitialStateAction<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateFragment<S, E extends {}, R>(
    props: {
        state: SetInitialStateAction<S> | State<S> | StateLink<S> | WrappedStateLink<R>,
        transform?: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: State<S> | StateLink<S> | R) => React.ReactElement,
    }
): React.ReactElement {
    // tslint:disable-next-line: no-any
    type AnyArgument = any; // typesafety is guaranteed by overloaded functions above
    if (props.state[StateMarkerID]) {
        const scoped = useState<S>(props.state as AnyArgument);
        return props.children(scoped as AnyArgument);
    } else {
        const scoped = useStateLink<S, {}>(props.state as AnyArgument, props.transform as AnyArgument);
        return props.children(scoped as AnyArgument);
    }
}

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export function StateMemo<S, R>(
    transform: (state: StateLink<S>, prev: R | undefined) => R,
    equals?: (next: R, prev: R) => boolean) {
    return (link: StateLink<S>, prev: R | undefined) => {
        link[StateMemoID] = equals || ((n: R, p: R) => (n === p))
        return transform(link, prev);
    }
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
    label(name: string): void;
    // tslint:disable-next-line: no-any
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
 */
export function DevTools<S>(state: StateLink<S> | State<S>): DevToolsExtensions {
    if (state[StateMarkerID]) {
        const plugin = (state as State<S>)[self].attach(DevToolsID);
        if (plugin[0] instanceof Error) {
            return EmptyDevToolsExtensions;
        }
        return plugin[0] as DevToolsExtensions;
    } else {
        const plugin = (state as StateLink<S>).with(DevToolsID, () => undefined);
        if (plugin) {
            return plugin[1] as DevToolsExtensions;
        }
        return EmptyDevToolsExtensions;
    }
}

///
/// INTERNAL SYMBOLS (LIBRARY IMPLEMENTATION)
///

const EmptyDevToolsExtensions: DevToolsExtensions = {
    label() { /* */ },
    log() { /* */ }
}

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

// TODO replace by StateLinkInvalidUsageError
class PluginUnknownError extends Error {
    constructor(s: symbol) {
        super(`Plugin '${extractSymbol(s)}' has not been attached to the StateInf or StateLink. ` +
            `Hint: you might need to register the required plugin using 'with' method. ` +
            `See https://github.com/avkonst/hookstate#plugins for more details`)
    }
}

interface Subscriber {
    onSet(paths: Path[], actions: (() => void)[]): void;
}

interface Subscribable {
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
}

const DowngradedID = Symbol('Downgraded');
const StateMemoID = Symbol('StateMemo');
const ProxyMarkerID = Symbol('ProxyMarker');
/**
 * @hidden
 * @ignore
 * @internal
 * remove export when plugins are migrated to version 2
 */
export const StateMarkerID = Symbol('State');

const RootPath: Path = [];
const DestroyedEdition = -1

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

class Store implements Subscribable {
    private _edition: number = 0;

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
            this._value = None
        } else if (_value === None) {
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
                    this._value !== None &&
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
        if (result === None) {
            return result;
        }
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
                'Global state is explicitly destroyed at \'StateInf.destroy()\'. ' +
                'Local state is automatically destroyed when a component is unmounted.')
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
            if (value === None) {
                this._promised = this.createPromised(undefined)
                delete onSetArg.value
                delete onSetArg.state
            } else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = this.createPromised(value)
                value = None
                delete onSetArg.value
                delete onSetArg.state
            } else if (this._promised && !this._promised.resolver) {
                // TODO add hint
                throw new StateLinkInvalidUsageError(
                    `write promised state`,
                    path,
                    '')
            }

            let prevValue = this._value;
            if (prevValue === None) {
                delete onSetArg.previous
            }
            this._value = value;
            this.afterSet(onSetArg)

            if (prevValue === None && this._value !== None &&
                this.promised && this.promised.resolver) {
                this.promised.resolver()
            }

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

                // if an array of object is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return path.slice(0, -1)
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
            })

            // if an array of object is about to be extended by new property
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
        if (this._value !== None) {
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
        if (this._value !== None) {
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

        const pluginCallbacks = plugin.create ? plugin.create(this.accessUnmounted()) :
            plugin.init ? plugin.init(this.accessUnmounted()[self]) : {};
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

    accessUnmounted() {
        return new StateLinkImpl<StateValueAtRoot>(
            this,
            RootPath,
            NoActionOnUpdate,
            this.get(RootPath),
            this.edition
            // TODO downgraded plugin should not be used here as it affects all inherited links (which is temporary fixed in the useStateLink)
            // instead optimisations are possible based on checks of onUpdateUsed === NoActionOnUpdate
        ).with(Downgraded) // it does not matter how it is used, it is not subscribed anyway
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }

    destroy() {
        this._destroySubscribers.forEach(cb => cb(this._value !== None ? { state: this._value } : {}))
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

const NoActionOnUpdate = () => { /* empty */ };
NoActionOnUpdate[UnmountedCallback] = true

class WrappedStateLinkImpl<S, R> implements WrappedStateLink<R>, StateMethodsDestroy {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerInf = SynteticID;
    public disabledTracking: boolean | undefined;

    constructor(
        public readonly state: StateLinkImpl<S>,
        public readonly transform: (state: StateLink<S>, prev: R | undefined) => R,
    ) { }

    access(): R {
        return this.transform(this.state, undefined)
    }

    with(plugin: () => Plugin): this {
        this.state.with(plugin);
        return this;
    }

    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2) {
        return new WrappedStateLinkImpl<S, R2>(this.state, (s, p) => {
            return transform(this.transform(s, undefined), p)
        })
    }

    destroy() {
        this.state.destroy()
    }
}

type ErrorValueAtPath = any; //tslint:disable-line: no-any

class Promised {
    public fullfilled?: true;
    public error?: ErrorValueAtPath;
    public resolver?: () => void;

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

class StateLinkImpl<S> implements StateLink<S>,
    StateMethodsDestroy,
    ExtendedStateLinkMixin<S>,
    Subscribable, Subscriber {
    public isDowngraded: boolean | undefined;
    private subscribers: Set<Subscriber> | undefined;

    private nestedLinksCache: Record<string | number, StateLinkImpl<S[keyof S]>> | undefined;

    constructor(
        public readonly state: Store,
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
        if (this.valueSource === None && !allowPromised) {
            if (this.state.promised && this.state.promised.error) {
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
            if (this.isDowngraded) {
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
        const currentValue = this.get(true) // marks used
        if (currentValue === None && this.state.promised && !this.state.promised.fullfilled) {
            return true;
        }
        return false;
    }

    get error() {
        const currentValue = this.get(true) // marks used
        if (currentValue === None) {
            if (this.state.promised && this.state.promised.fullfilled) {
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

    set(newValue: SetStateAction<S>) {
        this.state.update([this.setUntracked(newValue)]);
    }

    mergeUntracked(sourceValue: SetPartialStateAction<S>): Path[] {
        const currentValue = this.getUntracked()
        if (typeof sourceValue === 'function') {
            sourceValue = (sourceValue as Function)(currentValue);
        }

        let updatedPath: Path;
        let deletedOrInsertedProps = false

        if (Array.isArray(currentValue)) {
            if (Array.isArray(sourceValue)) {
                return [this.setUntracked(currentValue.concat(sourceValue) as unknown as S, sourceValue)]
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
            })
            updatedPath = this.setUntracked(currentValue, sourceValue)
        } else if (typeof currentValue === 'string') {
            return [this.setUntracked((currentValue + String(sourceValue)) as unknown as S, sourceValue)]
        } else {
            return [this.setUntracked(sourceValue as S)]
        }

        if (updatedPath !== this.path || deletedOrInsertedProps) {
            return [updatedPath]
        }
        return Object.keys(sourceValue).map(p => updatedPath.slice().concat(p))
    }

    merge(sourceValue: SetPartialStateAction<S>) {
        this.state.update(this.mergeUntracked(sourceValue));
    }

    batch(action: (s: StateLink<S>) => void, options?: BatchOptions): void {
        if (this.promised) {
            const ifPromised = options && options.ifPromised || 'reject'
            if (ifPromised === 'postpone') {
                return this.state.postponeBatch(() => this.batch(action, options))
            }
            if (ifPromised === 'discard') {
                return;
            }
            if (ifPromised === 'reject') {
                this.get(); // this will throw (default behavior)
            }
        }
        try {
            this.state.startBatch(this.path, options)
            action(this)
        } finally {
            this.state.finishBatch(this.path, options)
        }
    }

    // remove in version 2, replace by rerender
    update(paths: Path[]) {
        this.state.update(paths)
    }

    rerender(paths: Path[]) {
        this.state.update(paths)
    }

    denull(): InferredStateLinkDenullType<S>  {
        const value = this.get()
        if (value === null || value === undefined) {
            return value as unknown as InferredStateLinkDenullType<S>;
        }
        return this as unknown as InferredStateLinkDenullType<S>;
    }

    with(plugin: () => Plugin): this;
    with<R = never>(pluginId: symbol, alt?: () => R): [StateLink<S> & ExtendedStateLinkMixin<S>, PluginCallbacks] | R;
    with<R = never>(plugin: (() => Plugin) | symbol, alt?: () => R):
        this | [StateLink<S> & ExtendedStateLinkMixin<S>, PluginCallbacks] | R {
        if (typeof plugin === 'function') {
            const pluginMeta = plugin();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                return this;
            }
            this.state.register(pluginMeta);
            return this;
        } else {
            const instance = this.state.getPlugin(plugin);
            if (instance) {
                return [this, instance];
            }
            if (alt) {
                return alt();
            }
            throw new PluginUnknownError(plugin)
        }
    }

    access() {
        return this;
    }

    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R) {
        return new WrappedStateLinkImpl<S, R>(this, transform)
    }

    destroy(): void {
        this.state.destroy()
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

    onSet(paths: Path[], actions: (() => void)[]) {
        this.updateIfUsed(paths, actions)
    }

    private updateIfUsed(paths: Path[], actions: (() => void)[]): boolean {
        const update = () => {
            if (this.isDowngraded &&
                (ValueCache in this || NestedCache in this)) {
                actions.push(this.onUpdateUsed);
                return true;
            }
            for (let path of paths) {
                const firstChildKey = path[this.path.length];
                if (firstChildKey === undefined) {
                    if (ValueCache in this || NestedCache in this) {
                        actions.push(this.onUpdateUsed);
                        return true;
                    }
                } else {
                    const firstChildValue = this.nestedLinksCache && this.nestedLinksCache[firstChildKey];
                    if (firstChildValue && firstChildValue.updateIfUsed(paths, actions)) {
                        return true;
                    }
                }
            }
            return false;
        }

        const updated = update();
        if (!updated && this.subscribers !== undefined) {
            this.subscribers.forEach(s => {
                s.onSet(paths, actions)
            })
        }
        return updated;
    }

    get keys(): InferredStateLinkKeysType<S> {
        const value = this.get()
        if (Array.isArray(value)) {
            return Object.keys(value).map(i => Number(i)).filter(i => Number.isInteger(i)) as
                unknown as InferredStateLinkKeysType<S>;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value) as unknown as InferredStateLinkKeysType<S>;
        }
        return undefined as InferredStateLinkKeysType<S>;
    }

    get nested(): InferredStateLinkNestedType<S> {
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
        return this[NestedCache] as InferredStateLinkNestedType<S>;
    }

    private nestedArrayImpl(currentValue: StateValueAtPath[]): InferredStateLinkNestedType<S> {
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
            if (this.isDowngraded) {
                r.isDowngraded = true;
            }
            proxyGetterCache[index] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter) as
            unknown as InferredStateLinkNestedType<S>;
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
                return (this.nested)![index].get();
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

    private nestedObjectImpl(currentValue: object): InferredStateLinkNestedType<S> {
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
            if (this.isDowngraded) {
                r.isDowngraded = true;
            }
            proxyGetterCache[key] = r;
            return r;
        };
        return this.proxyWrap(currentValue, getter) as
            unknown as InferredStateLinkNestedType<S>;
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
    
    get [self](): State<S> {
        const getValueSourceTracked = () => {
            this.get() // mark used
            return this.valueSource
        }
        let bootstrapValueSource = this.valueSource; // no need to use this.getUntracked() to refresh
        if (typeof bootstrapValueSource !== 'object' || bootstrapValueSource === null) {
            bootstrapValueSource = {} as S;
        }
        return proxyWrap(this.path, bootstrapValueSource, getValueSourceTracked,
        (_, key) => {
            if (key === StateMarkerID) {
                // should be tested before target is obtained
                // to keep it clean from usage marker
                return this;
            }
            if (typeof key === 'symbol') {
                if (key === self) {
                    return this
                } else {
                    return undefined
                }
            } else {
                if (key === 'toJSON') {
                    throw new StateLinkInvalidUsageError('toJSON()', this.path,
                        'did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?');
                }
                const currentValue = getValueSourceTracked();
                if (typeof currentValue !== 'object' || currentValue === null) {
                    throw new StateLinkInvalidUsageError('get', this.path,
                        `target value is not an object to contain properties`)
                }
                if (Array.isArray(currentValue)) {
                    if (key === 'length') {
                        return currentValue.length;
                    }
                    if (key in Array.prototype) {
                        return Array.prototype[key];
                    }
                    const index = Number(key);
                    if (!Number.isInteger(index)) {
                        return undefined;
                    }              
                }
                return (this.nested)![key][self];
            }
        },
        (_, key, value) => {
            throw new StateLinkInvalidUsageError('set', this.path,
                `did you mean to use 'state.${String(key)}[self].set(value)' instead of 'state.${String(key)} = value'?`)
        }) as unknown as State<S>;
    }
    
    map<R, RL, RE, C>(
        action: (s: State<S>) => R,
        onPromised: (s: State<S>) => RL,
        onError: (e: StateErrorAtRoot, s: State<S>) => RE,
        context?: Exclude<C, Function>
    ): R | RL | RE;
    map<R, RL, C>(
        action: (s: State<S>) => R,
        onPromised: (s: State<S>) => RL,
        context?: Exclude<C, Function>
    ): R | RL;
    map<R, C>(
        action: (s: State<S>) => R,
        context?: Exclude<C, Function>
    ): R;
    map(): InferredStateOrNullType<S>;
    map<R, RL, RE, C>(
        action?: (s: State<S>) => R,
        onPromised?: ((s: State<S>) => RL) | Exclude<C, Function>,
        onError?: ((e: StateErrorAtRoot, s: State<S>) => RE) | Exclude<C, Function>,
        context?: Exclude<C, Function>
    ): InferredStateOrNullType<S> | R | RL | RE {
        if (!action) {
            const r = this.denull();
            if (r) {
                return r[self] as InferredStateOrNullType<S>;
            }
            return r as unknown as InferredStateOrNullType<S>;
        }

        const contextArg = typeof onPromised === 'function'
            ? (typeof onError === 'function' ? context : onError)
            : onPromised;

        const runBatch = ((actionArg: () => (R | RL | RE)) => {
            if (contextArg !== undefined) {
                const opts = { context: contextArg }
                try {
                    this.state.startBatch(this.path, opts)
                    return actionArg()
                } finally {
                    this.state.finishBatch(this.path, opts)
                }
            } else {
                return actionArg()
            }
        })
            
        if (typeof onPromised === 'function' && this.promised) {
            return runBatch(() => {
                const r = (onPromised as ((s: State<S>) => RL))(this[self])
                if (r as unknown as symbol === postpone) {
                    // tslint:disable-next-line: no-any
                    this.state.postponeBatch(
                        () => this.map(action, onPromised as any, onError as any, context as any))
                }
                return r;
            })
        }
        
        if (typeof onError === 'function' && this.error) {
            return runBatch(() => (onError as ((e: StateErrorAtRoot, s: State<S>) => RE))(this.error, this[self]))
        }
        
        return runBatch(() => action(this[self]))
    }

    attach(plugin: () => Plugin): State<S>
    attach(pluginId: symbol): [PluginCallbacks | Error, PluginStateControl<S>]
    attach(p: (() => Plugin) | symbol):
        State<S> | [PluginCallbacks | Error, PluginStateControl<S>] {
        if (typeof p === 'function') {
            const pluginMeta = p();
            if (pluginMeta.id === DowngradedID) {
                this.isDowngraded = true;
                return this[self];
            }
            this.state.register(pluginMeta);
            return this[self];
        } else {
            const instance = this.state.getPlugin(p);
            const capturedThis = this;
            return [instance || (new PluginUnknownError(p)), 
                // TODO need to create an instance until version 2
                // because of the incompatible return types from methods
                {
                    getUntracked() {
                        return capturedThis.getUntracked()
                    },
                    setUntracked(v): Path[] {
                        return [capturedThis.setUntracked(v)]
                    },
                    mergeUntracked(v): Path[] {
                        return capturedThis.mergeUntracked(v)
                    },
                    rerender(paths) {
                        return capturedThis.rerender(paths);
                    }
                }
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
    propertySetter: (unused: any, p: PropertyKey, value: any, receiver: any) => boolean
) {
    const onInvalidUsage = (op: string) => {
        throw new StateLinkInvalidUsageError(op, path)
    }
    return new Proxy(targetBootstrap, {
        getPrototypeOf: (target) => {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getPrototypeOf#Invariants
            const targetReal = targetGetter()
            if (targetReal === undefined || targetReal === null) {
                return null;
            }
            return Object.getPrototypeOf(targetReal);
        },
        setPrototypeOf: (target, v) => {
            return onInvalidUsage('setPrototypeOf')
        },
        isExtensible: (target) => {
            // should satisfy the invariants:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible#Invariants
            return true; // required to satisfy the invariants of the getPrototypeOf
            // return Object.isExtensible(target);
        },
        preventExtensions: (target) => {
            return onInvalidUsage('preventExtensions')
        },
        getOwnPropertyDescriptor: (target, p) => {
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
                get: () => propertyGetter(undefined, p),
                set: undefined
            };
        },
        has: (target, p) => {
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
        deleteProperty: (target, p) => {
            return onInvalidUsage('deleteProperty')
        },
        defineProperty: (target, p, attributes) => {
            return onInvalidUsage('defineProperty')
        },
        enumerate: (target) => {
            const targetReal = targetGetter()
            if (Array.isArray(targetReal)) {
                return Object.keys(targetReal).concat('length');
            }
            if (targetReal === undefined || targetReal === null) {
                return [];
            }
            return Object.keys(targetReal);
        },
        ownKeys: (target) => {
            const targetReal = targetGetter()
            if (Array.isArray(targetReal)) {
                return Object.keys(targetReal).concat('length');
            }
            if (targetReal === undefined || targetReal === null) {
                return [];
            }
            return Object.keys(targetReal);
        },
        apply: (target, thisArg, argArray?) => {
            return onInvalidUsage('apply')
        },
        construct: (target, argArray, newTarget?) => {
            return onInvalidUsage('construct')
        }
    });
}

function createStore<S>(initial: SetInitialStateAction<S>): Store {
    let initialValue: S | Promise<S> = initial as (S | Promise<S>);
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S | Promise<S>))();
    }
    if (typeof initialValue === 'object' && initialValue !== null && initialValue[ProxyMarkerID]) {
        throw new StateLinkInvalidUsageError(
            `create/useStateLink(state.get() at '/${initialValue[ProxyMarkerID].path.join('/')}')`,
            RootPath,
            'did you mean to use create/useStateLink(state) OR ' +
            'create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?')
    }
    return new Store(initialValue);
}

function useSubscribedStateLink<S>(
    state: Store,
    path: Path,
    update: () => void,
    subscribeTarget: Subscribable,
    disabledTracking: boolean | undefined
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
    React.useEffect(() => {
        subscribeTarget.subscribe(link);
        return () => {
            link.onUpdateUsed[UnmountedCallback] = true
            subscribeTarget.unsubscribe(link);
        }
    });
    return link;
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
/// EXTERNAL DEPRECATED SYMBOLS (left for backward compatibility, will be removed in version 2)
///

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source directly instead
 */
export function useStateLinkUnmounted<S>(
    source: DestroyableStateLink<S>,
): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source.wrap(transform).access() instead
 */
export function useStateLinkUnmounted<S, R>(
    source: DestroyableStateLink<S>,
    transform: (state: StateLink<S>) => R
): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source.access() instead
 */
export function useStateLinkUnmounted<R>(
    source: DestroyableWrappedStateLink<R>,
): R;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated use source directly or source.wrap(transform).access() instead
 */
export function useStateLinkUnmounted<S, R>(
    source: DestroyableStateLink<S> | DestroyableWrappedStateLink<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    if (source instanceof WrappedStateLinkImpl) {
        return source.access()
    }
    if (transform) {
        return transform(source as DestroyableStateLink<S>)
    }
    return source as DestroyableStateLink<S>;
}

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
export type NestedInferredLink<S> = InferredStateLinkNestedType<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type NestedInferredKeys<S> = InferredStateLinkKeysType<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type DestroyableStateLink<S> =
    StateLink<S> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type DestroyableWrappedStateLink<R> =
    WrappedStateLink<R> & StateMethodsDestroy;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type StateRef<S> = StateInf<StateLink<S>>
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type StateInf<S> = S extends StateLink<infer U> ? DestroyableStateLink<U> : DestroyableWrappedStateLink<S>

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type StateLinkPlugable<S> = ExtendedStateLinkMixin<S>;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type InitialValueAtRoot<S> = SetInitialStateAction<S>;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type InferredStateLinkNestedType<S> =
    S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> :
    S extends null ? undefined :
    S extends object ? { readonly [K in keyof Required<S>]: StateLink<S[K]>; } :
    undefined;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type InferredStateLinkKeysType<S> = InferredStateKeysType<S>;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export type InferredStateLinkDenullType<S> =
    S extends undefined ? undefined :
    S extends null ? null : StateLink<S>;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface BatchOptions {
    ifPromised?: 'postpone' | 'discard' | 'reject' | 'execute',
    context?: AnyContext;
}

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export const None = none;

/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export interface StateLink<S> extends StateMethods<S> {
    readonly promised: boolean;
    readonly error: StateErrorAtRoot | undefined; //tslint:disable-line: no-any
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
export type DestroyMixin = StateMethodsDestroy

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
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): WrappedStateLink<R2>
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
