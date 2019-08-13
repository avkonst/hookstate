import { Plugin, PluginTypeMarker } from '@hookstate/core';
export interface LoggerExtensions {
    log(): void;
}
export declare function Logger<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, LoggerExtensions>;
