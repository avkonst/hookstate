---
id: migrating-to-v3
title: Migrating to version 3
sidebar_label: Migrating to version 3
---

Version 3 API becomes simpler.

Here is the changes:

Version 2 | Version 3 | Description
-|-|-
`State.[self]` | N/A | `self` property has been removed. It is not necessary to use `[self]` property anymore in order to access state methods. Check out update [nested states](./nested-state) section for details about accessing nested states and state methods.
`StateMethods.keys()` | `StateMethods.key` | `keys` now is a property, not a method.
`StateMethods.map(...)` | N/A | `map` method has been removed as it was confusing and conflicting with `Array.map`. [Asynchronous state](./asynchronous-state) and [Exporting state](./exporting-state) sections have been updated to use the alternative to `map` syntax.
