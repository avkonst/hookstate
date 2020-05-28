/// <reference types="react" />
import { Plugin, SetPartialStateAction, State } from '@hookstate/core';
export interface UntrackedExtensions<S> {
    get(): S;
    set(newValue: React.SetStateAction<S>): void;
    merge(mergeValue: SetPartialStateAction<S>): void;
}
export declare function Untracked(): Plugin;
export declare function Untracked<S>($this: State<S>): UntrackedExtensions<S>;
