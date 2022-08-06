import { ExtensionFactory, Path, StateValueAtPath } from '@hookstate/core';

export interface Serializable {
    serialize: (options?: { stealth?: boolean }) => string,
    deserialize: (v: string) => void,
}

export function serializable<S, E>(
    serialize: (path: Path, v: StateValueAtPath) => string,
    deserialize: (path: Path, v: string) => void
): ExtensionFactory<S, E, Serializable> {
    return () => ({
        onCreate: () => ({
            serialize: s => (options) => serialize(s.path, s.get({ noproxy: true, stealth: options?.stealth })),
            deserialize: s => (v) => s.set(deserialize(s.path, v)),
        })
    })
}
