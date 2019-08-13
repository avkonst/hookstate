import { Plugin, PluginTypeMarker } from '@hookstate/core';
import { InitialExtensions } from '@hookstate/initial';
export interface TouchedExtensions {
    readonly touched: boolean;
    readonly untouched: boolean;
}
export declare function Touched<S, E extends InitialExtensions>(unused: PluginTypeMarker<S, E>): Plugin<E, TouchedExtensions>;
