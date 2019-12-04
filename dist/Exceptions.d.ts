import { Path } from './Declarations';
export declare class StateLinkInvalidUsageError extends Error {
    constructor(op: string, path: Path, hint?: string);
}
export declare class PluginInvalidRegistrationError extends Error {
    constructor(id: symbol, path: Path);
}
export declare class PluginUnknownError extends Error {
    constructor(s: symbol);
}
