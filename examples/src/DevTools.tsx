import { useStateLink, DevTools, Plugin, createStateLink, StateValueAtRoot, None } from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

const PluginId = Symbol('ReduxDevToolsClient')

let initialized = false;
export function InitDevTools() {
    if (initialized) {
        return;
    }
    initialized = true;
    
    let lastLocal = 0;
    let lastGlobal = 0;
    const tracker = (isLocal: boolean) => () => ({
        id: PluginId,
        create: (lnk) => {
            const assignedId = isLocal ? 'local-' + (lastLocal += 1) : 'global-' + (lastGlobal += 1);

            let fromRemote = false;
            let fromLocal = false;
            const reduxStore = createStore(
                (state, action: { type: string, state: StateValueAtRoot }) => {
                    if ((action.type.startsWith('SET [') || action.type === 'RESET') && !fromLocal) {
                        // replay from development tools
                        // TODO: improve this code: set by path instead of the whole state (for SET case only)
                        try {
                            fromRemote = true;
                            if ('state' in action) {
                                lnk.set(action.state)
                            } else {
                                lnk.set(None)
                            }
                        } finally {
                            fromRemote = false;
                        }
                    }
                    if (lnk.promised) {
                        return None;
                    }
                    return lnk.value;
                },
                devToolsEnhancer({
                    name: `${window.location.hostname}: ${assignedId}`,
                    trace: true
                })
            )
            
            // tslint:disable-next-line: no-any
            const dispatch = (action: any, alt?: () => void) => {
                if (!fromRemote) {
                    try {
                        fromLocal = true;
                        reduxStore.dispatch(action)
                    } finally {
                        fromLocal = false;
                    }
                } else if (alt) {
                    alt()
                }
            }
            dispatch({ type: `CREATE` })
            
            return {
                onSet: (p) => {
                    dispatch({ ...p, type: `SET [${p.path.join('/')}]` })
                },
                onDestroy: () => {
                    dispatch({ type: `DESTROY` }, () => {
                        setTimeout(() => dispatch({ type: `RESET -> DESTROY` }))
                    })
                }
            }
        }
    } as Plugin);
    
    useStateLink[DevTools] = tracker(true)
    createStateLink[DevTools] = tracker(false)
}
InitDevTools() // attach on load
