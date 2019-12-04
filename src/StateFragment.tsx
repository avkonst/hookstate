import { useStateLink } from './UseStateLink';
import { InitialValueAtRoot, StateLink, StateRef, StateInf } from './Declarations';

export function StateFragment<R>(
    props: {
        state: StateInf<R>,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S>(
    props: {
        state: StateLink<S> | StateRef<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E extends {}, R>(
    props: {
        state: StateLink<S> | StateRef<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S>(
    props: {
        state: InitialValueAtRoot<S>,
        children: (state: StateLink<S>) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, R>(
    props: {
        state: InitialValueAtRoot<S>,
        transform: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: R) => React.ReactElement,
    }
): React.ReactElement;
export function StateFragment<S, E extends {}, R>(
    props: {
        state: InitialValueAtRoot<S> | StateLink<S> | StateRef<S> | StateInf<R>,
        transform?: (state: StateLink<S>, prev: R | undefined) => R,
        children: (state: StateLink<S> | R) => React.ReactElement,
    }
): React.ReactElement {
    // tslint:disable-next-line: no-any
    type AnyArgument = any; // typesafety is guaranteed by overloaded functions above
    const scoped = useStateLink<S, {}>(props.state as AnyArgument, props.transform as AnyArgument);
    return props.children(scoped as AnyArgument);
}
