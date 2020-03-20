---
id: global-state
title: Global state
sidebar_label: Global state
---

import { PreviewSample } from '../src/PreviewSample'

## Creating and using global state

Create the state and use it within and outside of a React component. Few lines of code. No bolierplate!

<PreviewSample example="global-getting-started" />

The state is created by [createStateLink](typedoc-hookstate-core#createstatelink). The first argument is the initial state value. The result value is an instance of [StateLink](typedoc-hookstate-core#interfacesstatelinkmd),
which **can be** used directly to get and set the state value outside of a react component.

When you need to use the state in a functional `React` component,
pass the created state to [useStateLink](typedoc-hookstate-core#usestatelink) function
and use the returned result in the component's logic.
The returned result is an instance of [StateLink](typedoc-hookstate-core#interfacesstatelinkmd)` too,
which **must be** used within a react component (during rendering
or in effects) and/or it's children components.

Read more about [createStateLink](typedoc-hookstate-core#createstatelink) and [useStateLink](typedoc-hookstate-core#usestatelink) in the [API reference](typedoc-hookstate-core).
