---
id: state-with-non-json-objects
title: Using state with complex non-JSON serializable data
sidebar_label: Using state with non-JSON data
---

It is possible to have states (root level or nested) to hold instances of custom classes, including standard classes like Date. Accessing these values, will automatically enable `noproxy` option for the [State.get](typedoc-hookstate-core#get) function. It means these values will be tracked by Hookstate for rerendering purpose as whole instances, ie. using one property of such a value, means the entire object is used.

If a state value holds a function, but the value is an instance of Object class, then it is required to set noproxy explicitly before accessing the function, for example:

```tsx
let state = useHookstate({ callback: () => {} })
state.get({ noproxy: true }).callback()
```

If you use extensions, such as `localstored`, which requires to serialize and deserialize the state value, you may need to add [serilalizable extension](/docs/extensions-overview) to the state and define how a custom class value should be serialized and deserialized. 