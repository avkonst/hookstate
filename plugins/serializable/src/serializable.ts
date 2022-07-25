import { Extension, Path, StateValue, StateValueAtPath } from '@hookstate/core';

export interface Serializable {
    serialize: () => string,
    deserialize: (v: string) => void,
}

export function serializable(
    serialize: (path: Path, v: StateValueAtPath) => string,
    deserialize: (path: Path, v: string) => void
): () => Extension<Serializable> {
    return () => ({
        onCreate: () => ({
            serialize: s => () => serialize(s.path, s.get({ noproxy: true })),
            deserialize: s => (v) => s.set(deserialize(s.path, v)),
        })
    })
}
