import { StateValueAtPath, Path, StateValueAtRoot, PluginInstance, Plugin, ErrorValueAtPath } from './Declarations';
import { Subscribable, Subscriber } from './SharedImpl';
export declare class State implements Subscribable {
    private _value;
    private _edition;
    private _subscribers;
    private _presetSubscribers;
    private _setSubscribers;
    private _destroySubscribers;
    private _plugins;
    private _promised;
    constructor(_value: StateValueAtRoot);
    createPromised(newValue: StateValueAtPath): Promised;
    readonly edition: number;
    readonly promised: Promised | undefined;
    get(path: Path): any;
    set(path: Path, value: StateValueAtPath, mergeValue: Partial<StateValueAtPath> | undefined): Path;
    update(path: Path): void;
    updateBatch(paths: Path[]): void;
    beforeSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined): void;
    afterSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath, mergeValue: StateValueAtPath | undefined): void;
    getPlugin(pluginId: symbol): PluginInstance;
    register(plugin: Plugin, path?: Path | undefined): void;
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
    destroy(): void;
    toJSON(): void;
}
declare class Promised {
    promise: Promise<StateValueAtPath> | undefined;
    fullfilled?: true;
    error?: ErrorValueAtPath;
    value?: StateValueAtPath;
    constructor(promise: Promise<StateValueAtPath> | undefined, onResolve: (r: StateValueAtPath) => void, onReject: () => void);
}
export {};
