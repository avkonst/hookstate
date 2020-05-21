
import { Plugin, StateLink, SetPartialStateAction, State, StateMarkerID, self } from '@hookstate/core';

export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    merge(mergeValue: SetPartialStateAction<S>): void;
}

const PluginID = Symbol('Untracked');
export function Untracked(): Plugin;
export function Untracked<S>($this: StateLink<S>): UntrackedExtensions<S>;
export function Untracked<S>($this: State<S>): UntrackedExtensions<S>;
export function Untracked<S>($this?: State<S> | StateLink<S>): Plugin | UntrackedExtensions<S> {
    if ($this) {
        if ($this[StateMarkerID]) {
            const th = $this as State<S>;
            const [_, controls] = th[self].attach(PluginID);
            return {
                get: () => controls.getUntracked(),
                set: (v) => controls.setUntracked(v),
                merge: (v) => controls.mergeUntracked(v)
            }
            
        } else {
            const link = ($this as StateLink<S>).with(PluginID)[0];
            return {
                get: () => link.getUntracked(),
                set: (v) => link.setUntracked(v),
                merge: (v) => link.mergeUntracked(v)
            }
        }
    }
    return {
        id: PluginID,
        create: () => ({})
    }
}
