
import { Path, Plugin, PluginTypeMarker, StateLink, DisabledTracking, StateValueAtPath } from '@hookstate/core';

import { InitialExtensions } from '@hookstate/initial';

export interface TouchedExtensions {
    readonly touched: boolean;
    readonly untouched: boolean;
}

const PluginID = Symbol('Touched');

// tslint:disable-next-line: function-name
export function Touched<S, E extends InitialExtensions>(
    unused: PluginTypeMarker<S, E>
): Plugin<E, TouchedExtensions> {
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
            const touched = (l: StateLink<StateValueAtPath, E>): boolean => {
                const t = getTouched(l.path);
                if (t !== undefined) {
                    // For optimization purposes, there is nothing being used from the link value
                    // as a result it is left untracked and no rerender happens for the result of this function
                    // when the source value is updated.
                    // We do the trick to fix it, we mark the value being 'deeply used',
                    // so any changes for this value or any nested will trigger rerender.
                    const _ = l.with(DisabledTracking).value;
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
