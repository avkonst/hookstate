import React from 'react';
import { UnmountedCallback, ProxyMarkerID, RootPath, Subscribable, StateMemoID, NoAction, NoActionUnmounted } from './SharedImpl';
import { InitialValueAtRoot, Path, StateLink, StateRef, StateInf } from './Declarations';
import { State } from './StateImpl';
import { StateLinkInvalidUsageError } from './Exceptions';
import { StateLinkImpl } from './StateLinkImpl';
import { StateRefImpl } from './StateRefImpl';
import { StateInfImpl } from './StateInfImpl';
import { Downgraded } from './Downgraded';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function createState<S>(initial: InitialValueAtRoot<S>): State {
    let initialValue: S | Promise<S> = initial as (S | Promise<S>);
    if (typeof initial === 'function') {
        initialValue = (initial as (() => S | Promise<S>))();
    }
    if (typeof initialValue === 'object' && initialValue[ProxyMarkerID]) {
        throw new StateLinkInvalidUsageError(
            `create/useStateLink(state.get() at '/${initialValue[ProxyMarkerID].path.join('/')}')`,
            RootPath,
            'did you mean to use create/useStateLink(state) OR ' +
            'create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?')
    }
    return new State(initialValue);
}

function useSubscribedStateLink<S>(
    state: State,
    path: Path,
    update: () => void,
    subscribeTarget: Subscribable,
    disabledTracking: boolean | undefined,
    onDestroy: () => void
) {
    const link = new StateLinkImpl<S>(
        state,
        path,
        update,
        state.get(path),
        state.edition
    );
    if (disabledTracking) {
        link.with(Downgraded)
    }
    useIsomorphicLayoutEffect(() => {
        subscribeTarget.subscribe(link);
        return () => {
            link.onUpdateUsed[UnmountedCallback] = true
            subscribeTarget.unsubscribe(link);
        }
    });
    React.useEffect(() => () => onDestroy(), []);
    return link;
}

function useGlobalStateLink<S>(stateRef: StateRefImpl<S>): StateLinkImpl<S> {
    const [value, setValue] = React.useState({ state: stateRef.state });
    return useSubscribedStateLink(
        value.state,
        RootPath,
        () => setValue({ state: value.state }),
        value.state,
        stateRef.disabledTracking,
        NoAction);
}

function useLocalStateLink<S>(initialState: InitialValueAtRoot<S>): StateLinkImpl<S> {
    const [value, setValue] = React.useState(() => ({ state: createState(initialState) }));
    return useSubscribedStateLink(
        value.state,
        RootPath,
        () => setValue({ state: value.state }),
        value.state,
        undefined,
        () => value.state.destroy());
}

function useScopedStateLink<S>(originLink: StateLinkImpl<S>): StateLinkImpl<S> {
    const [, setValue] = React.useState({});
    return useSubscribedStateLink(
        originLink.state,
        originLink.path,
        () => setValue({}),
        originLink,
        originLink.disabledTracking,
        NoAction);
}

function useAutoStateLink<S>(
    initialState: InitialValueAtRoot<S> | StateLink<S> | StateRef<S>
): StateLinkImpl<S> {
    if (initialState instanceof StateLinkImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useScopedStateLink(initialState as StateLinkImpl<S>);
    }
    if (initialState instanceof StateRefImpl) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGlobalStateLink(initialState as StateRefImpl<S>);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalStateLink(initialState as InitialValueAtRoot<S>);
}

function injectTransform<S, R>(
    link: StateLinkImpl<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
) {
    if (link.onUpdateUsed[UnmountedCallback]) {
        // this is unmounted link
        return transform(link, undefined);
    }
    let injectedOnUpdateUsed: (() => void) | undefined = undefined;
    const originOnUpdateUsed = link.onUpdateUsed;
    link.onUpdateUsed = () => {
        if (injectedOnUpdateUsed) {
            return injectedOnUpdateUsed();
        }
        return originOnUpdateUsed();
    }

    const result = transform(link, undefined);
    const stateMemoEquals: ((a: R, b: R) => boolean) | undefined = link[StateMemoID];
    if (stateMemoEquals === undefined) {
        return result;
    }
    delete link[StateMemoID];

    injectedOnUpdateUsed = () => {
        const updatedResult = transform(link, result);
        // if result is not changed, it does not affect the rendering result too
        // so, we skip triggering rerendering in this case
        if (!stateMemoEquals(updatedResult, result)) {
            originOnUpdateUsed();
        }
    }
    return result;
}

///
/// EXPORTED IMPLEMENTATIONS
///
export function createStateLink<S>(
    initial: InitialValueAtRoot<S>
): StateRef<S>;
export function createStateLink<S, R>(
    initial: InitialValueAtRoot<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): StateInf<R>;
export function createStateLink<S, R>(
    initial: InitialValueAtRoot<S>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateRef<S> | StateInf<R> {
    const ref = new StateRefImpl<S>(createState(initial));
    if (transform) {
        return new StateInfImpl(ref, transform)
    }
    return ref;
}

export function useStateLink<R>(
    source: StateInf<R>
): R;
export function useStateLink<S>(
    source: StateLink<S> | StateRef<S>
): StateLink<S>;
export function useStateLink<S, R>(
    source: StateLink<S> | StateRef<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S>(
    source: InitialValueAtRoot<S>
): StateLink<S>;
export function useStateLink<S, R>(
    source: InitialValueAtRoot<S>,
    transform: (state: StateLink<S>, prev: R | undefined) => R
): R;
export function useStateLink<S, R>(
    source: InitialValueAtRoot<S> | StateLink<S> | StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>, prev: R | undefined) => R
): StateLink<S> | R {
    const state = source instanceof StateInfImpl
        ? source.wrapped as unknown as StateRef<S>
        : source as (InitialValueAtRoot<S> | StateLink<S> | StateRef<S>);
    const link = useAutoStateLink(state);
    if (source instanceof StateInfImpl) {
        return injectTransform(link, source.transform);
    }
    if (transform) {
        return injectTransform(link, transform);
    }
    return link;
}

/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<R>(
    source: StateInf<R>,
): R;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S>(
    source: StateRef<S>,
): StateLink<S>;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S, R>(
    source: StateRef<S>,
    transform: (state: StateLink<S>) => R
): R;
/**
 * @deprecated use accessStateLink instead
 */
export function useStateLinkUnmounted<S, R>(
    source: StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    // tslint:disable-next-line: no-any
    type AnyArgument = any; // typesafety is guaranteed by overloaded functions above
    return accessStateLink(source as AnyArgument, transform as AnyArgument)
}

export function accessStateLink<R>(
    source: StateInf<R>,
): R;
export function accessStateLink<S>(
    source: StateRef<S>,
): StateLink<S>;
export function accessStateLink<S, R>(
    source: StateRef<S>,
    transform: (state: StateLink<S>) => R
): R;
export function accessStateLink<S, R>(
    source: StateRef<S> | StateInf<R>,
    transform?: (state: StateLink<S>) => R
): StateLink<S> | R {
    const stateRef = source instanceof StateInfImpl
        ? source.wrapped as StateRefImpl<S>
        : source as StateRefImpl<S>;
    const link = new StateLinkImpl<S>(
        stateRef.state,
        RootPath,
        NoActionUnmounted,
        stateRef.state.get(RootPath),
        stateRef.state.edition
    ).with(Downgraded) // it does not matter how it is used, it is not subscribed anyway
    if (source instanceof StateInfImpl) {
        return source.transform(link, undefined);
    }
    if (transform) {
        return transform(link);
    }
    return link;
}
