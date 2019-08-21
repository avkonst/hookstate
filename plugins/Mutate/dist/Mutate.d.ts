/// <reference types="react" />
import { StateLink } from '@hookstate/core';
export declare type InferredStateMutation<S> = S extends ReadonlyArray<(infer U)> ? ArrayStateMutation<U> : S extends null ? ValueStateMutation<S> : S extends object ? ObjectStateMutation<S> : S extends string ? StringStateMutation<S> : S extends number ? NumberStateMutation<S> : ValueStateMutation<S>;
export declare type SetPartialStateAction<S extends object> = Partial<S> | ((prevValue: S) => Partial<S>);
export interface ValueStateMutation<S> {
    set: React.Dispatch<React.SetStateAction<S>>;
}
export interface StringStateMutation<S> extends ValueStateMutation<S> {
}
export interface NumberStateMutation<S> extends ValueStateMutation<S> {
}
export interface ArrayStateMutation<U> extends ValueStateMutation<U[]> {
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
export interface ObjectStateMutation<S extends object> extends ValueStateMutation<S> {
    merge: React.Dispatch<SetPartialStateAction<S>>;
    update<K extends keyof S>(key: K, value: React.SetStateAction<S[K]>): void;
}
export declare function Mutate<S>(state: StateLink<S>): InferredStateMutation<S>;
