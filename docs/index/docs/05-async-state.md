---
id: asynchronous-state
title: Asynchronous state
sidebar_label: Asynchronous state
---

import { PreviewSample } from '../src/PreviewSample'

The root state can be set to a promise value, either as an initial value for [createState](typedoc-hookstate-core#createstate)/[useState](typedoc-hookstate-core#usestate) or as a subsequent value via [StateMethods.set](typedoc-hookstate-core#set) method.

## Checking if state is loading

While a promise is not resolved or rejected almost any operation will result in an exception. To check if underlying promise is resolved or rejected use [StateMethods.map](typedoc-hookstate-core#map) method in one of its forms. For example:

<PreviewSample example="local-async-state" />

In addition to `map` without arguments as demonstrated in the above example, [StateMethods.map](typedoc-hookstate-core#map) method has got various other overloads. One of this allows to trap promissed state in a separate callback during mapping. For example:

```tsx
const state = useState(() => new Promise(...));
state[self].map(
    (state) => { /* do something when promise is resolved or rejected */ },
    () => { /* do something when still promised */ },
)
```

You can also have a separate callback to handle the case when the promise is rejected:

```tsx
const state = useState(() => new Promise(...));
state[self].map(
    (state) => { /* do something when promise is resolved */ },
    () => { /* do something when still promised */ },
    (error) => { /* do something when promise is rejected */ }
)
```

## Executing an action when state is loaded

It is also possible to postpone an action or error handling until a promise is settled, which is frequently useful with global states initialised to a promise. To enable this behavior, `onPromised` callback of the [StateMethods.map](typedoc-hookstate-core#map) method should return the special symbol [postpone](typedoc-hookstate-core#const-postpone):

```tsx
const state = createState(new Promise(...));
state[self].map(
    (state) => { /* do something when promise is resolved or rejected */ },
    () => postpone,
)
```

Or:

```tsx
const state = createState(new Promise(...));
state[self].map(
    (state) => { /* do something when promise is resolved */ },
    () => postpone,
    (error) => { /* do something when promise is rejected */ }
)
```
