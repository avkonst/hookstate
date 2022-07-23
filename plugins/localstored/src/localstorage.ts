import { Extension, none } from '@hookstate/core';

export interface LocalStored {}

export function localstored(localStorageKey: string): () => Extension<LocalStored> {
    return () => ({
        onCreate: (sf) => {
            const persisted = localStorage.getItem(localStorageKey);
            let state = sf()
            if (persisted !== null) {
                const result = JSON.parse(persisted);
                state.set(result);
            } else if (!state.promised && !!!state.error) {
                localStorage.setItem(localStorageKey, JSON.stringify(state.value))
            }
            return {}
        },
        onSet: (state, d) => {
            if (state.value === none) {
                localStorage.removeItem(localStorageKey)
            } else {
                localStorage.setItem(localStorageKey, JSON.stringify(state.get({ noproxy: true })));
            }
        }
    })
}
