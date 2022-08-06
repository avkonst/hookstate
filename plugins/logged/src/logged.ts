import { ExtensionFactory, State, StateValueAtPath } from '@hookstate/core';

export interface Logged {
    log(): void
}

export function logged<S, E>(options?: {
    identifier?: string,
    logger?: (...args: any[]) => void
}): ExtensionFactory<S, E, Logged> {
    return () => {
        let identifier: string;
        let serializer: (s: State<StateValueAtPath, Logged & E>) => (opts?: { stealth?: boolean }) => string;
        let logger = options?.logger ?? console.log
        return {
            onCreate: () => ({
                log: (s) => () => {
                    if (s.promise) {
                        logger(`[hookstate][${identifier}] logged: promised`)
                    } else {
                        logger(`[hookstate][${identifier}] logged: ${serializer(s)({ stealth: true })}`)
                    }
                }
            }),
            onInit: (state, extensionMethods) => {
                if (options?.identifier === undefined) {
                    if (extensionMethods['identifier'] === undefined) {
                        identifier = 'untitled'
                    } else {
                        identifier = extensionMethods['identifier'](state)
                    }
                } else {
                    identifier = options.identifier
                }
                if (extensionMethods['serialize'] !== undefined) {
                    serializer = extensionMethods['serialize']
                } else {
                    serializer = (s) => (opts) => JSON.stringify(s.get({ noproxy: true, stealth: opts?.stealth }))
                }
                if (state.promise) {
                    logger(`[hookstate][${identifier}] initialized: promised`)
                } else {
                    logger(`[hookstate][${identifier}] initialized: ${serializer(state)({ stealth: true })}`)
                }
            },
            onSet: (s, d) => {
                if (s.promised) {
                    logger(`[hookstate][${identifier}] set to: promised`)
                } else if (s.error !== undefined) {
                    logger(`[hookstate][${identifier}] set to: error: ${s.error}`)
                } else {
                    if (d.actions) {
                        logger(`[hookstate][${identifier}] set at path ${s.path} to: ${serializer(s)({ stealth: true })} with update actions: ${JSON.stringify(d)}`)
                    } else {
                        logger(`[hookstate][${identifier}] set at path ${s.path} to: ${serializer(s)({ stealth: true })}`)
                    }
                }
            },
            onDestroy: (s) => {
                if (s.promise) {
                    logger(`[hookstate][${identifier}] destroyed: promised`)
                } else {
                    logger(`[hookstate][${identifier}] destroyed: ${serializer(s)({ stealth: true })}`)
                }
            }
        }
    }
}
