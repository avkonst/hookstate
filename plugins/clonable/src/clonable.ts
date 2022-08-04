import { InferStateValueType, StateValueAtPath, ExtensionFactory } from '@hookstate/core';

export interface Clonable {
    clone(options?: { stealth?: boolean }): InferStateValueType<this>
}

export function clonable<S, E>(snapshot: (v: StateValueAtPath) => StateValueAtPath): ExtensionFactory<S, E, Clonable> {
    return () => ({
        onCreate: () => ({
            clone: (s) => (o) => snapshot(s.get({ noproxy: true, stealth: o?.stealth }))
        })
    })
}
