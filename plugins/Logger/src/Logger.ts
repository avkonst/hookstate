
import { DisabledTracking, Plugin, PluginTypeMarker, Path, StateValueAtRoot, StateValueAtPath } from '@hookstate/core';

export interface LoggerExtensions {
    log(): void;
}

const PluginID = Symbol('Logger');

// tslint:disable-next-line: function-name
export function Logger<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, LoggerExtensions> {
    const toJsonTrimmed = (s: StateValueAtPath) => {
        const limit = 100;
        const r = JSON.stringify(s);
        if (r.length > 100) {
            return `${r.slice(0, limit)}... (${r.length - limit} characters trunkated)`
        }
        return r;
    }
    return {
        id: PluginID,
        instanceFactory: () => {
            const getAtPath = (v: StateValueAtRoot, path: Path) => {
                let result = v;
                path.forEach(p => {
                    result = result[p];
                });
                return result;
            }
            return {
                onInit: () => {
                    // tslint:disable-next-line: no-console
                    console.log(`[hookstate]: logger attached`);
                },
                onSet: (p, v) => {
                    const newValue = getAtPath(v, p);
                    // tslint:disable-next-line: no-console
                    console.log(
                        `[hookstate]: new value set at path '/${p.join('/')}': ` +
                        `${toJsonTrimmed(newValue)}`,
                        {
                            path: p,
                            value: newValue
                        });
                },
                extensions: ['log'],
                extensionsFactory: (l) => ({
                    log() {
                        l.with(DisabledTracking); // everything is touched by the JSON, so no point to track
                        // tslint:disable-next-line: no-console
                        return console.log(
                            `[hookstate]: current value at path '/${l.path.join('/')}: ` +
                            `${toJsonTrimmed(l.value)}'`,
                            {
                                path: l.path,
                                value: l.value
                            });
                    }
                })
            }
        }
    }
}
