import { Extension, StateValue, StateValueAtPath } from '@hookstate/core';

export interface Comparable {
    compare(other: StateValue<this>): number
    equals(other: StateValue<this>): boolean
}

export function comparable(compare: (v1: StateValueAtPath, v2: StateValueAtPath) => number): Extension<Comparable> {
    return {
        onCreate: () => ({
            compare: (s) => (other) => compare(s.get({ noproxy: true }), other),
            equals: (s) => (other) => compare(s.get({ noproxy: true }), other) === 0,
        })
    }
}
