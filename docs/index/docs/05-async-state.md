---
id: asynchronous-state
title: Asynchronous state
sidebar_label: Asynchronous state
---

import { PreviewSample } from '../src/PreviewSample'

The root state can be set to a promise value, either as an initial value for [hookstate](typedoc-hookstate-core#hookstate)/[useHookstate](typedoc-hookstate-core#usehookstate) or as a subsequent value via [State.set](typedoc-hookstate-core#set) method.

## Checking if state is loading

While a promise is not resolved or rejected almost any operation will result in an exception. To check if underlying promise is resolved or rejected, use [State.promised](typedoc-hookstate-core#readonly-promised).
To check if underlying promise is rejected, use [State.error](typedoc-hookstate-core#readonly-error). For example:

<PreviewSample example="local-async-state" />

## Executing an action when state is loaded

It is also possible to access the underlying promise and add a value handling on the promise resolution:

```tsx
const state = hookstate(new Promise(...));
state.promise.then(() => {})
```

```tsx
const state = hookstate(none);
state.promise.then(() => {})
setTimeout(() => state.set(...), 1000)
```

## Suspending rendering until asynchronous state is loaded

Suspend is a React 18 feature. Hookstate provides integration with it in 2 ways:
- the [suspend](typedoc-hookstate-core#suspend) function
- and the `suspend` option of the `StateFragment` component.

Both methods work with local, global and scoped states.

Example:

```tsx
function MyComponent() {
    let state = useHookstate(new Promise(...))
    return suspend(state) ?? <p>State is loaded: {state.value}</p>
}
```
