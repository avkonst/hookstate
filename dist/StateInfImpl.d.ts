import { StateInf, StateLink, Plugin } from './Declarations';
import { StateRefImpl } from './StateRefImpl';
export declare class StateInfImpl<S, R> implements StateInf<R> {
    readonly wrapped: StateRefImpl<S>;
    readonly transform: (state: StateLink<S>, prev: R | undefined) => R;
    __synteticTypeInferenceMarkerInf: symbol;
    constructor(wrapped: StateRefImpl<S>, transform: (state: StateLink<S>, prev: R | undefined) => R);
    with(plugin: () => Plugin): StateInf<R>;
    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2>;
    destroy(): void;
}
