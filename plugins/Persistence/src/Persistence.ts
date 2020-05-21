import { Plugin, StateValueAtRoot, PluginCallbacks, State, self } from '@hookstate/core';

const PluginID = Symbol('LocalPersistence');

// tslint:disable-next-line: function-name
export function Persistence(localStorageKey: string): (() => Plugin) {
    return () => ({
        id: PluginID,
        init: (state: State<StateValueAtRoot>) => {
            const persisted = localStorage.getItem(localStorageKey);
            if (persisted !== null) {
                const result = JSON.parse(persisted);
                state[self].set(result);
            } else {
                state[self].map(
                    l => localStorage.setItem(localStorageKey, JSON.stringify(l[self].value)),
                    () => {/**/},
                    () => {/**/},
                )
            }
            return {
                onSet: (p) => {
                    if ('state' in p) {
                        localStorage.setItem(localStorageKey, JSON.stringify(p.state));
                    } else {
                        localStorage.removeItem(localStorageKey)
                    }
                }
            } as PluginCallbacks
        }
    })
}
