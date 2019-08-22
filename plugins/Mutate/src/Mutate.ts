
import { StateValueAtPath, StateLink } from '@hookstate/core';

// TODO add support for Map and Set
export type InferredStateMutation<S> =
    S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> :
    S extends null ? ValueStateMutation<S> :
    S extends object ? ObjectStateMutation<S> :
    S extends string ? StringStateMutation<S> :
    S extends number ? NumberStateMutation<S> :
    ValueStateMutation<S>;

export type SetPartialStateAction<S extends object> = Partial<S> | ((prevValue: S) => Partial<S>);

export interface ValueStateMutation<S> {
    set: React.Dispatch<React.SetStateAction<S>>;
}

export interface StringStateMutation<S> extends ValueStateMutation<S> {
    // reserved for the future
}

export interface NumberStateMutation<S> extends ValueStateMutation<S> {
    // reserved for the future
}

export interface ArrayStateMutation<U> extends ValueStateMutation<U[]> {
    merge(other: React.SetStateAction<{ [index: number]: U; }>): void;
    update(key: number, value: React.SetStateAction<U>): void;
    concat(other: React.SetStateAction<U[]>): void;
    push(elem: U): void;
    pop(): void;
    insert(index: number, elem: U): void;
    remove(index: number): void;
    swap(index1: number, index2: number): void;
}

export interface ObjectStateMutation<S extends object> extends ValueStateMutation<S> {
    merge: React.Dispatch<SetPartialStateAction<S>>;
    update<K extends keyof S>(key: K, value: React.SetStateAction<S[K]>): void;
}

function extractValue<S, R>(prevValue: S, value: R | ((prevValue: S) => R)): R {
    if (typeof value === 'function') {
        return (value as ((prevValue: S) => R))(prevValue);
    }
    return value;
}

function createArrayStateMutation<U>(state: StateLink<U[]>): ArrayStateMutation<U> {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    return {
        set: (newValue) => state.set(newValue),
        merge: (other) => {
            state.set((prevValue) => {
                const source = extractValue(prevValue, other);
                Object.keys(source).sort().forEach(i => {
                    const index = Number(i);
                    prevValue[index] = source[index];
                });
                return prevValue;
            });
        },
        update: (key, value) => state.nested[key].set(value),
        concat: (other) => {
            if (other) {
                state.set((prevValue) => {
                    return prevValue.concat(extractValue(prevValue, other));
                });
            }
        },
        push: (elem) => {
            state.set((prevValue) => {
                prevValue.push(elem);
                return prevValue;
            });
        },
        pop: () => {
            state.set((prevValue) => {
                prevValue.pop();
                return prevValue;
            });
        },
        insert: (index, elem) => {
            state.set((prevValue) => {
                prevValue.splice(index, 0, elem);
                return prevValue;
            });
        },
        remove: (index) => {
            state.set((prevValue) => {
                prevValue.splice(index, 1);
                return prevValue;
            });
        },
        swap: (index1, index2) => {
            const p1 = state.nested[index1].get();
            const p2 = state.nested[index2].get();
            state.nested[index1].set(p2);
            state.nested[index2].set(p1);
        }
    };
}

function createObjectStateMutation<S extends object>(state: StateLink<S>): ObjectStateMutation<S> {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    return {
        set: (v) => state.set(v),
        merge: (value: SetPartialStateAction<S>) => {
            state.set((prevValue) => {
                const source = extractValue(prevValue, value);
                Object.keys(source).forEach(key => {
                    prevValue[key] = source[key]
                })
                return prevValue
            });
        },
        update: (key, value) => state.nested[key as string].set(value)
    };
}

function createStringStateMutation<S>(state: StateLink<S>): StringStateMutation<S> {
    // reserved for future extensions
    return {
        set: v => state.set(v)
    };
}

function createNumberStateMutation<S>(state: StateLink<S>): NumberStateMutation<S> {
    // reserved for future extensions
    return {
        set: v => state.set(v)
    };
}

function createValueStateMutation<S>(state: StateLink<S>): ValueStateMutation<S> {
    return {
        set: v => state.set(v)
    };
}

// tslint:disable-next-line: function-name
export function Mutate<S>(state: StateLink<S>): InferredStateMutation<S> {
    if (Array.isArray(state.value)) {
        return createArrayStateMutation(state as unknown as StateLink<StateValueAtPath>) as
            unknown as InferredStateMutation<S>
    } else if (typeof state.value === 'object' && state.value !== null) {
        return createObjectStateMutation(state as StateLink<StateValueAtPath>) as
            unknown as InferredStateMutation<S>;
    } else if (typeof state.value === 'string') {
        return createStringStateMutation(state) as unknown as InferredStateMutation<S>;
    } else if (typeof state.value === 'number') {
        return createNumberStateMutation(state) as unknown as InferredStateMutation<S>;
    } else {
        return createValueStateMutation(state) as unknown as InferredStateMutation<S>;
    }
}
