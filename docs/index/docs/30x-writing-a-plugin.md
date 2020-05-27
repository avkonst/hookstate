---
id: writing-plugin
title: Writing your own plugin
sidebar_label: Writing a plugin
---

import { PreviewSample } from '../src/PreviewSample'

A plugin is effectively a set of callbacks and unique symbol ID. Here is an example of a plugin which has got all possible callbacks and prints console logs when called:

```tsx
// should be global variable
const MyStateWatchPluginId = Symbol('MyStateWatchPlugin');

function MyStateWatchPlugin() {
    return ({
        id: MyStateWatchPluginId,
        init: (s: State<StateValueAtRoot>) => {
            console.log('plugin attached')
            return ({
                onSet: (data) => {
                    console.log('new state set', data.state);
                    console.log('at path', data.path);
                    console.log('to a new value', data.value);
                    console.log('from old value', data.previous);
                    console.log('merged with', data.merged);
                },
                onDestroy: (data) => {
                    console.log('state detroyed', data.state);
                },
                onBatchStart: (data) => {
                    console.log('batch started', data.state);
                    console.log('at path', data.path);
                    console.log('with context', data.context);
                },
                onBatchFinish: (data) => {
                    console.log('batch finished', data.state);
                    console.log('with context', data.context);
                }
            })
        }
    })
};
```

Now it can be attached to a state:

```tsx
const state = createState(...);
state[self].attach(MyStateWatchPlugin)
```

When the methods from [StateMethods](typedoc-hookstate-core#interfacesstatemethodsmd) are invoked for a state,
the plugin's callbacks will be called. Learn more about the plugin interfaces in the API reference:
* [PluginCallbacks](typedoc-hookstate-core#interfacesplugincallbacksmd)
* [PluginCallbacksOnSetArgument](typedoc-hookstate-core#interfacesplugincallbacksonsetargumentmd)
* [PluginCallbacksOnDestroyArgument](typedoc-hookstate-core#interfacesplugincallbacksondestroyargumentmd)
* [PluginCallbacksOnBatchArgument](typedoc-hookstate-core#interfacesplugincallbacksonbatchargumentmd)

A plugin may provide additional extension methods, like the [Initial](./extensions-initial) plugin, for example.
The best place for extension methods is alongside with the callback functions:

```tsx
function MyStateWatchPlugin() {
    return ({
        id: MyStateWatchPluginId,
        init: (s: State<StateValueAtRoot>) => {
            return ({
                // standard callback
                onSet: (data) => { ... },
                // extension method
                doSomething: () => { ... }
            })
        }
    })
};
```

A plugin instance can be retrieved from a state using [StateMethods.attach](typedoc-hookstate-core#attach) method called by plugin ID:

```tsx
const [plugin, controls] = state[self].attach(MyStateWatchPluginId)
```

The `controls` variable is a set of extended control methods, which allow to update the state without triggering rerendering and to rerender when a state has not been updated. This is used by the [Untracked](./performance-managed-rendering#untracked-plugin) plugin, for example.

An instance of `plugin` will be an `Error` if a plugin with the specified ID has not been attached to a state. If a plugin can not function without being attached, it may just throw this error.

If it has been attached it will be the result returned by the `init` function defined by a plugin (see above). It means it is necessary to do the following in order to call the extension method:

```tsx
(plugin as { doSomething: () => void }).doSomething()
```

This is usually wrapped by an overloaded plugin function itself, so it can be used like the following:

```tsx
MyStateWatchPlugin(state).doSomething()
```

Check out how the [Initial](./extensions-initial) plugin does it, for example.

In case of any issues, just raise a ticket on Github.
