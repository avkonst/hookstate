import { Plugin, PluginTypeMarker } from 'react-hookstate';
export interface LoggerExtensions {
    log(): void;
}
export declare function Logger<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, LoggerExtensions>;
