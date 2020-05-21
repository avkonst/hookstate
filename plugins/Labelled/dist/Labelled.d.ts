import { StateLink, Plugin, State } from '@hookstate/core';
/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 *
 * For example:
 *
 * ```tsx
 * const globalState = createStateLink(someLargeObject as object,
 *     [Labelled('my-state-label')]) // label the state very early
 * const MyComponent = () => {
 *     const state = useStateLink(globalState)
 *     console.log('state label', Labelled(state))
 *     return <>{JSON.stringify(state.value)}</>
 * }
 * ```
 */
export declare function Labelled(label: string): () => Plugin;
/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 *
 * For example:
 *
 * ```tsx
 * const MyComponent = () => {
 *     const state = useStateLink(globalState, [Labelled('my-state-label')])
 *     console.log('state label', Labelled(state))
 *     return <>{JSON.stringify(state.value)}</>
 * }
 * ```
 */
export declare function Labelled<S>(link: StateLink<S>): string | undefined;
export declare function Labelled<S>(link: State<S>): string | undefined;
