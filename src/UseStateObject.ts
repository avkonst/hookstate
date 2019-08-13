import React from 'react';

export type SetPartialStateAction<S extends object> = Partial<S> | ((prevValue: S) => Partial<S>);

export interface ObjectStateMutation<S extends object> {
    set: React.Dispatch<React.SetStateAction<S>>;
    merge: React.Dispatch<SetPartialStateAction<S>>;
    update<K extends keyof S>(key: K, value: React.SetStateAction<S[K]>): void;
}

function extractValue<S, R>(prevValue: S, value: R | ((prevValue: S) => R)): R {
    if (typeof value === 'function') {
        return (value as ((prevValue: S) => R))(prevValue);
    }
    return value;
}

export function createObjectStateMutation<S extends object>(
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

export function useStateObject<S extends object>(initialState: S | (() => S)):
    [S, ObjectStateMutation<S>] {
    const [value, setValue] = React.useState(initialState);
    return [value, createObjectStateMutation(setValue)];
}

export default useStateObject;
