import { StateLink, Plugin, StateValueAtPath, PluginCallbacks } from '@hookstate/core';

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
export function Labelled(link: StateLink<StateValueAtPath>): string | undefined;
export function Labelled(labelOrLink: string | StateLink<StateValueAtPath>): (() => Plugin) | string | undefined {
    if (typeof labelOrLink === 'string') {
        const label = labelOrLink;
        return () => ({
            id: LabelledID,
            create: () => {
                return ({
                    label: label
                } as PluginCallbacks);
            }
        })
    }
    const plugin = labelOrLink.with(LabelledID, () => undefined);
    return plugin && (plugin[1] as { label: string }).label;
}