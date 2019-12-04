import { InitialValueAtRoot, StateLink, StateRef, StateInf } from './Declarations';
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
