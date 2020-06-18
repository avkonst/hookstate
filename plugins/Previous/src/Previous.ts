import { Plugin, PluginCallbacks, State, self, PluginCallbacksOnSetArgument } from '@hookstate/core';

const PluginID = Symbol('Previous');

type PreviousInstanceType<T = unknown> = () => (
    PluginCallbacks
    & {
        get(): T | undefined
        previous: T | undefined
    }
)

const PreviousInstance: PreviousInstanceType = () => ({
  previous: undefined,
  onSet(data: PluginCallbacksOnSetArgument) {
    this.previous = data.previous
  },
  get() {
    return this.previous
  }
})

/**
 * A plugin which allows to remember previous state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export function Previous(): Plugin;
/**
 * A plugin which allows to remember previous state.
 * It can be used by other extensions, like development tools or
 * plugins persisting a state.
 */
export function Previous<S>(state: State<S>): S | void;
export function Previous<S>(state?: State<S>): Plugin | S | void {
  if (state === undefined) {
    return {
      id: PluginID,
      init: () => PreviousInstance()
    }
  }
  const [instance] = state[self].attach(PluginID)
  const inst = instance as ReturnType<PreviousInstanceType<S>>
  return inst.get()
}
