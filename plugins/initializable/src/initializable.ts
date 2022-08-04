import { ExtensionFactory, State } from '@hookstate/core';

export interface Initializable {}

export function initializable<S, E>(initializer: (s: State<S, E>) => (void | ((s: State<S, E>) => void))):
    ExtensionFactory<S, E, Initializable> {
    let uninitializer: ((s: State<S, E>) => void) | void = undefined;
    return () => ({
        onInit: (s) => {
            uninitializer = initializer(s as unknown as State<S, E>)
        },
        onDestroy: (s) => {
            if (uninitializer) {
                uninitializer(s as unknown as State<S, E>)
            }
        }
    })
}
