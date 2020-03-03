import {
    createStateLink,
    useStateLink,
    StateValueAtRoot,
    StateValueAtPath,
    StateLink,
    Path,
    DevTools as DevToolsID,
    Plugin,
    None,
    Labelled,
} from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

const IsDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const PluginId = Symbol('DevTools')
const PluginIdForMonitored = Symbol('DevToolsMonitored')

let MonitoredStatesLogger = (_: string) => { /* */ };
const MonitoredStatesLabel = '@hookstate/devtools: settings';
const MonitoredStates = createStateLink<{ monitored: string[], callstacksDepth: number }>(() => {
        const p = localStorage.getItem(MonitoredStatesLabel)
        if (!p) {
            return {
                monitored: [MonitoredStatesLabel],
                callstacksDepth: IsDevelopment ? 30 : 0
            }
        }
        return JSON.parse(p)
    })
    .with(Labelled(MonitoredStatesLabel))
    .with(() => ({
        id: PluginIdForMonitored,
        create: () => ({
            onSet: p => {
                let v = p.state;
                if (!v || !v.monitored || !Array.isArray(v.monitored)) {
                    v = v || {}
                    v.monitored = [MonitoredStatesLabel]
                } else if (!v.monitored.includes(MonitoredStatesLabel)) {
                    v.monitored.push(MonitoredStatesLabel)
                }
                const depth = Number(v.callstacksDepth);
                v.callstacksDepth = Number.isInteger(depth) && depth >= 0 ? depth : IsDevelopment ? 30 : 0;
                localStorage.setItem(MonitoredStatesLabel, JSON.stringify(v))
                if (v !== p.state) {
                    MonitoredStates.set(v)
                }
            }
        })
    }))

export interface DevToolsExtensions {
    // tslint:disable-next-line: no-any
    log(str: string, data?: any): void;
}

export const DevTools = (state: StateLink<StateValueAtPath>) => {
    return state.with(PluginId)[1] as DevToolsExtensions;
}
DevTools.Init = () => {
    useStateLink[DevToolsID] = DevToolsInternal
    createStateLink[DevToolsID] = DevToolsInternal
};

let lastUnlabelledId = 0;
function getLabel() {
    const obj: { stack?: string } = {}
    const oldLimit = Error.stackTraceLimit
    Error.stackTraceLimit = 2;
    Error.captureStackTrace(obj, MonitoredStates.with)
    Error.stackTraceLimit = oldLimit;
    const s = obj.stack;
    if (!s) {
        return 'unlabelled-' + (lastUnlabelledId += 1)
    }
    const parts = s.split('\n', 3);
    if (parts.length < 3) {
        return 'unlabelled-' + (lastUnlabelledId += 1)
    }
    return parts[2]
        .replace(/\s*[(].*/, '')
        .replace(/\s*at\s*/, '')
}

function DevToolsInternal(): Plugin {
    return ({
        id: PluginId,
        create: (lnk) => {
            const label = Labelled(lnk)
            const assignedId = label ? label : getLabel();

            const monitored = MonitoredStates.value.monitored.includes(assignedId) || (IsDevelopment && label)
            if (!monitored) {
                MonitoredStatesLogger(`CREATE [${assignedId}] (unmonitored)`)
                return {
                    log() { /* unmonitored */ },
                    onDestroy() {
                        MonitoredStatesLogger(`DESTROY [${assignedId}] (unmonitored)`)
                    }
                }
            }

            let fromRemote = false;
            let fromLocal = false;
            const reduxStore = createStore(
                (state, action: { type: string, value: StateValueAtRoot, path?: Path }) => {
                    if (!fromLocal) {
                        const isValidPath = (p: Path) => Array.isArray(p) &&
                            p.findIndex(l => typeof l !== 'string' && typeof l !== 'number') === -1;
                        if (action.type.startsWith('SET')) {
                            const setState = (l: StateLink<StateValueAtPath>) => {
                                try {
                                    fromRemote = true;
                                    if ('value' in action) {
                                        l.set(action.value)
                                    } else {
                                        l.set(None)
                                    }
                                } finally {
                                    fromRemote = false;
                                }
                            }
                            // replay from development tools
                            if (action.path) {
                                if (isValidPath(action.path)) {
                                    if (action.path.length === 0) {
                                        setState(lnk)
                                    }
                                    let l = lnk;
                                    let valid = true;
                                    for (let p of action.path) {
                                        if (l.nested) {
                                            l = l.nested[p];
                                        } else {
                                            valid = false;
                                        }
                                    }
                                    if (valid) {
                                        setState(l)
                                    }
                                }
                            } else {
                                setState(lnk)
                            }
                        } else if (action.type === 'RERENDER' && action.path && isValidPath(action.path)) {
                            // rerender request from development tools
                            lnk.with(PluginId)[0].update([action.path!])
                        }
                    }
                    if (lnk.promised) {
                        return None;
                    }
                    return lnk.value;
                },
                devToolsEnhancer({
                    name: `${window.location.hostname}: ${assignedId}`,
                    trace: MonitoredStates.value.callstacksDepth !== 0,
                    traceLimit: MonitoredStates.value.callstacksDepth,
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

            MonitoredStatesLogger(`CREATE [${assignedId}] (monitored)`)
            dispatch({ type: `CREATE` })
            return {
                // tslint:disable-next-line: no-any
                log: (str: string, data?: any) => {
                    dispatch({ type: `:: ${str}`, data: data })
                },
                onSet: (p) => {
                    dispatch({ ...p, type: `SET [${p.path.join('/')}]` })
                },
                onDestroy: () => {
                    MonitoredStatesLogger(`DESTROY [${assignedId}] (monitored)`)
                    dispatch({ type: `DESTROY` }, () => {
                        setTimeout(() => dispatch({ type: `RESET -> DESTROY` }))
                    })
                }
            }
        }
    } as Plugin)
}

MonitoredStates.with(DevToolsInternal)
MonitoredStatesLogger = (str) => DevTools(MonitoredStates).log(str)

DevTools.Init() // attach on load
