import React from 'react';
import { StateLink, Prerender, useStateLink } from '@hookstate/core';
import isEqual from 'lodash.isequal';

// tslint:disable-next-line: function-name
export function EqualsPrerender<S, E extends {}, R>(
    transform: (state: StateLink<S, E>, prev: R | undefined) => R) {
    return (link: StateLink<S, E>, prev: R | undefined) => {
        link.with(Prerender).extended.enablePrerender(isEqual);
        return transform(link, prev);
    }
}

export function ScopedPrerender<S, E extends {}>(props: {
    state: StateLink<S, E>,
    children: (state: StateLink<S, E>) => React.ReactElement
}) {
    const scoped = useStateLink(props.state);
    return props.children(scoped);
}
