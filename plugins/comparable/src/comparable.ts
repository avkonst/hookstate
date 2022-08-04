import { ExtensionFactory, InferStateValueType, StateValueAtPath } from '@hookstate/core';

export interface Comparable {
    compare(other: InferStateValueType<this>): number
    equals(other: InferStateValueType<this>): boolean
}

export function comparable<S, E>(compare: (v1: StateValueAtPath, v2: StateValueAtPath) => number): ExtensionFactory<S, E, Comparable> {
    return () => ({
        onCreate: () => ({
            compare: (s) => (other) => compare(s.get({ noproxy: true }), other),
            equals: (s) => (other) => compare(s.get({ noproxy: true }), other) === 0,
        })
    })
}
