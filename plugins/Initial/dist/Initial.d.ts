import { Plugin, State } from '@hookstate/core';
export interface InitialExtensions<S> {
    get(): S | undefined;
    modified(): boolean;
    unmodified(): boolean;
}
export declare function Initial(): Plugin;
export declare function Initial<S>($this: State<S>): InitialExtensions<S>;
