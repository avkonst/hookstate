import { StateLink } from '@hookstate/core';
export interface DevToolsExtensions {
    log(str: string, data?: any): void;
}
export declare const DevTools: {
    (state: StateLink<any>): DevToolsExtensions;
    Init(): void;
};
