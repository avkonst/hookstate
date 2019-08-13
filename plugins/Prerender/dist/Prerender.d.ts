import { StateLink } from '@hookstate/core';
export declare function EqualsPrerender<S, E extends {}, R>(transform: (state: StateLink<S, E>, prev: R | undefined) => R): (link: StateLink<S, E>, prev: R | undefined) => R;
