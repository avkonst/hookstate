import { StateInf, StateLink, Plugin } from './Declarations';
import { SynteticID } from './SharedImpl';
import { StateRefImpl } from './StateRefImpl';

export class StateInfImpl<S, R> implements StateInf<R> {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerInf = SynteticID;

    constructor(
        public readonly wrapped: StateRefImpl<S>,
        public readonly transform: (state: StateLink<S>, prev: R | undefined) => R,
    ) { }

    with(plugin: () => Plugin): StateInf<R> {
        this.wrapped.with(plugin);
        return this;
    }

    wrap<R2>(transform: (state: R, prev: R2 | undefined) => R2): StateInf<R2> {
        return new StateInfImpl(this.wrapped, (s, p) => {
            return transform(this.transform(s, undefined), p)
        })
    }

    destroy() {
        this.wrapped.destroy()
    }
}
