import { Plugin, PluginTypeMarker, StateValueAtPath } from '@hookstate/core';
export interface InitialExtensions {
    readonly initial: StateValueAtPath | undefined;
    readonly modified: boolean;
    readonly unmodified: boolean;
}
export declare function Initial<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, InitialExtensions>;
