
import { Plugin, StateLink } from '@hookstate/core';

export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
}

const PluginID = Symbol('Untracked');
export function Untracked(): Plugin;
export function Untracked<S>(self: StateLink<S>): UntrackedExtensions<S>;
export function Untracked<S>(self?: StateLink<S>): Plugin | UntrackedExtensions<S> {
    if (self) {
        const link = self.with(PluginID)[0];
        return {
            get: () => link.getUntracked(),
            set: (v) => link.setUntracked(v)
        }
    }
    return {
        id: PluginID,
        instanceFactory: () => ({})
    }
}
