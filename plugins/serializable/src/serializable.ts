import { Extension, StateValueAtPath } from '@hookstate/core';

export interface Serializable {
    serialize: () => string,
    deserialize: (v: string) => void,
}

export function serializable(
    serialize: (v: StateValueAtPath) => string,
    deserialize: (v: string) => StateValueAtPath
): () => Extension<Serializable> {
    return () => ({
        onCreate: () => ({
            serialize: s => () => serialize(s.get({ noproxy: true })),
            deserialize: s => v => s.set(deserialize(v)),
        })
    })
}
