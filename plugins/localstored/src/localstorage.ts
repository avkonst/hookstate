import { Extension, State, StateValueAtPath, StateValueAtRoot, __State } from '@hookstate/core';

export interface LocalStored { }

export function localstored<S, E>(options?: {
    key?: string,
    initializer?: () => Promise<S>
}): (typemarker?: __State<S, E>) => Extension<LocalStored> {
    return () => {
        let key: string;
        let serializer: (s: State<StateValueAtPath>) => () => string;
        let deserializer: (s: State<StateValueAtPath>) => (v: string) => void;
        let stateAtRoot: State<StateValueAtRoot, {}>
        return {
            onCreate: (s) => {
                stateAtRoot = s;
                return {}
            },
            onInit: (state, extensionMethods) => {
                if (options?.key === undefined) {
                    if (extensionMethods['identifier'] === undefined) {
                        throw Error('State is missing Identifiable extension')
                    }
                    key = extensionMethods['identifier'](state)
                } else {
                    key = options.key
                }
                if (extensionMethods['serialize'] !== undefined) {
                    serializer = extensionMethods['serialize']
                } else {
                    serializer = (s) => () => JSON.stringify(s.get({ noproxy: true }))
                }
                if (extensionMethods['deserialize'] !== undefined) {
                    deserializer = extensionMethods['deserialize'](state)
                } else {
                    deserializer = (s) => (v) => s.set(JSON.parse(v))
                }

                // here it is synchronous, but most storages would be async
                // this is supported too, as the state.set can be really set asynchronously
                const persisted = localStorage.getItem(key);
                if (persisted !== null) {
                    // persisted state exists
                    deserializer(state)(persisted); // this one sets the state value as well
                } else if (options?.initializer) {
                    options.initializer().then(i => {
                        state.set(i)
                    })
                }
            },
            onSet: (s) => {
                if (s.promised || s.error !== undefined) {
                    localStorage.removeItem(key)
                } else {
                    // save the entire state from the root
                    // smarter implementations could implement partial state saving,
                    // which would save only the nested state set (parameter `s` in onSet)
                    localStorage.setItem(key, serializer(stateAtRoot)());
                }
            }
        }
    }
}
