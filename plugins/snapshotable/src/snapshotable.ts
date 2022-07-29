
import {
    Path,
    Extension,
    StateValueAtPath,
    StateValueAtRoot,
    State,
    StateValue,
} from '@hookstate/core';

export interface Snapshotable<K extends string = string> {
    snapshot(key?: K,
        mode?: 'upsert' | 'insert' | 'update' | 'delete' | 'lookup'): StateValue<this> | undefined;
    rollback(key?: K): StateValue<this> | undefined;
    modified(key?: K): boolean;
    unmodified(key?: K): boolean;
}

export function snapshotable<K extends string = string>(): () => Extension<Snapshotable<K>> {
    return () => ({
        onCreate: (_, dependencies) => {
            const snapshots: Map<K | '___default', StateValueAtRoot> = new Map();
            function getByPath(v: StateValueAtRoot, path: Path) {
                let result = v;
                path.forEach(p => {
                    result = result && result[p];
                });
                return result;
            }
            function setByPath(valueAtRoot: StateValueAtRoot, path: Path, valueAtPath: StateValueAtPath) {
                if (path.length === 0) {
                    throw Error('Internal error: expected nested state')
                }
                let result = valueAtRoot;
                for (let i = 0; i < path.length - 1; i += 1) {
                    let p = path[i]
                    if (Object(result[p]) !== result[p]) {
                        throw Error(`Snapshot does not have nested value by path '${path.join('/')}' to update`);
                    }
                    result = result && result[p];
                }
                result[path[path.length - 1]] = valueAtPath
            }
            function isModified(s: State<StateValueAtPath>, key: K | '___default') {
                if (dependencies['compare'] === undefined) {
                    throw Error('State is missing Comparable extension');
                }
                let k: K | '___default' = key || '___default';
                if (snapshots.has(k)) {
                    const v = getByPath(snapshots.get(k), s.path);
                    return dependencies['compare'](s)(v) !== 0
                }
                throw Error(`Snapshot does not exist: ${k}`);
            }
            return {
                snapshot: (s) => (key, mode) => {
                    if (dependencies['clone'] === undefined) {
                        throw Error('State is missing Clonable extension');
                    }
                    let k: K | '___default' = key || '___default';
                    let v = undefined;
                    if (mode === undefined || mode === 'upsert' ||
                        (mode === 'insert' && !snapshots.has(k)) ||
                        (mode === 'update' && snapshots.has(k))) {
                        if (s.path.length === 0) {
                            // Root state snapshot case
                            // Clone the entire state, starting from root
                            v = dependencies['clone'](s)({ stealth: true })
                            snapshots.set(k, v)
                        } else if (snapshots.has(k)) {
                            // Nested state snapshot case
                            v = dependencies['clone'](s)({ stealth: true })
                            setByPath(snapshots.get(k), s.path, v)
                        } else {
                            throw Error('Creating a new snapshot from a nested state is not allowed.');
                        }
                    } else {
                        v = snapshots.get(k)
                        if (mode === 'delete') {
                            if (s.path.length !== 0) {
                                throw Error('Deleting a snapshot from a nested state is not allowed.');
                            }
                            snapshots.delete(k) // delete at root only
                        }
                        v = getByPath(v, s.path) // lookup by path
                    }
                    return v
                },
                rollback: (s) => (key) => {
                    let k: K | '___default' = key || '___default';
                    if (snapshots.has(k)) {
                        let v = getByPath(snapshots.get(k), s.path);
                        s.set(v) // set for cloning // TODO get rid of this workaround
                        v = (s as unknown as State<StateValueAtPath, { clone: () => StateValueAtRoot }>).clone()
                        s.set(v) // set cloned, otherwise the state will keep mutation the object from snapshot
                        return v
                    }
                    return undefined
                },
                modified: (s) => (key) => isModified(s, key || '___default'),
                unmodified: (s) => (key) => !isModified(s, key || '___default'),
            }
        }
    })
}
