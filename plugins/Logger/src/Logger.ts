
import {
    DisabledTracking,
    Plugin,
    Path,
    StateValueAtRoot,
    StateValueAtPath,
    PluginInstance,
    StateLink
} from '@hookstate/core';

export interface LoggerExtensions {
    log(): void;
}

class LoggerPluginInstance implements PluginInstance {
    toJsonTrimmed(s: StateValueAtPath) {
        const limit = 100;
        const r = JSON.stringify(s);
        if (r.length > 100) {
            return `${r.slice(0, limit)}... (${r.length - limit} characters trunkated)`
        }
        return r;
    }

    getAtPath(v: StateValueAtRoot, path: Path) {
        let result = v;
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    onInit() {
        // tslint:disable-next-line: no-console
        console.log(`[hookstate]: logger attached`);
    }
    onSet(p: Path, v: StateValueAtRoot) {
        const newValue = this.getAtPath(v, p);
        // tslint:disable-next-line: no-console
        console.log(
            `[hookstate]: new value set at path '/${p.join('/')}': ` +
            `${this.toJsonTrimmed(newValue)}`,
            {
                path: p,
                value: newValue
            });
    }

    log(l: StateValueAtPath) {
        l.with(DisabledTracking); // everything is touched by the JSON, so no point to track
        // tslint:disable-next-line: no-console
        return console.log(
            `[hookstate]: current value at path '/${l.path.join('/')}: ` +
            `${this.toJsonTrimmed(l.value)}'`,
            {
                path: l.path,
                value: l.value
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
        instanceFactory: () => {
            return new LoggerPluginInstance();
        }
    }
}
