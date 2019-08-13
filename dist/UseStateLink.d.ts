import React from 'react';
import { ObjectStateMutation } from './UseStateObject';
import { ArrayStateMutation } from './UseStateArray';
export interface PluginTypeMarker<S, E extends {}> {
}
export interface StateRef<S, E extends {}> {
    with<I>(plugin: (marker: PluginTypeMarker<S, E>) => Plugin<E, I>): StateRef<S, E & I>;
}
export declare type NestedInferredLink<S, E extends {}> = S extends ReadonlyArray<(infer U)> ? ReadonlyArray<StateLink<U, E>> : S extends null ? undefined : S extends object ? {
    readonly [K in keyof Required<S>]: StateLink<S[K], E>;
} : undefined;
export declare type InferredStateMutation<S> = S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> : S extends null ? undefined : S extends object ? ObjectStateMutation<S> : undefined;
export declare type Path = ReadonlyArray<string | number>;
export interface StateLink<S, E extends {} = {}> {
    readonly path: Path;
    readonly value: S;
    readonly nested: NestedInferredLink<S, E>;
    readonly inferred: InferredStateMutation<S>;
    readonly extended: E;
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
    onSet?: (path: Path, newValue: StateValueAtRoot) => void;
    extensions: (keyof I)[];
    extensionsFactory: (thisLink: StateLink<StateValueAtPath, E>) => I;
}
export interface Plugin<E extends {}, I extends {}> {
    id: symbol;
    instanceFactory: (initial: StateValueAtRoot) => PluginInstance<E, I>;
}
export declare function createStateLink<S>(initial: S | (() => S)): StateRef<S, {}>;
export declare function useStateLink<S, E extends {}>(initialState: StateLink<S, E> | StateRef<S, E>): StateLink<S, E>;
export declare function useStateLink<S, E extends {}, R>(initialState: StateLink<S, E> | StateRef<S, E>, transform: (state: StateLink<S, E>, prev: R | undefined) => R): R;
export declare function useStateLink<S, E extends {}>(initialState: S | (() => S)): StateLink<S, E>;
export declare function useStateLink<S, E extends {}, R>(initialState: S | (() => S), transform: (state: StateLink<S, E>, prev: R | undefined) => R): R;
export declare function useStateLinkUnmounted<S, E extends {}>(stateRef: StateRef<S, E>): StateLink<S, E>;
export declare function DisabledTracking(): Plugin<{}, {}>;
export interface PrerenderExtensions {
    enablePrerender(equals?: (newValue: TransformResult, prevValue: TransformResult) => boolean): void;
}
export declare function Prerender<S, E extends {}>(marker: PluginTypeMarker<S, E>): Plugin<E, PrerenderExtensions>;
export default useStateLink;
