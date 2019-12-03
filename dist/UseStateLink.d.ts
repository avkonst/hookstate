import React from 'react';
export interface StateRef<S> {
    __synteticTypeInferenceMarkerRef: symbol;
    with(plugin: () => Plugin): StateRef<S>;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
    destroy(): void;
}
export interface StateInf<R> {
    __synteticTypeInferenceMarkerInf: symbol;
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
    /** @warning experimental feature */
    readonly promised: boolean;
    /** @warning experimental feature */
    readonly error: ErrorValueAtPath | undefined;
    get(): S;
    set(newValue: SetStateAction<S>): void;
    merge(newValue: SetPartialStateAction<S>): void;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
}
export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: SetStateAction<S>): Path;
    mergeUntracked(mergeValue: SetPartialStateAction<S>): Path | Path[];
    update(path: Path | Path[]): void;
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
export declare function createStateLink<S>(initial: InitialValueAtRoot<S>): StateRef<S>;
export declare function createStateLink<S, R>(initial: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
export declare function useStateLink<R>(source: StateInf<R>): R;
export declare function useStateLink<S>(source: StateLink<S> | StateRef<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: StateLink<S> | StateRef<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<S>(source: InitialValueAtRoot<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: InitialValueAtRoot<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
/**
 * @deprecated use accessStateLink instead
 */
export declare function useStateLinkUnmounted<R>(source: StateInf<R>): R;
/**
 * @deprecated use accessStateLink instead
 */
export declare function useStateLinkUnmounted<S>(source: StateRef<S>): StateLink<S>;
/**
 * @deprecated use accessStateLink instead
 */
export declare function useStateLinkUnmounted<S, R>(source: StateRef<S>, transform: (state: StateLink<S>) => R): R;
export declare function accessStateLink<R>(source: StateInf<R>): R;
export declare function accessStateLink<S>(source: StateRef<S>): StateLink<S>;
export declare function accessStateLink<S, R>(source: StateRef<S>, transform: (state: StateLink<S>) => R): R;
export declare function StateFragment<R>(props: {
    state: StateInf<R>;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S>(props: {
    state: StateLink<S> | StateRef<S>;
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, E extends {}, R>(props: {
    state: StateLink<S> | StateRef<S>;
    transform: (state: StateLink<S>, prev: R | undefined) => R;
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
export default useStateLink;
