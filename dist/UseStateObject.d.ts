import React from 'react';
export declare type SetPartialStateAction<S extends object> = Partial<S> | ((prevValue: S) => Partial<S>);
export interface ObjectStateMutation<S extends object> {
    set: React.Dispatch<React.SetStateAction<S>>;
    merge: React.Dispatch<SetPartialStateAction<S>>;
    update<K extends keyof S>(key: K, value: React.SetStateAction<S[K]>): void;
}
export declare function createObjectStateMutation<S extends object>(setValue: React.Dispatch<React.SetStateAction<S>>): ObjectStateMutation<S>;
export declare function useStateObject<S extends object>(initialState: S | (() => S)): [S, ObjectStateMutation<S>];
export default useStateObject;
