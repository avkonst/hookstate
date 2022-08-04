import { ExtensionFactory } from '@hookstate/core';

export interface Identifiable {
    readonly identifier: string
}

export function identifiable<S, E>(identifier: string): ExtensionFactory<S, E, Identifiable> {
    return () => ({
        onCreate: () => ({
            identifier: _ => identifier
        })
    })
}
