import { Extension } from '@hookstate/core';

export interface Identifiable {
    identifier: string
}

export function (identifier: string): Extension<Identifiable> {
    return {
        onCreate: () => ({
            identifier: _ => identifier
        })
    }
}
