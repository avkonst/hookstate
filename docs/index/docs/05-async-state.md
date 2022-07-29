---
id: asynchronous-state
title: Asynchronous state
sidebar_label: Asynchronous state
---

import { PreviewSample } from '../src/PreviewSample'

The root state can be set to a promise value, either as an initial value for [createHookstate](typedoc-hookstate-core#createhookstate)/[useState](typedoc-hookstate-core#usestate) or as a subsequent value via [StateMethods.set](typedoc-hookstate-core#set) method.

## Checking if state is loading

While a promise is not resolved or rejected almost any operation will result in an exception. To check, if underlying promise is resolved or rejected, use [StateMethods.promised](typedoc-hookstate-core#readonly-promised).
To check, if underlying promise is rejected, use [StateMethods.error](typedoc-hookstate-core#readonly-error). For example:

<PreviewSample example="local-async-state" />

## Executing an action when state is loaded

It is also possible to postpone an action or error handling until a promise is settled, which is frequently useful with global states initialised to a promise. To enable this behavior, `action` callback of the [StateMethods.batch](typedoc-hookstate-core#batch) method should return the special symbol [postpone](typedoc-hookstate-core#const-postpone):

```tsx
const state = createHookstate(new Promise(...));
state.batch((state) => {
    if (state.promised) {
        return postpone
    }
    if (state.error) {
        /* do something when promise is rejected */
    }
    /* do something when promise is resolved */
})
```
