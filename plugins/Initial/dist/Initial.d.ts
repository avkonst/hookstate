import { Plugin, StateLink } from '@hookstate/core';
export interface InitialExtensions<S> {
    readonly get: () => S | undefined;
    readonly modified: () => boolean;
    readonly unmodified: () => boolean;
}
export declare function Initial(): Plugin;
export declare function Initial<S>(self: StateLink<S>): InitialExtensions<S>;
