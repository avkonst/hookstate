import { Plugin, StateLink } from '@hookstate/core';
export interface InitialExtensions<S> {
    get(): S | undefined;
    modified(): boolean;
    unmodified(): boolean;
}
export declare function Initial(): Plugin;
export declare function Initial<S>(self: StateLink<S>): InitialExtensions<S>;
