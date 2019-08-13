import { StateLink, PrerenderTransform } from '../UseStateLink';
import isEqual from 'lodash.isequal';

// tslint:disable-next-line: function-name
export function Prerender<S, E extends {}, R>(
    transform: (state: StateLink<S, E>, prev: R | undefined) => R) {
    return (link: StateLink<S, E>, prev: R | undefined) => {
        link.with(PrerenderTransform).extended.prerenderTransform(isEqual);
        return transform(link, prev);
    }
}
