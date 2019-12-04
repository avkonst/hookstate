import { StateValueAtPath, Path, StateValueAtRoot, PluginInstance, None, Plugin, ErrorValueAtPath } from '../Declarations';
import { RootPath, Subscribable, Subscriber, NoActionUnmounted } from './SharedImpl';
import { StateLinkInvalidUsageError, PluginUnknownError, PluginInvalidRegistrationError } from './Exceptions';
import { useStateLinkUnmounted } from '../UseStateLink';
import { StateRefImpl } from './StateRefImpl';
import { StateLinkImpl } from './StateLinkImpl';
import { Downgraded } from '../Downgraded';

type PresetCallback = (path: Path, prevState: StateValueAtRoot,
    newValue: StateValueAtPath, prevValue: StateValueAtPath,
    mergeValue: StateValueAtPath | undefined) => void | StateValueAtRoot;
type SetCallback = (path: Path, newState: StateValueAtRoot,
    newValue: StateValueAtPath, prevValue: StateValueAtPath,
    mergeValue: StateValueAtPath | undefined) => void;
type DestroyCallback = (state: StateValueAtRoot) => void;

const DestroyedEdition = -1

export class State implements Subscribable {
    private _edition: number = 0;

    private _subscribers: Set<Subscriber> = new Set();
    private _presetSubscribers: Set<PresetCallback> = new Set();
    private _setSubscribers: Set<SetCallback> = new Set();
    private _destroySubscribers: Set<DestroyCallback> = new Set();

    private _plugins: Map<symbol, PluginInstance> = new Map();

    private _promised: Promised | undefined;

    constructor(private _value: StateValueAtRoot) {
        if (typeof _value === 'object' &&
            Promise.resolve(_value) === _value) {
            this._promised = this.createPromised(_value)
            this._value = None
        } else if (_value === None) {
            this._promised = this.createPromised(new Promise(() => { /* */ }))
        }
    }

    createPromised(newValue: StateValueAtPath) {
        const promised = new Promised(
            Promise.resolve(newValue),
            (r: StateValueAtPath) => {
                if (this.promised === promised && this.edition !== DestroyedEdition) {
                    this.set(RootPath, r, undefined)
                    this.update(RootPath)
                }
            },
            () => {
                if (this.promised === promised && this.edition !== DestroyedEdition) {
                    this._edition += 1
                    this.update(RootPath)
                }
            }
        );
        return promised;
    }

    get edition() {
        return this._edition;
    }

    get promised() {
        return this._promised;
    }

    get(path: Path) {
        let result = this._value;
        if (result === None) {
            return result;
        }
        path.forEach(p => {
            result = result[p];
        });
        return result;
    }

    set(path: Path, value: StateValueAtPath, mergeValue: Partial<StateValueAtPath> | undefined): Path {
        if (this._edition < 0) {
            // TODO convert to warning
            throw new StateLinkInvalidUsageError(
                `set state for the destroyed state`,
                path,
                'make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. ' +
                'Global state is explicitly destroyed at \'StateRef.destroy()\'. ' +
                'Local state is automatically destroyed when a component is unmounted.')
        }

        if (path.length === 0) {
            // Root value UPDATE case,

            if (value === None) {
                // never ending promise, unless it is displaced by antoher set later on
                this._promised = this.createPromised(new Promise(() => { /* */ }))
            } else if (typeof value === 'object' && Promise.resolve(value) === value) {
                this._promised = this.createPromised(value)
                value = None
            } else {
                this._promised = undefined
            }

            let prevValue = this._value;
            this.beforeSet(path, value, prevValue, mergeValue)
            this._value = value;
            this.afterSet(path, value, prevValue, mergeValue)

            return path;
        }

        if (typeof value === 'object' && Promise.resolve(value) === value) {
            throw new StateLinkInvalidUsageError(
                // TODO add hint
                'set promise for nested property', path, ''
            )
        }

        let target = this._value;
        for (let i = 0; i < path.length - 1; i += 1) {
            target = target[path[i]];
        }

        const p = path[path.length - 1]
        if (p in target) {
            if (value !== None) {
                // Property UPDATE case
                let prevValue = target[p]
                this.beforeSet(path, value, prevValue, mergeValue)
                target[p] = value;
                this.afterSet(path, value, prevValue, mergeValue)

                return path;
            } else {
                // Property DELETE case
                let prevValue = target[p]
                this.beforeSet(path, value, prevValue, mergeValue)
                if (Array.isArray(target) && typeof p === 'number') {
                    target.splice(p, 1)
                } else {
                    delete target[p]
                }
                this.afterSet(path, value, prevValue, mergeValue)

                // if an array of object is about to loose existing property
                // we consider it is the whole object is changed
                // which is identified by upper path
                return path.slice(0, -1)
            }
        }

        if (value !== None) {
            // Property INSERT case
            this.beforeSet(path, value, None, mergeValue)
            target[p] = value;
            this.afterSet(path, value, None, mergeValue)

            // if an array of object is about to be extended by new property
            // we consider it is the whole object is changed
            // which is identified by upper path
            return path.slice(0, -1)
        }

        // Non-existing property DELETE case
        // no-op
        return path;
    }

    update(path: Path) {
        const actions: (() => void)[] = [];
        this._subscribers.forEach(s => s.onSet(path, actions));
        actions.forEach(a => a());
    }

    updateBatch(paths: Path[]) {
        const actions: (() => void)[] = [];
        paths.forEach(path => {
            this._subscribers.forEach(s => s.onSet(path, actions));
        })
        actions.forEach(a => a());
    }

    beforeSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath,
        mergeValue: StateValueAtPath | undefined) {
        if (this._edition !== DestroyedEdition) {
            this._presetSubscribers.forEach(cb => {
                const presetResult = cb(path, this._value, value, prevValue, mergeValue)
                if (presetResult !== undefined) {
                    // plugin overrides the current value
                    // could be used for immutable later on
                    this._value = presetResult
                }
            })
        }
    }

    afterSet(path: Path, value: StateValueAtPath, prevValue: StateValueAtPath,
        mergeValue: StateValueAtPath | undefined) {
        if (this._edition !== DestroyedEdition) {
            this._edition += 1;
            this._setSubscribers.forEach(cb => cb(path, this._value, value, prevValue, mergeValue))
        }
    }

    getPlugin(pluginId: symbol) {
        const existingInstance = this._plugins.get(pluginId)
        if (existingInstance) {
            return existingInstance;
        }
        throw new PluginUnknownError(pluginId)
    }

    register(plugin: Plugin, path?: Path | undefined) {
        const existingInstance = this._plugins.get(plugin.id)
        if (existingInstance) {
            return;
        }
        const pluginInstance = plugin.instanceFactory(
            this._value,
            () => new StateLinkImpl(
                this,
                RootPath,
                NoActionUnmounted,
                this.get(RootPath),
                this.edition
            ).with(Downgraded)
        );
        this._plugins.set(plugin.id, pluginInstance);
        if (pluginInstance.onInit) {
            const initValue = pluginInstance.onInit()
            if (initValue !== undefined) {
                if (path) {
                    throw new PluginInvalidRegistrationError(plugin.id, path);
                }
                this._value = initValue;
            }
        }
        if (pluginInstance.onPreset) {
            this._presetSubscribers.add((p, s, v, pv, mv) => pluginInstance.onPreset!(p, s, v, pv, mv))
        }
        if (pluginInstance.onSet) {
            this._setSubscribers.add((p, s, v, pv, mv) => pluginInstance.onSet!(p, s, v, pv, mv))
        }
        if (pluginInstance.onDestroy) {
            this._destroySubscribers.add((s) => pluginInstance.onDestroy!(s))
        }
        return;
    }

    subscribe(l: Subscriber) {
        this._subscribers.add(l);
    }

    unsubscribe(l: Subscriber) {
        this._subscribers.delete(l);
    }

    destroy() {
        this._destroySubscribers.forEach(cb => cb(this._value))
        this._edition = DestroyedEdition
    }

    toJSON() {
        throw new StateLinkInvalidUsageError('toJSON()', RootPath,
        'did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?');
    }
}

class Promised {
    public fullfilled?: true;
    public error?: ErrorValueAtPath;
    public value?: StateValueAtPath;

    constructor(public promise: Promise<StateValueAtPath> | undefined,
        onResolve: (r: StateValueAtPath) => void,
        onReject: () => void) {
        if (promise) {
            promise
            .then(r => {
                this.fullfilled = true
                this.value = r
                onResolve(r)
            })
            .catch(err => {
                this.fullfilled = true
                this.error = err
                onReject()
            })
        }
    }
}
