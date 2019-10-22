
import {
    Path,
    Downgraded,
    Plugin,
    StateLink,
    StateValueAtPath,
    StateValueAtRoot
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
    getModified = (l: StateLink<StateValueAtPath>): boolean => {
        l.with(Downgraded)
        return !isEqual(l.value, this.getInitial(l.path))
    }
}

const PluginID = Symbol('Initial');

// tslint:disable-next-line: function-name
export function Initial(): Plugin;
export function Initial<S>(self: StateLink<S>): InitialExtensions<S>;
export function Initial<S>(self?: StateLink<S>): Plugin | InitialExtensions<S> {
    if (self) {
        const [link, instance] = self.with(PluginID);
        const inst = instance as InitialPluginInstance;
        return {
            get: () => inst.getInitial(link.path),
            modified: () => inst.getModified(link),
            unmodified: () => !inst.getModified(link)
        }
    }
    return {
        id: PluginID,
        instanceFactory: (initialValue: StateValueAtRoot) => {
            return new InitialPluginInstance(initialValue) as {}
        }
    }
}
