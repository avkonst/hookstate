import { Plugin, PluginTypeMarker } from '@hookstate/core';
export declare function Persistence<S, E extends {}>(localStorageKey: string): ((unsued: PluginTypeMarker<S, E>) => Plugin<E, {}>);
