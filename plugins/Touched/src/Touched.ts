
import { Path, Plugin, PluginInstance, StateLink, Downgraded, StateValueAtPath } from '@hookstate/core';

import { Initial } from '@hookstate/initial';

export interface TouchedExtensions {
    touched(): boolean;
    untouched(): boolean;
}

const PluginID = Symbol('Touched');

class TouchedPluginInstance implements PluginInstance {
    private touchedState: object | undefined = undefined;

    onSet(p: Path) {
        this.setTouched(p)
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
    touched = (l: StateLink<StateValueAtPath>): boolean => {
        const t = this.getTouched(l.path);
        if (t !== undefined) {
            // For optimization purposes, there is nothing being used from the link value
            // as a result it is left untracked and no rerender happens for the result of this function
            // when the source value is updated.
            // We do the trick to fix it, we mark the value being 'deeply used',
            // so any changes for this value or any nested will trigger rerender.
            const _ = l.with(Downgraded).value;
            return t;
        }
        return Initial(l).modified();
    }
}

// tslint:disable-next-line: function-name
export function Touched(): Plugin;
export function Touched<S>(self: StateLink<S>): TouchedExtensions;
export function Touched<S>(self?: StateLink<S>): Plugin | TouchedExtensions {
    if (self) {
        const [link, instance] = self.with(PluginID);
        const inst = instance as TouchedPluginInstance;
        return {
            touched: () => inst.touched(link),
            untouched: () => !inst.touched(link)
        }
    }
    return {
        id: PluginID,
        instanceFactory: () => {
            return new TouchedPluginInstance();
        }
    }
}
