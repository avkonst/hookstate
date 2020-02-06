
import {
    Plugin,
    Path,
    StateValueAtRoot,
    StateValueAtPath,
    PluginCallbacks,
    StateLink,
    StateLinkPlugable,
    PluginCallbacksOnSetArgument
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

    log(l: StateLink<StateValueAtPath> & StateLinkPlugable<StateValueAtPath>) {
        // tslint:disable-next-line: no-console
        return console.log(
            `[hookstate]: current value at path '/${l.path.join('/')}: ` +
            `${this.toJsonTrimmed(l.getUntracked())}'`,
            {
                path: l.path,
                value: l.getUntracked()
            });
    }
}

const PluginID = Symbol('Logger');

// tslint:disable-next-line: function-name
export function Logger(): Plugin;
export function Logger<S>(self: StateLink<S>): LoggerExtensions;
export function Logger<S>(self?: StateLink<S>): Plugin | LoggerExtensions {
    if (self) {
        const [link, instance] = self.with(PluginID);
        const inst = instance as LoggerPluginInstance;
        return {
            log: () => inst.log(link)
        }
    }
    return {
        id: PluginID,
        create: () => {
            // tslint:disable-next-line: no-console
            console.log(`[hookstate]: logger attached`);
            return new LoggerPluginInstance();
        }
    }
}
