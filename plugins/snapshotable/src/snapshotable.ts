
import {
    Path,
    StateValueAtPath,
    StateValueAtRoot,
    State,
    InferStateValueType,
    hookstate,
    ExtensionFactory,
    StateExtensionUnknown
} from '@hookstate/core';

export type SnapshotMode = 'upsert' | 'insert' | 'update' | 'delete' | 'lookup';

export interface Snapshotable<K extends string = string> {
    snapshot<S extends InferStateValueType<this>>(key?: K, mode?: SnapshotMode): State<S> | undefined;
    rollback<S extends InferStateValueType<this>>(key?: K): State<S> | undefined;
    modified(key?: K): boolean;
    unmodified(key?: K): boolean;
}

export function snapshotable<K extends string = string, S = StateValueAtPath, E = StateExtensionUnknown>(options?: {
    snapshotExtensions?: (key: string) => ExtensionFactory<S, {}, {}>
}): ExtensionFactory<S, E, Snapshotable<K>> {
    return () => ({
        onCreate: (_, dependencies) => {
            const snapshots: Map<K | '___default', State<S>> = new Map();
            function getByPath(stateAtRoot: State<S>, path: Path) {
                let stateAtPath: State<StateValueAtPath> = stateAtRoot;
                for (let p of path) {
                    let v = stateAtPath.get({ stealth: true })
                    if (Object(v) !== v) {
                        return undefined
                    }
                    stateAtPath = stateAtPath.nested(p);
                };
                return stateAtPath;
            }
            function isModified(s: State<StateValueAtPath, StateExtensionUnknown>, key: K | '___default') {
                if (dependencies['compare'] === undefined) {
                    throw Error('State is missing Comparable extension');
                }
                let k: K | '___default' = key || '___default';
                let snap = snapshots.get(k)
                if (!snap) {
                    throw Error(`Snapshot does not exist: ${k}`);
                }
                const stateAtPath = getByPath(snap, s.path);
                return dependencies['compare'](s)(stateAtPath && stateAtPath.get({ stealth: true })) !== 0
            }
            return {
                snapshot: (s) => (key, mod) => {
                    const mode = mod || 'upsert'
                    if (dependencies['clone'] === undefined) {
                        throw Error('State is missing Clonable extension');
                    }
                    let k: K | '___default' = key || '___default';
                    let stateAtPath: State<StateValueAtPath> | undefined = undefined;
                    let snap = snapshots.get(k)
                    if (mode === 'upsert' ||
                        (mode === 'insert' && !snap) ||
                        (mode === 'update' && snap)) {
                        let v = dependencies['clone'](s)({ stealth: true })
                        if (snap) {
                            stateAtPath = getByPath(snap, s.path)
                            if (!stateAtPath) {
                                throw Error(`Snapshot does not have nested value by path '${s.path.join('/')}' to update`);
                            }
                            stateAtPath.set(v)
                        } else if (s.path.length === 0) {
                            stateAtPath = hookstate(v, options?.snapshotExtensions?.(k))
                            snapshots.set(k, stateAtPath)
                        } else {
                            throw Error('Creating a new snapshot from a nested state is not allowed.');
                        }
                    } else {
                        let snap = snapshots.get(k)
                        if (!snap) {
                            return undefined
                        }
                        if (mode === 'delete') {
                            if (s.path.length !== 0) {
                                throw Error('Deleting a snapshot from a nested state is not allowed.');
                            }
                            snapshots.delete(k) // delete at root only
                        }
                        stateAtPath = getByPath(snap, s.path) // lookup by path
                    }
                    return stateAtPath as State<S, StateExtensionUnknown>
                },
                rollback: (s) => (key) => {
                    let k: K | '___default' = key || '___default';
                    let snap = snapshots.get(k)
                    if (snap) {
                        let stateAtPath = getByPath(snap, s.path);
                        // get cloned, otherwise the state will keep mutation the object from snapshot
                        let tmpState = hookstate<StateValueAtPath, StateExtensionUnknown>(stateAtPath && stateAtPath.get({ stealth: true }));
                        let valueAtPathCloned = dependencies['clone'](tmpState)({ stealth: true })
                        s.set(valueAtPathCloned)
                        return stateAtPath as State<S, StateExtensionUnknown>
                    }
                    return undefined
                },
                modified: (s) => (key) => isModified(s, key || '___default'),
                unmodified: (s) => (key) => !isModified(s, key || '___default'),
            }
        }
    })
}
