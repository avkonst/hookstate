import React from 'react';
export interface PluginTypeMarker<S, E extends {}> {
}
export interface StateRef<S, E extends {} = {}> {
    __synteticTypeInferenceMarkerRef: symbol;
    with<I>(plugin: (marker: PluginTypeMarker<S, E>) => Plugin<E, I>): StateRef<S, E & I>;
}
export interface StateInf<R> {
    __synteticTypeInferenceMarkerInf: symbol;
}
export declare type NestedInferredLink<S, E extends {} = {}> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U, E>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K], E>;
} : undefined;
export declare type Path = ReadonlyArray<string | number>;
export interface StateLink<S, E extends {} = {}> {
    readonly path: Path;
    readonly value: S;
    readonly nested: NestedInferredLink<S, E>;
    readonly extended: E;
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    with<I>(plugin: (marker: PluginTypeMarker<S, E>) => Plugin<E, I>): StateLink<S, E & I>;
}
export declare type ValueLink<S, E extends {} = {}> = StateLink<S, E>;
export declare type StateValueAtRoot = any;
export declare type StateValueAtPath = any;
export declare type TransformResult = any;
export interface PluginInstance<E extends {}, I extends {}> {
    onInit?: () => StateValueAtRoot | void;
    onAttach?: (path: Path, withArgument: PluginInstance<{}, {}>) => void;
    onSet?: (path: Path, newValue: StateValueAtRoot, prevValue: StateValueAtPath) => void;
    extensions: (keyof I)[];
    extensionsFactory: (thisLink: StateLink<StateValueAtPath, E>) => I;
}
export interface Plugin<E extends {}, I extends {}> {
    id: symbol;
    instanceFactory: (initial: StateValueAtRoot) => PluginInstance<E, I>;
}
export declare function createStateLink<S>(initial: S | (() => S)): StateRef<S, {}>;
export declare function createStateLink<S, R>(initial: S | (() => S), transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
export declare function useStateLink<R>(source: StateInf<R>): StateInf<R>;
export declare function useStateLink<S, E extends {}>(source: StateLink<S, E> | StateRef<S, E>): StateLink<S, E>;
export declare function useStateLink<S, E extends {}, R>(source: StateLink<S, E> | StateRef<S, E>, transform: (state: StateLink<S, E>, prev: R | undefined) => R): R;
export declare function useStateLink<S>(source: S | (() => S)): StateLink<S>;
export declare function useStateLink<S, R>(source: S | (() => S), transform: (state: StateLink<S>, prev: R | undefined) => R): R;
export declare function useStateLinkUnmounted<R>(source: StateInf<R>): R;
export declare function useStateLinkUnmounted<S, E extends {}>(source: StateRef<S, E>): StateLink<S, E>;
export declare function StateFragment<R>(props: {
    state: StateInf<R>;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, E extends {}>(props: {
    state: StateLink<S, E> | StateRef<S, E>;
    children: (state: StateLink<S, E>) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, E extends {}, R>(props: {
    state: StateLink<S, E> | StateRef<S, E>;
    transform: (state: StateLink<S, E>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S>(props: {
    state: S | (() => S);
    children: (state: StateLink<S, {}>) => React.ReactElement;
}): React.ReactElement;
export declare function StateFragment<S, R>(props: {
    state: S | (() => S);
    transform: (state: StateLink<S>, prev: R | undefined) => R;
    children: (state: R) => React.ReactElement;
}): React.ReactElement;
export declare function StateMemo<S, E extends {}, R>(transform: (state: StateLink<S, E>, prev: R | undefined) => R, equals?: (next: R, prev: R) => boolean): (link: StateLink<S, E>, prev: R | undefined) => R;
export declare function DisabledTracking(): Plugin<{}, {}>;
export default useStateLink;
