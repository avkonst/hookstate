import { Plugin, StateRef, StateLink, StateInf } from './Declarations';
import { State } from './StateImpl';
export declare class StateRefImpl<S> implements StateRef<S> {
    state: State;
    __synteticTypeInferenceMarkerRef: symbol;
    disabledTracking: boolean | undefined;
    constructor(state: State);
    with(plugin: () => Plugin): StateRef<S>;
    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R>;
    destroy(): void;
}
