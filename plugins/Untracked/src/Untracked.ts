
import { Plugin, StateLink, SetPartialStateAction } from '@hookstate/core';

export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    merge(mergeValue: SetPartialStateAction<S>): void;
}

const PluginID = Symbol('Untracked');
export function Untracked(): Plugin;
export function Untracked<S>(self: StateLink<S>): UntrackedExtensions<S>;
export function Untracked<S>(self?: StateLink<S>): Plugin | UntrackedExtensions<S> {
    if (self) {
        const link = self.with(PluginID)[0];
        return {
            get: () => link.getUntracked(),
            set: (v) => link.setUntracked(v),
            merge: (v) => link.mergeUntracked(v)
        }
    }
    return {
        id: PluginID,
        create: () => ({})
    }
}
