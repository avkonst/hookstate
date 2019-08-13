
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

function createArrayStateMutation<U>(
    setValue: React.Dispatch<React.SetStateAction<U[]>>): ArrayStateMutation<U> {
    // All actions (except set) should crash if prevValue is null or undefined.
    // It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    return {
        set: setValue,
        merge: (other) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                const source = extractValue(copy, other);
                Object.keys(source).sort().forEach(i => {
                    const index = Number(i);
                    copy[index] = source[index];
                });
                return copy;
            });
        },
        update: (key, value) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy[key] = extractValue(copy[key], value);
                return copy;
            });
        },
        concat: (other) => {
            if (other) {
                setValue((prevValue) => {
                    const copy = prevValue.slice();
                    return copy.concat(extractValue(copy, other));
                });
            }
        },
        push: (elem) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy.push(elem);
                return copy;
            });
        },
        pop: () => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy.pop();
                return copy;
            });
        },
        insert: (index, elem) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy.splice(index, 0, elem);
                return copy;
            });
        },
        remove: (index) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy.splice(index, 1);
                return copy;
            });
        },
        swap: (index1, index2) => {
            setValue((prevValue) => {
                const copy = prevValue.slice();
                copy[index1] = prevValue[index2];
                copy[index2] = prevValue[index1];
                return copy;
            });
        }
    };
}

function createObjectStateMutation<S extends object>(
    setValue: React.Dispatch<React.SetStateAction<S>>): ObjectStateMutation<S> {
    // All actions (except set and merge with empty object) should crash
    // if prevValue is null or undefined. It is intentional behavior.
    // Although this situation is not allowed by type checking of the typescript,
    // it is still possible to get null coming from ValueLink (see notes in the ValueLinkImpl)
    const merge = (value: SetPartialStateAction<S>) => {
        setValue((prevValue) => {
            const extractedValue = extractValue(prevValue, value);
            const keys = Object.keys(extractedValue);
            if (keys.length === 0) {
                // empty object to merge with
                return prevValue;
            }
            // this causes the intended crash if merging with
            // the prevously set to undefined | null value
            // eslint-disable-next-line
            const _unused = prevValue[keys[0]];
            return {
                ...(prevValue
                    // this causes the intended crash if merging with
                    // the prevously set to undefined | null value
                    // and the block with _unused variable is optimized out
                    // by a bundler like webpack, minify, etc.
                    || Object.keys(prevValue)),
                ...extractedValue,
            };
        });
    };
    return {
        set: setValue,
        merge: merge,
        update: (key, value) => merge((prevValue) => {
            const partialResult: Partial<S> = {};
            partialResult[key] = extractValue(
                // this causes the intended crash if updating the property of
                // the prevously set to undefined | null value
                prevValue[key],
                value);
            return partialResult;
        })
    };
}

function createStringStateMutation<S>(
    setValue: React.Dispatch<React.SetStateAction<S>>): StringStateMutation<S> {
    // reserved for future extensions
    return {
        set: setValue
    };
}

function createNumberStateMutation<S>(
    setValue: React.Dispatch<React.SetStateAction<S>>): NumberStateMutation<S> {
    // reserved for future extensions
    return {
        set: setValue
    };
}

function createValueStateMutation<S>(
    setValue: React.Dispatch<React.SetStateAction<S>>): ValueStateMutation<S> {
    return {
        set: setValue
    };
}

// tslint:disable-next-line: function-name
export function Mutate<S, E>(state: StateLink<S, E>): InferredStateMutation<S> {
    if (Array.isArray(state.value)) {
        return createArrayStateMutation((newValue) =>
            state.set(newValue as StateValueAtPath)) as unknown as InferredStateMutation<S>
    } else if (typeof state.value === 'object' && state.value !== null) {
        return createObjectStateMutation((newValue) =>
            state.set(newValue as StateValueAtPath)) as unknown as InferredStateMutation<S>;
    } else if (typeof state.value === 'string') {
        return createStringStateMutation((newValue) =>
            state.set(newValue as StateValueAtPath)) as unknown as InferredStateMutation<S>;
    } else if (typeof state.value === 'number') {
        return createNumberStateMutation((newValue) =>
            state.set(newValue as StateValueAtPath)) as unknown as InferredStateMutation<S>;
    } else {
        return createValueStateMutation((newValue) =>
            state.set(newValue as StateValueAtPath)) as unknown as InferredStateMutation<S>;
    }
}
