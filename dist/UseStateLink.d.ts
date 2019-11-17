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
export interface StateLink<S> {
    readonly path: Path;
    readonly nested: NestedInferredLink<S>;
    readonly value: S;
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
}
export interface StateLinkPlugable<S> {
    getUntracked(): S;
    setUntracked(newValue: React.SetStateAction<S>): Path;
    update(path: Path | Path[]): void;
}
export declare type StateValueAtRoot = any;
export declare type StateValueAtPath = any;
export declare const None: any;
export interface PluginInstance {
    readonly onInit?: () => StateValueAtRoot | void;
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath) => void | StateValueAtRoot;
    readonly onSet?: (path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath, prevValue: StateValueAtPath) => void;
    readonly onDestroy?: (state: StateValueAtRoot) => void;
}
export interface Plugin {
    readonly id: symbol;
    readonly instanceFactory: (initial: StateValueAtRoot, linkFactory: () => StateLink<StateValueAtRoot>) => PluginInstance;
}
export declare function createStateLink<S>(initial: S | (() => S)): StateRef<S>;
export declare function createStateLink<S, R>(initial: S | (() => S), transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
export declare function useStateLink<R>(source: StateInf<R>): R;
export declare function useStateLink<S>(source: StateLink<S> | StateRef<S>): StateLink<S>;
export declare function useStateLink<S, R>(source: StateLink<S> | StateRef<S>, transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLink<S>(source: S | (() => S)): StateLink<S>;
export declare function useStateLink<S, R>(source: S | (() => S), transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLinkUnmounted<R>(source: StateInf<R>): R;
export declare function useStateLinkUnmounted<S>(source: StateRef<S>): StateLink<S>;
export declare function useStateLinkUnmounted<S, R>(source: StateRef<S>, transform: (state: StateLink<S>) => R): R;
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
    state: S | (() => S);
    children: (state: StateLink<S>) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, R>(props: {
    state: S | (() => S);
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateMemo<S, R>(transform: (state: StateLink<S>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S>, prev: R | undefined) => R;
export declare function Downgraded(): Plugin;
export default useStateLink;
