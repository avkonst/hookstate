import {
    Path,
    Downgraded,
    Plugin,
    StateValueAtPath,
    StateValueAtRoot,
    State,
    StateMethods
} from '@hookstate/core';

import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';

export interface InitialExtensions<S> {
    get(): S | undefined;
    modified(): boolean;
    unmodified(): boolean;
    set(s: State<S>): void;
    revert(): void;
}

class InitialPluginInstance {
    private initialState: StateValueAtRoot;
    constructor(initialValue: StateValueAtRoot) {
        this.initialState = cloneDeep(initialValue);
    }
    getInitial = (path: Path) => {
        let result = this.initialState;
        path.forEach((p) => {
            result = result && result[p];
        });
        return result;
    };
    getModified = (l: StateMethods<StateValueAtPath>): boolean => {
        l.attach(Downgraded);
        return !isEqual(l.value, this.getInitial(l.path));
    };
    set = (path: Path, s: StateValueAtPath) => {
        let result = this.initialState;
        if (path.length > 0) {
            for (let i = 0; i < path.length - 1; i++) {
                result = result && result[path[i]];
            }
            result[path[path.length - 1]] = cloneDeep(s);
        } else {
            this.initialState = cloneDeep(s);
        }
    };
    revert = (v: StateValueAtRoot) => {
        let result = this.initialState;
        v.path.forEach((p: string) => {
            result = result && result[p];
        });
        v.set(() => result);
    };
}

const PluginID = Symbol('Initial');

// tslint:disable-next-line: function-name
export function Initial(): Plugin;
export function Initial<S>($this: State<S>): InitialExtensions<S>;
export function Initial<S>($this?: State<S>): Plugin | InitialExtensions<S> {
    if ($this) {
        const $th = $this as State<S>;
        const [instance] = $th.attach(PluginID);
        if (instance instanceof Error) {
            throw instance;
        }
        const inst = instance as InitialPluginInstance;
        return {
            get: () => inst.getInitial($th.path),
            modified: () => inst.getModified($th),
            unmodified: () => !inst.getModified($th),
            set: (s: S) => inst.set($th, s),
            revert: () => inst.revert($th)
        };
    }
    return {
        id: PluginID,
        init: (state: State<StateValueAtRoot>) => {
            return new InitialPluginInstance(state.value) as {};
        }
    };
}
