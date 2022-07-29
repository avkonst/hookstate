import { StateValue, StateValueAtPath, Extension } from '@hookstate/core';

export interface Clonable {
    clone(options?: { stealth?: boolean }): StateValue<this>
}

export function clonable(snapshot: (v: StateValueAtPath) => StateValueAtPath): () => Extension<Clonable> {
    return () => ({
        onCreate: () => ({
            clone: (s) => (o) => snapshot(s.get({ noproxy: true, stealth: o?.stealth }))
        })
    })
}
