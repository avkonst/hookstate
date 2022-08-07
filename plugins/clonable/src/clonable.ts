import { InferStateValueType, StateValueAtPath, ExtensionFactory, hookstate, State } from '@hookstate/core';

export interface Clonable {
    clone<S extends InferStateValueType<this>>(options?: { stealth?: boolean }): S
}

export function clonable<S, E>(snapshot: (v: StateValueAtPath) => StateValueAtPath): ExtensionFactory<S, E, Clonable> {
    return () => ({
        onCreate: () => ({
            clone: (s) => (o) => snapshot(s.get({ noproxy: true, stealth: o?.stealth }))
        })
    })
}
