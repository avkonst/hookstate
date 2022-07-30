import { Extension, InferStateValueType, StateValueAtPath } from '@hookstate/core';

export interface Comparable {
    compare(other: InferStateValueType<this>): number
    equals(other: InferStateValueType<this>): boolean
}

export function comparable(compare: (v1: StateValueAtPath, v2: StateValueAtPath) => number): () => Extension<Comparable> {
    return () => ({
        onCreate: () => ({
            compare: (s) => (other) => compare(s.get({ noproxy: true }), other),
            equals: (s) => (other) => compare(s.get({ noproxy: true }), other) === 0,
        })
    })
}
