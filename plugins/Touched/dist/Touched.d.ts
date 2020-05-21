import { Plugin, StateLink, State } from '@hookstate/core';
export interface TouchedExtensions {
    touched(): boolean;
    untouched(): boolean;
}
export declare function Touched(): Plugin;
export declare function Touched<S>($this: StateLink<S>): TouchedExtensions;
export declare function Touched<S>($this: State<S>): TouchedExtensions;
