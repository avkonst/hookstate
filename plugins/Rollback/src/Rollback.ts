
import {
    Path,
    Downgraded,
    Extension,
    StateValueAtPath,
    StateValueAtRoot,
    State,
    StateMethods,
    StateValue,
    extend,
    createHookstate,
    none
} from '@hookstate/core';

export interface Clonable {
    clone(): StateValue<this>
}

export function clonable(snapshot: (v: StateValueAtPath) => StateValueAtPath): Extension<Clonable> {
    return {
        onCreate: (sf) => ({
            clone: (s) => () => snapshot(s.get({ noproxy: true }))
        })
    }
}

export interface Comparable {
    compare(other: StateValue<this>): number
    equals(other: StateValue<this>): boolean
}

export function comparable(compare: (v1: StateValueAtPath, v2: StateValueAtPath) => number): Extension<Comparable> {
    return {
        onCreate: () => ({
            compare: (s) => (other) => compare(s.get(), other),
            equals: (s) => (other) => compare(s.get(), other) === 0,
        })
    }
}

export interface Snapshotable<K = string> {
    snapshot(key?: K,
        mode?: 'upsert' | 'insert' | 'update' | 'delete' | 'lookup'): StateValue<this> | undefined;
    rollback(key?: K): StateValue<this> | undefined;
    modified(key?: K): boolean;
    unmodified(key?: K): boolean;
}

export function snapshotable<K extends string = string>(): Extension<Snapshotable<K>> {
    const snapshots: Map<K | '___default', StateValueAtRoot> = new Map();
    return {
        onCreate: (sf, dependencies) => {
            function getByPath(v: StateValueAtRoot, path: Path) {
                let result = v;
                path.forEach(p => {
                    result = result && result[p];
                });
                return result;
            }
            function isModified(s: State<StateValueAtPath>, key: K | '___default') {
                if (dependencies['compare'] === undefined) {
                    throw Error('State is missing Comparable extension');
                }
                const v = getByPath(snapshots.get(key || '___default'), s.path);
                return (s as unknown as State<StateValueAtPath, Comparable>).compare(v) !== 0
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
                        // Clone the entire state, starting from root
                        v = (sf() as unknown as State<StateValueAtRoot, Clonable>).clone()
                        snapshots.set(k, v)
                    } else {
                        v = snapshots.get(k)
                        if (mode === 'delete') {
                            snapshots.delete(k)
                        }
                    }
                    return getByPath(v, s.path)
                },
                rollback: (s) => (key) => {
                    let k: K | '___default' = key || '___default';
                    if (snapshots.has(k)) {
                        const v = getByPath(snapshots.get(k), s.path);
                        s.set(v)
                        return v
                    }
                    return undefined
                },
                modified: (s) => (key) => isModified(s, key || '___default'),
                unmodified: (s) => (key) => !isModified(s, key || '___default'),
            }
        }
    }
}
