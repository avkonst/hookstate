
import { Plugin, PluginTypeMarker, StateValueAtRoot } from '../UseStateLink';

const PluginID = Symbol('LocalPersistence');

// tslint:disable-next-line: function-name
export function Persistence<S, E extends {}>(localStorageKey: string):
    ((unsued: PluginTypeMarker<S, E>) => Plugin<E, {}>) {

    return () => {
        return {
            id: PluginID,
            instanceFactory: (initial: StateValueAtRoot) => {
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
