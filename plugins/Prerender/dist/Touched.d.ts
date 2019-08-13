import { Plugin, PluginTypeMarker } from 'react-hookstate';
import { InitialExtensions } from 'react-hookstate-initial';
export interface TouchedExtensions {
    readonly touched: boolean;
    readonly untouched: boolean;
}
export declare function Touched<S, E extends InitialExtensions>(unused: PluginTypeMarker<S, E>): Plugin<E, TouchedExtensions>;
