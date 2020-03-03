import { useStateLink, DevTools as DevToolsID, Plugin, createStateLink, StateValueAtRoot, None, Labelled, StateValueAtPath, StateLink, Path } from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

const IsDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const PluginId = Symbol('DevTools')
const PluginIdForMonitored = Symbol('DevToolsMonitored')

let MonitoredStatesLogger = (str: string) => { /* */ }; 
const MonitoredStatesLabel = '[HOOKSTATE/DEVTOOLS] MONITORED STATES';
const MonitoredStates = createStateLink(() => {
        const p = localStorage.getItem(MonitoredStatesLabel)
        if (!p) {
            return [MonitoredStatesLabel]
        }
        return JSON.parse(p)
    })
    .with(Labelled(MonitoredStatesLabel))
    .with(() => ({
        id: PluginIdForMonitored,
        create: () => ({
            onSet: p => {
                let v = p.state;
                if (!v || !Array.isArray(v)) {
                    v = [MonitoredStatesLabel]
                } else if (!v.includes(MonitoredStatesLabel)) {
                    v.push(MonitoredStatesLabel)
                }
                localStorage.setItem(MonitoredStatesLabel, JSON.stringify(v))
            }
        })
    }))

export interface DevToolsExtensions {
    // tslint:disable-next-line: no-any
    log(str: string, data?: any): void;
}

let lastUnlabelledId = 0;

export function DevTools(labelled?: string): () => Plugin;
export function DevTools(state: StateLink<StateValueAtPath>): DevToolsExtensions;
export function DevTools(labelledOrState?: string | StateLink<StateValueAtPath>): (() => Plugin) | DevToolsExtensions {
    if (labelledOrState && typeof labelledOrState !== 'string') {
        return labelledOrState.with(PluginId)[1] as DevToolsExtensions;
    }

    const labelled = labelledOrState;
    return () => ({
        id: PluginId,
        create: (lnk) => {
            const label = Labelled(lnk)
            const assignedId = labelled ? labelled : label ? label : 'unlabelled-' + (lastUnlabelledId += 1);

            const monitored = MonitoredStates.value.includes(assignedId) || (IsDevelopment && label)
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
                    trace: IsDevelopment,
                    traceLimit: 30,
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

MonitoredStates.with(DevTools())
MonitoredStatesLogger = (str) => DevTools(MonitoredStates).log(str)

let initialized = false;


export function InitDevTools() {
    if (initialized) {
        return;
    }
    initialized = true;
    useStateLink[DevToolsID] = DevTools()
    createStateLink[DevToolsID] = DevTools()
}

InitDevTools() // attach on load
