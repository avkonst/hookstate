/// <reference types="react" />
import { Plugin, StateLink } from '@hookstate/core';
export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
}
export declare function Untracked(): Plugin;
export declare function Untracked<S>(self: StateLink<S>): UntrackedExtensions<S>;
