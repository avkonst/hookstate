import React from 'react';
/**
 * @deprecated, declared for backward compatibility.
 */
export declare type StateRef<S> = StateInf<StateLink<S>>;
/**
 * @deprecated, declared for backward compatibility.
 */
export declare type StateInf<S> = S extends StateLink<infer U> ? DestroyableStateLink<U> : DestroyableWrappedStateLink<S>;
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
    denull(): StateLink<NonNullable<S>> | OnlyNullable<S>;
    /** @warning experimental feature */
    batch(action: (s: StateLink<S>) => void, options?: {
        ifPromised?: 'postpone' | 'discard' | 'reject' | 'execute';
        context?: CustomContext;
    }): void;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): WrappedStateLink<R>;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance | PluginCallbacks];
}
export interface DestroyableStateLink<S> extends StateLink<S> {
    access(): StateLink<S>;
    wrap<R>(transform: (state: DestroyableStateLink<S>, prev: R | undefined) => R): DestroyableWrappedStateLink<R>;
    destroy(): void;
}
export interface WrappedStateLink<R> {
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): WrappedStateLink<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): WrappedStateLink<R2>;
}
export interface DestroyableWrappedStateLink<R> extends WrappedStateLink<R> {
    access(): R;
    with(plugin: () => Plugin): DestroyableWrappedStateLink<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): DestroyableWrappedStateLink<R2>;
    destroy(): void;
}
export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(paths: Path[]): void;
}
export declare type StateValueAtRoot = any;
export declare type StateValueAtPath = any;
export declare type ErrorValueAtPath = any;
export declare type CustomContext = any;
export declare type InitialValueAtRoot<S> = S | Promise<S> | (() => S | Promise<S>);
/** @warning experimental feature */
export declare const None: any;
/** @warning experimental feature */
export declare const DevTools: unique symbol;
export interface PluginCallbacksOnSetArgument {
    readonly path: Path;
    readonly state?: StateValueAtRoot;
    readonly previous?: StateValueAtPath;
    readonly value?: StateValueAtPath;
    readonly merged?: StateValueAtPath;
}
export interface PluginCallbacksOnDestroyArgument {
    readonly state?: StateValueAtRoot;
}
export interface PluginCallbacksOnBatchArgument {
    readonly path: Path;
    readonly state?: StateValueAtRoot;
    readonly context?: CustomContext;
}
export interface PluginCallbacks {
    readonly onSet?: (arg: PluginCallbacksOnSetArgument) => void;
    readonly onDestroy?: (arg: PluginCallbacksOnDestroyArgument) => void;
    readonly onBatchStart?: (arg: PluginCallbacksOnBatchArgument) => void;
    readonly onBatchFinish?: (arg: PluginCallbacksOnBatchArgument) => void;
}
/** @deprecated by PluginCallbacks */
export interface PluginInstance {
    readonly onInit?: () => StateValueAtRoot | void;
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined) => void | StateValueAtRoot;
    readonly onSet?: (path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined) => void;
    readonly onDestroy?: (state: StateValueAtRoot) => void;
}
export interface Plugin {
    readonly id: symbol;
    readonly create?: (state: StateLink<StateValueAtRoot>) => PluginCallbacks;
    /** @deprecated use create instead */
    readonly instanceFactory?: (initial: StateValueAtRoot, linkFactory: () => StateLink<StateValueAtRoot>) => PluginInstance;
}
export declare function createStateLink<S>(initial: InitialValueAtRoot<S>): DestroyableStateLink<S>;
export declare function createStateLink<S, R>(initial: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): DestroyableWrappedStateLink<R>;
export declare function useStateLink<S>(source: StateLink<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: StateLink<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<R>(source: WrappedStateLink<R>): R;
export declare function useStateLink<S>(source: InitialValueAtRoot<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
/**
 * @deprecated use source directly instead
 */
export declare function useStateLinkUnmounted<S>(source: DestroyableStateLink<S>): StateLink<S>;
/**
 * @deprecated use source.wrap(transform).access() instead
 */
export declare function useStateLinkUnmounted<S, R>(source: DestroyableStateLink<S>, transform: (state: StateLink<S>) => R): R;
/**
 * @deprecated use source.access() instead
 */
export declare function useStateLinkUnmounted<R>(source: DestroyableWrappedStateLink<R>): R;
export declare function StateFragment<S>(props: {
    state: StateLink<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
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
export declare function StateFragment<S, R>(props: {
    state: InitialValueAtRoot<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateMemo<S, R>(transform: (state: StateLink<S>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S>, prev: R | undefined) => R;
export declare function Downgraded(): Plugin;
/**
 * @depracated default export is deprecated
 */
export default useStateLink;
