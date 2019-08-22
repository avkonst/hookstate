import { Plugin, StateLink } from '@hookstate/core';
export interface TouchedExtensions {
    touched(): boolean;
    untouched(): boolean;
}
export declare function Touched(): Plugin;
export declare function Touched<S>(self: StateLink<S>): TouchedExtensions;
