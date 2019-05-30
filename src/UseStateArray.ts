import React from 'react';

export interface ArrayStateMutation<U> {
    set: React.Dispatch<React.SetStateAction<U[]>>;
    merge(other: React.SetStateAction<{ [index: number]: U; }>): void;
    update(key: number, value: React.SetStateAction<U>): void;
    concat(other: React.SetStateAction<U[]>): void;
    push(elem: U): void;
    pop(): void;
    insert(index: number, elem: U): void;
    remove(index: number): void;
    swap(index1: number, index2: number): void;
}

function extractValue<S, R>(prevValue: S, value: R | ((prevValue: S) => R)): R {
    if (typeof value === 'function') {
        return (value as ((prevValue: S) => R))(prevValue);
    }
    return value;
}

export function createArrayStateMutation<U>(
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

export function useStateArray<U>(initialState: U[] | (() => U[])):
    [U[], ArrayStateMutation<U>] {
    const [value, setValue] = React.useState(initialState);
    return [value, createArrayStateMutation(setValue)];
}

export default useStateArray;
