import {
    createState,
    useState,
    StateValueAtRoot,
    StateValueAtPath,
    State,
    none,
    Path,
    Plugin,
    PluginCallbacks,
    PluginCallbacksOnSetArgument,
    DevTools,
    DevToolsID,
    DevToolsExtensions,
    self
} from '@hookstate/core'

import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

export interface Settings {
    monitored: string[],
    callstacksDepth: number
}

let SettingsState: State<Settings>;

export function DevToolsInitialize(settings: Settings) {
    // make sure it is used, otherwise it is stripped out by the compiler
    DevToolsInitializeInternal()
    SettingsState[self].set(settings)
}

function DevToolsInitializeInternal() {
    if (// already initialized
        SettingsState ||
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
    SettingsState = createState(() => {
            // localStorage is not available under react native
            const p = typeof window !== 'undefined' && window.localStorage &&
                // read persisted if we can
                window.localStorage.getItem(MonitoredStatesLabel)
            if (!p) {
                return {
                    monitored: [MonitoredStatesLabel],
                    callstacksDepth: IsDevelopment ? 30 : 0
                }
            }
            return JSON.parse(p) as Settings
        })[self].attach(() => ({
            id: PluginIdPersistedSettings,
            init: () => ({
                onSet: p => {
                    let v = p.state;
                    // verify what is coming, because it can be anything from devtools
                    if (!v || !v.monitored || !Array.isArray(v.monitored)) {
                        v = v || {}
                        v.monitored = [MonitoredStatesLabel]
                    } else if (!v.monitored.includes(MonitoredStatesLabel)) {
                        v.monitored.push(MonitoredStatesLabel)
                    }
                    const depth = Number(v.callstacksDepth);
                    v.callstacksDepth = Number.isInteger(depth) && depth >= 0 ? depth : IsDevelopment ? 30 : 0;
                    if (typeof window !== 'undefined' && window.localStorage) {
                        // persist if we can
                        window.localStorage.setItem(MonitoredStatesLabel, JSON.stringify(v))
                    }
                    if (v !== p.state) {
                        SettingsState[self].set(v)
                    }
                }
            })
        }));
    
    let lastUnlabelledId = 0;
    function getLabel(isGlobal?: boolean) {
        function defaultLabel() {
            return `${isGlobal ? 'global' : 'local'}-state-${lastUnlabelledId += 1}`
        }

        if (!IsDevelopment) {
            // if not a development, names are minified,
            // so return more readable default labels
            return defaultLabel()
        }
        
        let dummyError: { stack?: string } = {}
        if ('stackTraceLimit' in Error && 'captureStackTrace' in Error) {
            const oldLimit = Error.stackTraceLimit
            Error.stackTraceLimit = 6;
            Error.captureStackTrace(dummyError, SettingsState[self].attach)
            Error.stackTraceLimit = oldLimit;
        }
        const s = dummyError.stack;
        if (!s) {
            return defaultLabel()
        }
        const parts = s.split('\n');
        if (parts.length < 3) {
            return defaultLabel()
        }
        return parts[2]
            .replace(/\s*[(].*/, '')
            .replace(/\s*at\s*/, '')
    }
    
    function createReduxDevToolsLogger(
        lnk: State<StateValueAtRoot>, assignedId: string, onBreakpoint: () => void) {
        let fromRemote = false;
        let fromLocal = false;
        const reduxStore = createStore(
            (_, action: { type: string, value: StateValueAtRoot, path?: Path }) => {
                if (!fromLocal) {
                    const isValidPath = (p: Path) => Array.isArray(p) &&
                        p.findIndex(l => typeof l !== 'string' && typeof l !== 'number') === -1;
                    if (action.type.startsWith('SET')) {
                        const setState = (l: State<StateValueAtPath>) => {
                            try {
                                fromRemote = true;
                                if ('value' in action) {
                                    l[self].set(action.value)
                                } else {
                                    l[self].set(none)
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
                                    if (l[p]) {
                                        l = l[p];
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
                        lnk[self].attach(DevToolsID)[1].rerender([action.path!])
                    } else if (action.type === 'BREAKPOINT') {
                        onBreakpoint()
                    }
                }
                return lnk[self].map(l => l[self].value, () => none)
            },
            devToolsEnhancer({
                name: `${window.location.hostname}: ${assignedId}`,
                trace: SettingsState[self].value.callstacksDepth !== 0,
                traceLimit: SettingsState[self].value.callstacksDepth,
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
        return SettingsState[self].value.monitored.includes(assignedId) || globalOrLabeled
    }
    
    function DevToolsInternal(isGlobal?: boolean): Plugin {
        return ({
            id: DevToolsID,
            init: (lnk) => {
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
                            lnk[self].attach(() => ({
                                id: PluginIdMonitored,
                                init: () => ({
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
    
    SettingsState[self].attach(DevToolsInternal)
    DevTools(SettingsState).label(MonitoredStatesLabel)
    MonitoredStatesLogger = (str) => DevTools(SettingsState).log(str)
    
    useState[DevToolsID] = DevToolsInternal
    createState[DevToolsID] = () => DevToolsInternal(true)
};
DevToolsInitializeInternal() // attach on load
