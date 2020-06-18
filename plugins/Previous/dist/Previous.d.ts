import { Plugin, State } from '@hookstate/core';
/**
 * A plugin which allows to remember previous state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export declare function Previous(): Plugin;
/**
 * A plugin which allows to remember previous state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export declare function Previous<S>(state: State<S>): S | void;
