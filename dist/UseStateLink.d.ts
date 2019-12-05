import React from 'react';
/**
 * @deprecated use StateInf<StateLink<S>> instead.
 */
export declare type StateRef<S> = StateInf<StateLink<S>>;
export interface StateInf<R> {
    __synteticTypeInferenceMarkerInf: symbol;
    access(): R;
    with(plugin: () => Plugin): StateInf<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2>;
    destroy(): void;
}
export declare type NestedInferredLink<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K]>;
} : undefined;
export declare type Path = ReadonlyArray<string | number>;
export declare type SetStateAction<S> = (S | Promise<S>) | ((prevState: S) => (S | Promise<S>));
export declare type SetPartialStateAction<S> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<U> | Record<number, U> | ((prevValue: S) => (ReadonlyArray<U> | Record<number, U>)) : S extends object | string ? Partial<S> | ((prevValue: S) => Partial<S>) : React.SetStateAction<S>;
export interface StateLink<S> {
    readonly path: Path;
    readonly nested: NestedInferredLink<S>;
    readonly value: S;
    get(): S;
    /** @warning experimental feature */
    readonly promised: boolean;
    /** @warning experimental feature */
    readonly error: ErrorValueAtPath | undefined;
    set(newValue: SetStateAction<S>): void;
    merge(newValue: SetPartialStateAction<S>): void;
    /** @warning experimental feature */
    batch(action: () => void): void;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
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
export declare type InitialValueAtRoot<S> = S | Promise<S> | (() => S | Promise<S>);
/** @warning experimental feature */
export declare const None: any;
export interface PluginInstance {
    readonly onInit?: () => StateValueAtRoot | void;
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined) => void | StateValueAtRoot;
    readonly onSet?: (path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined) => void;
    readonly onDestroy?: (state: StateValueAtRoot) => void;
}
export interface Plugin {
    readonly id: symbol;
    readonly instanceFactory: (initial: StateValueAtRoot, linkFactory: () => StateLink<StateValueAtRoot>) => PluginInstance;
}
export declare function createStateLink<S>(initial: InitialValueAtRoot<S>): StateInf<StateLink<S>>;
export declare function createStateLink<S, R>(initial: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
export declare function useStateLink<S>(source: StateLink<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: StateLink<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<S>(source: StateInf<StateLink<S>>): StateLink<S>;
export declare function useStateLink<S, R>(source: StateInf<StateLink<S>>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<R>(source: StateInf<R>): R;
export declare function useStateLink<S>(source: InitialValueAtRoot<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
/**
 * @deprecated use source.access() instead
 */
export declare function useStateLinkUnmounted<S>(source: StateRef<S>): StateLink<S>;
/**
 * @deprecated use source.wrap(transform).access() instead
 */
export declare function useStateLinkUnmounted<S, R>(source: StateRef<S>, transform: (state: StateLink<S>) => R): R;
/**
 * @deprecated use source.access() instead
 */
export declare function useStateLinkUnmounted<R>(source: StateInf<R>): R;
export declare function StateFragment<S>(props: {
    state: StateLink<S> | StateRef<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, E extends {}, R>(props: {
    state: StateLink<S> | StateRef<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<R>(props: {
    state: StateInf<R>;
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
