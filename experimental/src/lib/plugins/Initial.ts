
import { Path, DisabledTracking, Plugin, PluginTypeMarker, StateLink } from '../UseStateLink';

import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';

export interface InitialExtensions<S> {
    initial: S | undefined;
    modified: boolean;
    unmodified: boolean;
}

const PluginID = Symbol('Initial');

export function Initial<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<S, E, InitialExtensions<S>> {
    return {
        id: PluginID,
        // tslint:disable-next-line: no-any
        instanceFactory: (initialValue: any) => {
            // tslint:disable-next-line: no-any
            let lastCompared: any = undefined;
            let lastResult: boolean | undefined = undefined;
            // tslint:disable-next-line: no-any
            const initial: any = cloneDeep(initialValue);
            const getInitial = (path: Path) => {
                let result = initial;
                path.forEach(p => {
                    result = result && result[p];
                });
                return result;
            }
            // const touched: object = {}
            // const setTouched = (path: Path) => {
            //     let result = touched;
            //     path.forEach(p => {
            //         result[p] = result[p] || {}
            //         result = result[p]
            //     });
            // }
            // function setDeepTouched(path: Path, v: object): void {
            //     let result = touched;
            //     path.forEach(p => {
            //         result[p] = result[p] || {}
            //         result = result[p]
            //     });
            //     Object.keys(v).forEach(k => setDe)
            // }
            // const getTouched = (path: Path): object | undefined => {
            //     let result = touched;
            //     path.forEach(p => {
            //         result = result && result![p];
            //     });
            //     return result;
            // }
            // tslint:disable-next-line: no-any
            const modified = (l: StateLink<any, E>): boolean => {
                // v.with(DisabledTracking)
                // return !deepEqual(v.value, getInitial(path))
                // return !isEqual(v.value, getInitial(path))
                // JSON.stringify(v.value); // leave trace of used for everything
                // TODO deepEqualTouched is broken when entire object is set
                // return !deepEqualTouched(getTouched(path), v.value, getInitial(path))
                // return !isEqual(v.value, getInitial(path))
                l.with(DisabledTracking)
                const current = l.value;
                const path = l.path;
                if (current === lastCompared && lastCompared !== undefined) {
                    return lastResult!;
                }
                lastCompared = current;
                lastResult = !isEqual(current, getInitial(path))
                return lastResult;
            }
            return {
                onInit: () => {
                    return undefined;
                },
                onSet: (p, v) => {
                    lastCompared = undefined;
                },
                extensions: ['initial', 'modified', 'unmodified'],
                extensionsFactory: (l) => ({
                    get initial() {
                        return getInitial(l.path)
                    },
                    get modified() {
                        return modified(l);
                    },
                    get unmodified() {
                        return !modified(l)
                    },
                })
            }
        }
    }
}
