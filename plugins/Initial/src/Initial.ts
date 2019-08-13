
import {
    Path,
    DisabledTracking,
    Plugin,
    PluginTypeMarker,
    StateLink,
    StateValueAtPath,
    StateValueAtRoot
} from 'react-hookstate';

import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';

export interface InitialExtensions {
    // unfortunately, there is no way in typescript to
    // express generic type parameter, which would change
    // on the result of nested statelink call
    readonly initial: StateValueAtPath | undefined;
    readonly modified: boolean;
    readonly unmodified: boolean;
}

const PluginID = Symbol('Initial');

// tslint:disable-next-line: function-name
export function Initial<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, InitialExtensions> {
    return {
        id: PluginID,
        instanceFactory: (initialValue: StateValueAtRoot) => {
            const initialState: StateValueAtRoot = cloneDeep(initialValue);
            const getInitial = (path: Path) => {
                let result = initialState;
                path.forEach(p => {
                    result = result && result[p];
                });
                return result;
            }
            const modified = (l: StateLink<StateValueAtPath, E>): boolean => {
                l.with(DisabledTracking)
                return !isEqual(l.value, getInitial(l.path))
            }
            return {
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
