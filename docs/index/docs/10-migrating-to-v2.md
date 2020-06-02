---
id: migrating-to-v2
title: Migrating to version 2
sidebar_label: Migrating to version 2
---

Hookstate library is moving towards releave version 2.
The releases 1.8.x support 99% of the version 2 functionality.
So, you can use version 1 and 2 API together with the 1.8.x release.

When version 2 is released finally, it will have all version 1 interfaces, types and function removed.

Version 2 API is simpler. Hookstate library is smaller and faster.

Here is the changes:

Version 1 | Version 2 | Description
-|-|-
`useStateLink` default export | No default export | There is no default export in the 2nd version.
`useStateLink` | `useState` | New function with nearly the same functionality. The returned result of a new type `State` which has got different way of dealing with nested states.
`createStateLink` | `createState` | New function with nearly the same functionality. The returned result of a new type `State` which has got different way of dealing with nested states.
`StateLink` | `State` | New type of a state instance to access and manage a state. See below the details of changes.
`nested` property of `StateLink` | deleted | Use properties of State directly to access [nested states](./nested-state).
`access` property of `StateLink` | deleted | Use State directly to access instead. See [global state](./global-state) docs for more details.
`promised`, `error`, `batch` members of `StateLink` | deleted | Replaced by `map` method. See how to deal with [asynchronous states](./asynchronous-state).
`denull` method of `StateLink` | moved to `ornull` property of `State` / `StateMethods` | See how to deal with [nullable states](./nullable-state).
`with` method of `StateLink` | moved to `attach` of `State` or `StateMethods` | See how to [attach plugins](./extensions-overview) to states.
other properties/methods of `StateLink` | moved to `StateMethods` (and `State` for primitive states) | For a `State` of a primitive value, `get`, `set`, `merge`, `value`, `keys` should be just work without changes. For a `State` of an object / array, `StateMethods` are accessible with `[self]` symbol. In other words, `stateLink.set(...)` becomes `state[self].set(...)`. See how to deal with [nested states](./nested-state).
`StateFragment` | `StateFragment` | `state` property accepts an instance of type `State` but not `StateLink` as before.
`StateMemo` | deleted | `StateMemo` is deleted as it was complex feature with almost no benefit. The same functionality can be more or less achieved with `React.memo` instead.
transform argument of `createStateLink` and `useStateLink` | deleted | [See here](./exporting-state) how to wrap and export states by a custom interface in the new version.
`none` | `none` | Renamed.
