
import { Plugin, PluginTypeMarker } from '../UseStateLink';

const PluginID = Symbol('LocalPersistence');

// tslint:disable-next-line: function-name
export function LocalPersistence<S, E extends {}>(localStorageKey: string):
    ((unsued: PluginTypeMarker<S, E>) => Plugin<S, E, {}>) {

    return function localStoragePluginInit(unused: PluginTypeMarker<S, E>): Plugin<S, E, {}> {
        return {
            id: PluginID,
            // tslint:disable-next-line: no-any
            instanceFactory: (initial: any) => {
                return {
                    onInit: () => {
                        const persisted = localStorage.getItem(localStorageKey);
                        if (persisted !== null) {
                            const result = JSON.parse(persisted);
                            return result;
                        }
                        localStorage.setItem(localStorageKey, JSON.stringify(initial))
                        return initial;
                    },
                    onSet: (p, v) => {
                        localStorage.setItem(localStorageKey, JSON.stringify(v));
                    },
                    extensions: [],
                    extensionsFactory: (l) => ({})
                }
            }
        }
    }
}
