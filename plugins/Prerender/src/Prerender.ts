import { StateLink, Prerender } from '@hookstate';
import isEqual from 'lodash.isequal';

// tslint:disable-next-line: function-name
export function EqualsPrerender<S, E extends {}, R>(
    transform: (state: StateLink<S, E>, prev: R | undefined) => R) {
    return (link: StateLink<S, E>, prev: R | undefined) => {
        link.with(Prerender).extended.enablePrerender(isEqual);
        return transform(link, prev);
    }
}
