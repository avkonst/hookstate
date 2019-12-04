import { Plugin, StateRef, StateLink, StateInf } from './Declarations'
import { SynteticID, DowngradedID } from './SharedImpl';
import { State } from './StateImpl';
import { StateInfImpl } from './StateInfImpl';

export class StateRefImpl<S> implements StateRef<S> {
    // tslint:disable-next-line: variable-name
    public __synteticTypeInferenceMarkerRef = SynteticID;
    public disabledTracking: boolean | undefined;

    constructor(public state: State) { }

    with(plugin: () => Plugin): StateRef<S> {
        const pluginMeta = plugin()
        if (pluginMeta.id === DowngradedID) {
            this.disabledTracking = true;
            return this;
        }
        this.state.register(pluginMeta);
        return this;
    }

    wrap<R>(transform: (state: StateLink<S>, prev: R | undefined) => R): StateInf<R> {
        return new StateInfImpl(this, transform)
    }

    destroy() {
        this.state.destroy()
    }
}
