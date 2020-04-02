import {
    createStateLink,
    useStateLink,
    StateValueAtRoot,
    StateValueAtPath,
    StateLink,
    None,
    Path,
    Plugin,
    PluginCallbacks,
    PluginCallbacksOnSetArgument,
    DevTools,
    DevToolsID,
    DevToolsExtensions,
} from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

let MonitoredStates: StateLink<{ monitored: string[], callstacksDepth: number }>;

export function DevToolsInit() {
    if (// already initialized
        MonitoredStates ||
        // server-side rendering
        typeof window === 'undefined' ||
        // development tools monitor is not open
        !('__REDUX_DEVTOOLS_EXTENSION__' in window)) {
        return;
    }
    
    const IsDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const PluginIdMonitored = Symbol('DevToolsMonitored')
    const PluginIdPersistedSettings = Symbol('PersistedSettings')
    
    let MonitoredStatesLogger = (_: string) => { /* */ };
    const MonitoredStatesLabel = '@hookstate/devtools: settings';
    MonitoredStates = createStateLink(() => {
            const p = localStorage.getItem(MonitoredStatesLabel)
            if (!p) {
                return {
                    monitored: [MonitoredStatesLabel],
                    callstacksDepth: IsDevelopment ? 30 : 0
                }
            }
            return JSON.parse(p)
        })
        .with(() => ({
            id: PluginIdPersistedSettings,
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
        }));
    
    let lastUnlabelledId = 0;
    function getLabel(isGlobal?: boolean) {
        if (!IsDevelopment) {
            return `${isGlobal ? 'global' : 'local'}-state-${lastUnlabelledId += 1}`
        }
        
        let dummyError: { stack?: string } = {}
        if ('stackTraceLimit' in Error && 'captureStackTrace' in Error) {
            const oldLimit = Error.stackTraceLimit
            Error.stackTraceLimit = 2;
            Error.captureStackTrace(dummyError, MonitoredStates.with)
            Error.stackTraceLimit = oldLimit;
        }
        const s = dummyError.stack;
        if (!s) {
            return `${isGlobal ? 'global' : 'local'}-state-${lastUnlabelledId += 1}`
        }
        const parts = s.split('\n', 3);
        if (parts.length < 3) {
            return `${isGlobal ? 'global' : 'local'}-state-${lastUnlabelledId += 1}`
        }
        return parts[2]
            .replace(/\s*[(].*/, '')
            .replace(/\s*at\s*/, '')
    }
    
    function createReduxDevToolsLogger(
        lnk: StateLink<StateValueAtRoot>, assignedId: string, onBreakpoint: () => void) {
        let fromRemote = false;
        let fromLocal = false;
        const reduxStore = createStore(
            (_, action: { type: string, value: StateValueAtRoot, path?: Path }) => {
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
                        lnk.with(DevToolsID)[0].update([action.path!])
                    } else if (action.type === 'BREAKPOINT') {
                        onBreakpoint()
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
        return dispatch;
    }
    
    function isMonitored(assignedId: string, globalOrLabeled?: boolean) {
        return MonitoredStates.value.monitored.includes(assignedId) || (IsDevelopment && globalOrLabeled)
    }
    
    function DevToolsInternal(isGlobal?: boolean): Plugin {
        return ({
            id: DevToolsID,
            create: (lnk) => {
                let assignedName = getLabel(isGlobal);
                let submitToMonitor: ReturnType<typeof createReduxDevToolsLogger> | undefined;
                let breakpoint = false;
                if (isMonitored(assignedName, isGlobal)) {
                    submitToMonitor = createReduxDevToolsLogger(lnk, assignedName, () => {
                        breakpoint = !breakpoint;
                    });
                    MonitoredStatesLogger(`CREATE '${assignedName}' (monitored)`)
                } else {
                    MonitoredStatesLogger(`CREATE '${assignedName}' (unmonitored)`)
                }
    
                return {
                    // tslint:disable-next-line: no-any
                    log(str: string, data?: any) {
                        if (submitToMonitor) {
                            submitToMonitor({ type: `:: ${str}`, data: data })
                        }
                    },
                    label(name: string) {
                        if (submitToMonitor) {
                            // already monitored under the initial name
                            return;
                        }
                        if (isMonitored(name, true)) {
                            MonitoredStatesLogger(`RENAME '${assignedName}' => '${name}' (unmonitored => monitored)`)
                            submitToMonitor = createReduxDevToolsLogger(lnk, name, () => {
                                breakpoint = !breakpoint;
                            });
                            // inject on set listener
                            lnk.with(() => ({
                                id: PluginIdMonitored,
                                create: () => ({
                                    onSet: (p: PluginCallbacksOnSetArgument) => {
                                        submitToMonitor!({ ...p, type: `SET [${p.path.join('/')}]` })
                                        if (breakpoint) {
                                            // tslint:disable-next-line: no-debugger
                                            debugger;
                                        }
                                    }
                                })
                            }))
                        } else {
                            MonitoredStatesLogger(`RENAME '${assignedName}' => '${name}' (unmonitored => unmonitored)`)
                        }
                        assignedName = name;
                    },
                    onSet: submitToMonitor && ((p: PluginCallbacksOnSetArgument) => {
                        submitToMonitor!({ ...p, type: `SET [${p.path.join('/')}]` })
                        if (breakpoint) {
                            // tslint:disable-next-line: no-debugger
                            debugger;
                        }
                    }),
                    onDestroy() {
                        if (submitToMonitor) {
                            MonitoredStatesLogger(`DESTROY '${assignedName}' (monitored)`)
                            submitToMonitor({ type: `DESTROY` }, () => {
                                setTimeout(() => submitToMonitor!({ type: `RESET -> DESTROY` }))
                            })
                        } else {
                            MonitoredStatesLogger(`DESTROY '${assignedName}' (unmonitored)`)
                        }
                    }
                } as PluginCallbacks & DevToolsExtensions;
            }
        } as Plugin)
    }
    
    MonitoredStates.with(DevToolsInternal)
    DevTools(MonitoredStates).label(MonitoredStatesLabel)
    MonitoredStatesLogger = (str) => DevTools(MonitoredStates).log(str)
    
    useStateLink[DevToolsID] = DevToolsInternal
    createStateLink[DevToolsID] = () => DevToolsInternal(true)
};
DevToolsInit() // attach on load
