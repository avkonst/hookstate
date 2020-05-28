
import {
    Plugin,
    Path,
    StateValueAtPath,
    PluginCallbacks,
    PluginCallbacksOnSetArgument,
    State,
    self,
    PluginStateControl
} from '@hookstate/core';

export interface LoggerExtensions {
    log(): void;
}

class LoggerPluginInstance implements PluginCallbacks {
    toJsonTrimmed(s: StateValueAtPath) {
        const limit = 100;
        const r = JSON.stringify(s);
        if (r && r.length > 100) {
            return `${r.slice(0, limit)}... (${r.length - limit} characters trunkated)`
        }
        return r;
    }

    onSet(p: PluginCallbacksOnSetArgument) {
        // tslint:disable-next-line: no-console
        console.log(
            `[hookstate]: new value set at path '/${p.path.join('/')}': ` +
            `${this.toJsonTrimmed(p.value)}`,
            p);
    }

    log(path: Path, l: Pick<PluginStateControl<StateValueAtPath>, 'getUntracked'>) {
        // tslint:disable-next-line: no-console
        return console.log(
            `[hookstate]: current value at path '/${path.join('/')}: ` +
            `${this.toJsonTrimmed(l.getUntracked())}'`,
            {
                path: path,
                value: l.getUntracked()
            });
    }
}

const PluginID = Symbol('Logger');

// tslint:disable-next-line: function-name
export function Logger(): Plugin;
export function Logger<S>($this: State<S>): LoggerExtensions;
export function Logger<S>($this?: State<S>): Plugin | LoggerExtensions {
    if ($this) {
        const th = $this as State<S>
        let [instance, controls] = th[self].attach(PluginID);
        if (instance instanceof Error) {
            // auto attach instead of throwing
            Logger(th)
            instance = th[self].attach(PluginID)[0];
        }
        const inst = instance as LoggerPluginInstance;
        return {
            log: () => inst.log(th[self].path, controls)
        }
    }
    return {
        id: PluginID,
        init: () => {
            // tslint:disable-next-line: no-console
            console.log(`[hookstate]: logger attached`);
            return new LoggerPluginInstance();
        }
    }
}
