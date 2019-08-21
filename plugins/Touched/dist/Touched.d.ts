import { Plugin, StateLink } from '@hookstate/core';
export interface TouchedExtensions {
    readonly touched: () => boolean;
    readonly untouched: () => boolean;
}
export declare function Touched(): Plugin;
export declare function Touched<S>(self: StateLink<S>): TouchedExtensions;
