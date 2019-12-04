/// <reference types="react" />
import { Plugin, StateLink, StateLinkPlugable, Path, SetStateAction, StateValueAtPath, SetPartialStateAction, PluginInstance, NestedInferredLink } from './Declarations';
import { Subscribable, Subscriber } from './SharedImpl';
import { State } from './StateImpl';
export declare class StateLinkImpl<S> implements StateLink<S>, StateLinkPlugable<S>, Subscribable, Subscriber {
    readonly state: State;
    readonly path: Path;
    onUpdateUsed: (() => void);
    valueSource: S;
    valueEdition: number;
    disabledTracking: boolean | undefined;
    private subscribers;
    private nestedLinksCache;
    constructor(state: State, path: Path, onUpdateUsed: (() => void), valueSource: S, valueEdition: number);
    getUntracked(allowPromised?: boolean): S;
    get(allowPromised?: boolean): S;
    readonly value: S;
    readonly promised: boolean;
    readonly error: any;
    setUntracked(newValue: SetStateAction<S>, mergeValue?: Partial<StateValueAtPath>): Path;
    set(newValue: React.SetStateAction<S>): void;
    mergeUntracked(sourceValue: SetPartialStateAction<S>): readonly (string | number)[] | (string | number)[][];
    merge(sourceValue: SetPartialStateAction<S>): void;
    update(path: Path | Path[]): void;
    with(plugin: () => Plugin): StateLink<S>;
    with(pluginId: symbol): [StateLink<S> & StateLinkPlugable<S>, PluginInstance];
    subscribe(l: Subscriber): void;
    unsubscribe(l: Subscriber): void;
    onSet(path: Path, actions: (() => void)[]): void;
    private updateIfUsed;
    readonly nested: NestedInferredLink<S>;
    private nestedArrayImpl;
    private valueArrayImpl;
    private nestedObjectImpl;
    private valueObjectImpl;
    private proxyWrap;
}
