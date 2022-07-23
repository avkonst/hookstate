import { StateValue, StateValueAtPath, Extension } from '@hookstate/core';

export interface Clonable {
    clone(): StateValue<this>
}

export function clonable(snapshot: (v: StateValueAtPath) => StateValueAtPath): () => Extension<Clonable> {
    return () => ({
        onCreate: () => ({
            clone: (s) => () => snapshot(s.get({ noproxy: true }))
        })
    })
}
