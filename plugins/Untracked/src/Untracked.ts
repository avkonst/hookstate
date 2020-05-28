
import { Plugin, SetPartialStateAction, State, self } from '@hookstate/core';

export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    merge(mergeValue: SetPartialStateAction<S>): void;
}

const PluginID = Symbol('Untracked');
export function Untracked(): Plugin;
export function Untracked<S>($this: State<S>): UntrackedExtensions<S>;
export function Untracked<S>($this?: State<S>): Plugin | UntrackedExtensions<S> {
    if ($this) {
        const th = $this as State<S>;
        const [_, controls] = th[self].attach(PluginID);
        return {
            get: () => controls.getUntracked(),
            set: (v) => controls.setUntracked(v),
            merge: (v) => controls.mergeUntracked(v)
        }            
    }
    return {
        id: PluginID,
        init: () => ({})
    }
}
