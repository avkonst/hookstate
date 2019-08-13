import { StateLink } from 'react-hookstate';
export declare function EqualsPrerender<S, E extends {}, R>(transform: (state: StateLink<S, E>, prev: R | undefined) => R): (link: StateLink<S, E>, prev: R | undefined) => R;
