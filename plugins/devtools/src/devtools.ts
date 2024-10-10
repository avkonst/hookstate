import {
    StateValueAtRoot,
    StateValueAtPath,
    State,
    none,
    Path,
    ExtensionFactory,
} from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

function createReduxDevToolsLogger(
    stateAtRoot: State<StateValueAtRoot>, assignedId: string, onBreakpoint: () => void) {
    let fromRemote = false;
    let fromLocal = false;
    const reduxStore = createStore(
        (_, action: { type: string, value: StateValueAtRoot, path?: Path }) => {
            if (!fromLocal) {
                const isValidPath = (p: Path) => Array.isArray(p) &&
                    p.findIndex(l => typeof l !== 'string' && typeof l !== 'number') === -1;
                if (action.type.startsWith('SET')) {
                    const setState = (stateAtPath: State<StateValueAtPath>) => {
                        try {
                            fromRemote = true;
                            if ('value' in action) {
                                stateAtPath.set(action.value)
                            } else {
                                stateAtPath.set(none)
                            }
                        } finally {
                            fromRemote = false;
                        }
                    }
                    // replay from development tools
                    if (action.path) {
                        if (isValidPath(action.path)) {
                            if (action.path.length === 0) {
                                setState(stateAtRoot)
                            }
                            let s = stateAtRoot;
                            let valid = true;
                            for (let p of action.path) {
                                if (s[p]) {
                                    s = s[p];
                                } else {
                                    valid = false;
                                }
                            }
                            if (valid) {
                                setState(s)
                            }
                        }
                    } else {
                        setState(stateAtRoot)
                    }
                } else if (action.type === 'BREAKPOINT') {
                    onBreakpoint()
                }
            }
            if (stateAtRoot.promised || stateAtRoot.error) {
                return none
            }
            return stateAtRoot.get({noproxy: true})
        },
        devToolsEnhancer({
            name: `${window.location.hostname}: ${assignedId}`,
            trace: true,
            traceLimit: 16,
            autoPause: true,
            shouldHotReload: false,
            features: {
                persist: true,
                pause: true,
                lock: false,
                export: 'custom',
                import: 'custom',
                jump: false,
                skip: false,
                reorder: false,
                dispatch: true,
                test: false
            }
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
    return dispatch;
}

export function devtools<S, E extends {}>(options?: { key?: string }): ExtensionFactory<S, E, {}> {
    return () => {
        let key: string;

        let submitToMonitor: ReturnType<typeof createReduxDevToolsLogger> | undefined;
        let breakpoint = false;

        return {
            onInit: (state, extensionMethods) => {
                if (// server-side rendering
                    typeof window === 'undefined' ||
                    // development tools monitor is not open
                    !('__REDUX_DEVTOOLS_EXTENSION__' in window)) {
                    return;
                }

                if (options?.key === undefined) {
                    if (extensionMethods['identifier'] === undefined) {
                        throw Error('State is missing Identifiable extension or Devtools key option')
                    }
                    key = extensionMethods['identifier'](state)
                } else {
                    key = options.key
                }

                submitToMonitor = createReduxDevToolsLogger(state, key, () => {
                    breakpoint = !breakpoint;
                });
                if (!state.promise) {
                    submitToMonitor?.({ type: `CREATE`, state: state.get({ noproxy: true, stealth: true }) })
                }
            },
            onSet: (state, d) => {
                submitToMonitor?.({ type: `SET [${state.path.join('/')}]`, state: state.get({ noproxy: true, stealth: true }), descriptor: d })
                if (breakpoint) {
                    // tslint:disable-next-line: no-debugger
                    debugger;
                }
            },
            onDestroy: () => {
                submitToMonitor?.({ type: `DESTROY` })
            }
        }
    }
}
