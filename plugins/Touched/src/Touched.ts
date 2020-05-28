import { Path, Plugin, Downgraded, StateValueAtPath, PluginCallbacks, PluginCallbacksOnSetArgument, State, self, StateMethods } from '@hookstate/core';

import { Initial } from '@hookstate/initial';

export interface TouchedExtensions {
    touched(): boolean;
    untouched(): boolean;
}

const PluginID = Symbol('Touched');

class TouchedPluginInstance implements PluginCallbacks {
    private touchedState: object | undefined = undefined;

    onSet(p: PluginCallbacksOnSetArgument) {
        this.setTouched(p.path)
    }

    setTouched = (path: Path) => {
        this.touchedState = this.touchedState || {};
        let result = this.touchedState;
        if (path.length === 0) {
            result[PluginID] = true
        }
        path.forEach((p, i) => {
            result[p] = result[p] || {}
            result = result[p]
            if (i === path.length - 1) {
                result[PluginID] = true;
            }
        });
    }
    getTouched = (path: Path): boolean | undefined => {
        let result = this.touchedState;
        let somethingVisted = false
        let somethingTouched = false
        path.forEach((p, i) => {
            if (result) {
                somethingVisted = true;
                somethingTouched = result[PluginID] ? true : somethingTouched;
                result = result[p];
            }
        });
        if (result) {
            return true;
        }
        if (!somethingVisted) {
            return false;
        }
        if (!somethingTouched) {
            return false;
        }
        return undefined;
    }
    touched = (l: StateMethods<StateValueAtPath>): boolean => {
        const t = this.getTouched(l.path);
        if (t !== undefined) {
            // For optimization purposes, there is nothing being used from the link value
            // as a result it is left untracked and no rerender happens for the result of this function
            // when the source value is updated.
            // We do the trick to fix it, we mark the value being 'deeply used',
            // so any changes for this value or any nested will trigger rerender.
            const _ = l.attach(Downgraded)[self].value;
            return t;
        }
        return Initial(l[self]).modified();
    }
}

// tslint:disable-next-line: function-name
export function Touched(): Plugin;
export function Touched<S>($this: State<S>): TouchedExtensions;
export function Touched<S>($this?: State<S>): Plugin | TouchedExtensions {
    if ($this) {
        const th = $this as State<S>;
        const [instance, controls] = th[self].attach(PluginID);
        if (instance instanceof Error) {
            throw instance
        }
        const inst = instance as TouchedPluginInstance;
        return {
            touched: () => inst.touched(th[self]),
            untouched: () => !inst.touched(th[self])
        }
    }
    return {
        id: PluginID,
        init: () => {
            return new TouchedPluginInstance();
        }
    }
}
