import React from 'react';
export interface StateRef<S> {
    __synteticTypeInferenceMarkerRef: symbol;
    with(plugin: () => Plugin): StateRef<S>;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
}
export interface StateInf<R> {
    __synteticTypeInferenceMarkerInf: symbol;
    with(plugin: () => Plugin): StateInf<R>;
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
export declare type TransformResult = any;
export interface PluginInstance {
    readonly onInit?: () => StateValueAtRoot | void;
    readonly onPreset?: (path: Path, prevState: StateValueAtRoot, newValue: StateValueAtPath) => void | StateValueAtRoot;
    readonly onSet?: (path: Path, newState: StateValueAtRoot, newValue: StateValueAtPath) => void;
}
export interface Plugin {
    readonly id: symbol;
    readonly instanceFactory: (initial: StateValueAtRoot) => PluginInstance;
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
/**
 * @deprecated: use Degraded instead
 */
export declare function DisabledTracking(): Plugin;
export declare function Degraded(): Plugin;
export default useStateLink;
