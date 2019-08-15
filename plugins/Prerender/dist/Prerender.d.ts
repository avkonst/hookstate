import React from 'react';
import { StateLink } from '@hookstate/core';
export declare function EqualsPrerender<S, E extends {}, R>(transform: (state: StateLink<S, E>, prev: R | undefined) => R): (link: StateLink<S, E>, prev: R | undefined) => R;
export declare function ScopedPrerender<S, E extends {}>(props: {
    state: StateLink<S, E>;
    children: (state: StateLink<S, E>) => React.ReactElement;
}): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
