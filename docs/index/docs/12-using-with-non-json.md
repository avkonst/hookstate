---
id: state-with-non-json-objects
title: States of complex non-JSON serializable data
sidebar_label: States of non-JSON data
---

It is possible to have states (root level or nested) to hold instances of custom classes, including standard classes like Date. Accessing these values, will automatically enable `noproxy` option for the [State.get](typedoc-hookstate-core#get) function. It means these values will be tracked by Hookstate for rerendering purpose as whole instances, ie. using one property of such a value, means the entire object is used.

If a state value holds a function, but the value is an instance of Object class, then it is required to set noproxy explicitly before accessing the function, for example:

```tsx
let state = useHookstate({ callback: () => {} })
state.get({ noproxy: true }).callback()
```
