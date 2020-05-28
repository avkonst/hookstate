import { Plugin, State } from '@hookstate/core';
/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export declare function Labelled(label: string): () => Plugin;
/**
 * A plugin which allows to assign a label to a state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export declare function Labelled<S>(link: State<S>): string | undefined;
