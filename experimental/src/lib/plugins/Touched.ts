
import { Path, Plugin, PluginTypeMarker, StateLink } from '../UseStateLink';

import { InitialExtensions } from './Initial';

export interface TouchedExtensions<S> {
    touched: boolean;
    untouched: boolean;
}

const PluginID = Symbol('Touched');

// tslint:disable-next-line: function-name
export function Touched<S, E extends InitialExtensions<S>>(
    unused: PluginTypeMarker<S, E>
): Plugin<S, E, TouchedExtensions<S>> {
    return {
        id: PluginID,
        instanceFactory: () => {
            let touchedState: object | undefined = undefined;
            const setTouched = (path: Path) => {
                touchedState = touchedState || {};
                let result = touchedState;
                if (path.length === 0) {
                    result[PluginID] = true
                }
                path.forEach((p, i) => {
                    result[p] = result[p] || {}
                    result = result[p]
                    if (i === path.length - 1) {
                        result[PluginID] = true;
                    }
                });
            }
            const getTouched = (path: Path): boolean | undefined => {
                let result = touchedState;
                let somethingVisted = false
                let somethingTouched = false
                path.forEach((p, i) => {
                    if (result) {
                        somethingVisted = true;
                        somethingTouched = result[PluginID] ? true : somethingTouched;
                        result = result[p];
                    }
                });
                if (result) {
                    return true;
                }
                if (!somethingVisted) {
                    return false;
                }
                if (!somethingTouched) {
                    return false;
                }
                return undefined;
            }
            // tslint:disable-next-line: no-any
            const touched = (l: StateLink<any, E>): boolean => {
                const t = getTouched(l.path);
                if (t !== undefined) {
                    return t;
                }
                return l.extended.modified;
            }
            return {
                onSet: (p) => setTouched(p),
                extensions: ['touched', 'untouched'],
                extensionsFactory: (l) => ({
                    get touched() {
                        return touched(l);
                    },
                    get untouched() {
                        return !touched(l)
                    },
                })
            }
        }
    }
}
