import { ExtensionFactory, State } from '@hookstate/core';

export interface StoreEngine {
    getItem: (key: string) => Promise<string | null> | string;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
}

export interface LocalStored { }

export function localstored<S, E>(options?: {
    key?: string,
    engine?: StoreEngine,
    initializer?: () => Promise<S>
}): ExtensionFactory<S, E, LocalStored> {
    return () => {
        let key: string;
        let serializer: (s: State<S, E>) => () => string;
        let deserializer: (s: State<S, E>) => (v: string) => void;
        let stateAtRoot: State<S, E>
        let storageEngine: StoreEngine | Storage;

        // Check if the code is running in a browser environment
        if (typeof window !== 'undefined') {
            // Use the specified storage engine or fallback to window.localStorage
            storageEngine = options?.engine || window.localStorage;
        } else {
            // Replace with your desired behavior for non-browser environments
            storageEngine = options?.engine || {
                getItem: (_key: string) => Promise.resolve(null),
                setItem: (_key: string, _value: string) => Promise.resolve(),
                removeItem: (_key: string) => Promise.resolve(),
            };
        }

        return {
            onInit: (state, extensionMethods) => {
                stateAtRoot = state;
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
                const response = storageEngine.getItem(key);
                Promise.resolve(response).then(persisted => {
                    if (persisted) {
                        // persisted state exists
                        deserializer(state)(persisted); // this one sets the state value as well
                    } else if (options?.initializer) {
                        options.initializer().then(s => {
                            state.set(s);
                        });
                    }
                });
            },
            onSet: (s) => {
                if (s.promised || s.error !== undefined) {
                    const response = storageEngine.removeItem(key);
                    Promise.resolve(response).then(() => { });
                } else {
                    // save the entire state from the root
                    // smarter implementations could implement partial state saving,
                    // which would save only the nested state set (parameter `s` in onSet)
                    const response = storageEngine.setItem(key, serializer(stateAtRoot)());
                    Promise.resolve(response).then(() => { });
                }
            }
        }
    }
}
