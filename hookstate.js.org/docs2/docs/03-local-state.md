---
id: local-state
title: Local state
sidebar_label: Local state
---

import { PreviewSample } from '../src/PreviewSample'

# Creating and using local state

When a state is used by only one component, and maybe it's children,
it is recommended to use *local* state instead of [*global* state](global-state).
In this case [useStateLink](typedoc-hookstate-core#usestatelink) behaves similarly to `React.useState`, but the
returned instance of [StateLink](typedoc-hookstate-core#statelink) has got more features.

<PreviewSample example="local-getting-started" />

Read more about [useStateLink](typedoc-hookstate-core#usestatelink) and [StateLink](typedoc-hookstate-core#statelink) in the [API reference](typedoc-hookstate-core).
