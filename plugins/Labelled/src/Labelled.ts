import { Plugin, PluginCallbacks, State, self } from '@hookstate/core';

const LabelledID = Symbol('Labelled');

/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export function Labelled(label: string): () => Plugin;
/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export function Labelled<S>(link: State<S>): string | undefined;
export function Labelled<S>(labelOrLink: string | State<S>):
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
    const th = labelOrLink as State<S>;
    const [plugin] = th[self].attach(LabelledID);
    if (plugin instanceof Error) {
        return undefined;
    }
    return (plugin as { label: string }).label;
}