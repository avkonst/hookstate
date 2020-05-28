import { Plugin, State } from '@hookstate/core';
export interface LoggerExtensions {
    log(): void;
}
export declare function Logger(): Plugin;
export declare function Logger<S>($this: State<S>): LoggerExtensions;
