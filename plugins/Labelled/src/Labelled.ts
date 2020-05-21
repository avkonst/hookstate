import { StateLink, Plugin, StateValueAtPath, PluginCallbacks, State, StateMarkerID, self, StateMethods } from '@hookstate/core';

const LabelledID = Symbol('Labelled');

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
export function Labelled(label: string): () => Plugin;
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
export function Labelled<S>(link: StateLink<S>): string | undefined;
export function Labelled<S>(link: State<S>): string | undefined;
export function Labelled<S>(labelOrLink: string | StateLink<S> | State<S>):
    (() => Plugin) | string | undefined {
        
    if (typeof labelOrLink === 'string') {
        const label = labelOrLink;
        return () => ({
            id: LabelledID,
            init: () => {
                return ({
                    label: label
                } as PluginCallbacks);
            }
        })
    }
    if (labelOrLink[StateMarkerID]) {
        const th = labelOrLink as State<S>;
        const [plugin] = th[self].attach(LabelledID);
        if (plugin instanceof Error) {
            return undefined;
        }
        return (plugin as { label: string }).label;
    } else {
        const th = labelOrLink as StateLink<S>;
        const plugin = th.with(LabelledID, () => undefined);
        return plugin && (plugin[1] as { label: string }).label;
    }
}