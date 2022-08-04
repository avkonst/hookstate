---
id: migrating-to-v4
title: Migrating to version 4
sidebar_label: Migrating to version 4
---

We are in the transitionary state developing, releasing and battle testing Hookstate 4 RC (release candidates) versions.
Once we finish stabilizing the 4th major release, we will provide all of the details on the migration.
Before then, you are advised to state with the latest release of the 3rd version.

The list of changes:

Version 3 | Version 4 | Description
-|-|-

<!-- `State.[self]` | N/A | `self` property has been removed. It is not necessary to use `[self]` property anymore in order to access state methods. Check out update [nested states](./nested-state) section for details about accessing nested states and state methods.
`StateMethods.keys()` | `StateMethods.key` | `keys` now is a property, not a method.
`StateMethods.map(...)` | N/A | `map` method has been removed as it was confusing and conflicting with `Array.map`. [Asynchronous state](./asynchronous-state) and [Exporting state](./exporting-state) sections have been updated to use the alternative to `map` syntax. -->
