import React from 'react';
export interface ArrayStateMutation<U> {
    set: React.Dispatch<React.SetStateAction<U[]>>;
    merge(other: React.SetStateAction<{
        [index: number]: U;
    }>): void;
    update(key: number, value: React.SetStateAction<U>): void;
    concat(other: React.SetStateAction<U[]>): void;
    push(elem: U): void;
    pop(): void;
    insert(index: number, elem: U): void;
    remove(index: number): void;
    swap(index1: number, index2: number): void;
}
export declare function createArrayStateMutation<U>(setValue: React.Dispatch<React.SetStateAction<U[]>>): ArrayStateMutation<U>;
export declare function useStateArray<U>(initialState: U[] | (() => U[])): [U[], ArrayStateMutation<U>];
export default useStateArray;
