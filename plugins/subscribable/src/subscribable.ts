
import { Path, StateValueAtPath, InferStateValueType, ExtensionFactory, State, none } from '@hookstate/core';

export interface Subscribable {
    subscribe<S extends InferStateValueType<this>>(callback: (value: S) => void): () => void
}

export function subscribable<S, E>(): ExtensionFactory<S, E, Subscribable> {
    type SubscriberEntry = [Path, (value: StateValueAtPath) => void]
    const subscribers: SubscriberEntry[] = [];
    let stateAtRoot: State<S, {}>;

    return () => ({
        onCreate: (s) => {
            stateAtRoot = s
            function pathsEqual(p1: Path, p2: Path) {
                if (p1.length !== p2.length) {
                    return false
                }
                for (let i = 0; i < p1.length; i += 1) {
                    if (p1[i] !== p2[i]) {
                        return false
                    }
                }
                return true
            }

            return {
                subscribe: (state) => (cb) => {
                    if (!subscribers.find(i => pathsEqual(i[0], state.path) && i[1] === cb)) {
                        subscribers.push([state.path, cb])
                    }
                    return () => {
                        let found = subscribers.findIndex(i => pathsEqual(i[0], state.path) && i[1] === cb)
                        if (found !== -1) {
                            subscribers.splice(found, 1)
                        }
                    }
                },
            }
        },
        onSet: (s, d) => {
            function pathStartsWith(p1: Path, p2: Path) {
                if (p1.length < p2.length) {
                    return false
                }
                for (let i = 0; i < p2.length; i += 1) {
                    if (p1[i] !== p2[i]) {
                        return false
                    }
                }
                return true
            }
            function getValueAtPath(path: Path) {
                let result = stateAtRoot.value
                for (let p of path) {
                    if (result === undefined || result == null) {
                        return none
                    }
                    result = result[p]
                }
                return result
            }

            if (s.promise || s.error) {
                return;
            }
            for (let subscriber of subscribers) {
                // Here is the path match logic
                // If a state is updated at /a/b, then the following subscribers should be invoked
                // - /
                // - /a
                // - /a/b (<-- this one is updated)
                // - /a/b/c
                // and the following should not be invoked
                // - /a/d
                // - /g
                // - /g/f
                if (pathStartsWith(s.path, subscriber[0]) || pathStartsWith(subscriber[0], s.path)) {
                    let v = getValueAtPath(subscriber[0])
                    if (v !== none) {
                        subscriber[1](v)
                    }
                }
            }
        }
    })
}
