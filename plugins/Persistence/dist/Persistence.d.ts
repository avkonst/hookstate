import { Plugin, PluginTypeMarker } from 'react-hookstate';
export declare function Persistence<S, E extends {}>(localStorageKey: string): ((unsued: PluginTypeMarker<S, E>) => Plugin<E, {}>);
