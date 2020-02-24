import React from 'react';
export declare type NestedInferredLink<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K]>;
} : undefined;
export declare type NestedInferredKeys<S> = S extends ReadonlyArray<infer _> ? ReadonlyArray<number> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S> : undefined;
export declare type Path = ReadonlyArray<string | number>;
export declare type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));
export declare type SetPartialStateAction<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) : S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) : React.SetStateAction<S>;
export declare type OnlyNullable<S> = S extends null ? S extends undefined ? null | undefined : null : S extends undefined ? undefined : never;
export interface StateLink<S> {
    get(): S;
    set(newValue: SetStateAction<S>): void;
    merge(newValue: SetPartialStateAction<S>): void;
    readonly value: S;
    /** @warning experimental feature */
    readonly promised: boolean;
    /** @warning experimental feature */
    readonly error: ErrorValueAtPath | undefined;
    readonly path: Path;
    readonly nested: NestedInferredLink<S>;
    readonly keys: NestedInferredKeys<S>;
    /** @warning experimental feature */
    denull(): StateLink<NonNullable<S>> | OnlyNullable<S>;
    /** @warning experimental feature */
    batch(action: (s: StateLink<S>) => void, options?: {
        ifPromised?: 'postpone' | 'discard' | 'reject' | 'execute';
        context?: CustomContext;
    }): void;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R>;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & ExtendedStateLinkMixin<S>, PluginCallbacks];
}
export interface ManagedStateLinkMixin<T> {
    access(): T;
    destroy(): void;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyableStateLink<S> = StateLink<S> & ManagedStateLinkMixin<StateLink<S>>;
export interface WrappedStateLink<R> {
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): WrappedStateLink<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): WrappedStateLink<R2>;
}
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type DestroyableWrappedStateLink<R> = WrappedStateLink<R> & ManagedStateLinkMixin<R>;
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
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare type StateLinkPlugable<S> = ExtendedStateLinkMixin<S>;
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
export declare type ErrorValueAtPath = any;
export declare type CustomContext = any;
export declare type InitialValueAtRoot<S> = S | Promise<S> | (() => S | Promise<S>);
/** @warning experimental feature */
export declare const None: any;
/**
 * For plugin developers only.
 * Reserved plugin ID for developers tools extension.
 *
 * @hidden
 * @ignore
 *
 * @warning experimental feature
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
 * Creates new state.
 *
 * @example http://hookstate.js.org/docs/?path=/docs/getting-started--global-state
 *
 * @param initial Initial value of the state.
 * It can be a value OR a promise, which asynchronously resolves to a value
 * OR a function returning a value or a promise.
 *
 * @typeparam S Type of a value of the state
 *
 * @returns State link instance, which can be used directly
 * to get and set state value outside of a react component,
 * for example, in an event handler or callback.
 *
 */
export declare function createStateLink<S>(initial: InitialValueAtRoot<S>): StateLink<S> & ManagedStateLinkMixin<StateLink<S>>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function createStateLink<S, R>(initial: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R> & ManagedStateLinkMixin<R>;
export declare function useStateLink<S>(source: StateLink<S>): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S, R>(source: StateLink<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<R>(source: WrappedStateLink<R>): R;
export declare function useStateLink<S>(source: InitialValueAtRoot<S>): StateLink<S>;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function useStateLink<S, R>(source: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
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
export declare function StateFragment<R>(props: {
    state: WrappedStateLink<R>;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S>(props: {
    state: InitialValueAtRoot<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
/**
 * @hidden
 * @ignore
 * @internal
 * @deprecated declared for backward compatibility
 */
export declare function StateFragment<S, R>(props: {
    state: InitialValueAtRoot<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateMemo<S, R>(transform: (state: StateLink<S>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S>, prev: R | undefined) => R;
export declare function Downgraded(): Plugin;
/**
 * @hidden
 * @ignore
 * @internal
 * @depracated default export is deprecated
 */
export default useStateLink;
