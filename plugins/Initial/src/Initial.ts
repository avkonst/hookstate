
import {
    Path,
    Downgraded,
    Plugin,
    StateValueAtPath,
    StateValueAtRoot,
    State,
    self,
    StateMethods
} from '@hookstate/core';

import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';

export interface InitialExtensions<S> {
    get(): S | undefined;
    modified(): boolean;
    unmodified(): boolean;
}

class InitialPluginInstance {
    private initialState: StateValueAtRoot;
    constructor(initialValue: StateValueAtRoot) {
        this.initialState = cloneDeep(initialValue);
    }
    getInitial = (path: Path) => {
        let result = this.initialState;
        path.forEach(p => {
            result = result && result[p];
        });
        return result;
    }
    getModified = (l: StateMethods<StateValueAtPath>): boolean => {
        l.attach(Downgraded)
        return !isEqual(l.value, this.getInitial(l.path))
    }
}

const PluginID = Symbol('Initial');

// tslint:disable-next-line: function-name
export function Initial(): Plugin;
export function Initial<S>($this: State<S>): InitialExtensions<S>;
export function Initial<S>($this?: State<S>): Plugin | InitialExtensions<S> {
    if ($this) {
        const $th = $this as State<S>
        const [instance] = $th[self].attach(PluginID);
        if (instance instanceof Error) {
            throw instance;
        }
        const inst = instance as InitialPluginInstance;
        return {
            get: () => inst.getInitial($th[self].path),
            modified: () => inst.getModified($th[self]),
            unmodified: () => !inst.getModified($th[self])
        }
    }
    return {
        id: PluginID,
        init: (state: State<StateValueAtRoot>) => {
            return new InitialPluginInstance(state[self].value) as {}
        }
    }
}
