---
id: migrating-to-v4
title: Migrating to version 4
sidebar_label: Migrating to version 4
---

## How to migrate from v3 to v4?

- Update your app dependencies for `@hookstate/core` to the version `4.0.0-rc21` (**this exact version**). Leave the plugins at the latest version 3.
- Make your app running again. It should be fairly smooth as `4.0.0-rc21` version is the last version of Hookstate-4, which supported Hookstate-3 plugins, and has only a couple rarely used feature removed.
- Move Hookstate-3 plugins to corresponding Hookstate-4 extensions.
- Port your custom plugins to Hookstate-4 extensions interface.
- Update all `@hookstate/*` dependencies to the latest `4.x` version of Hookstate.

## Changes overview

Hookstate-4 is a major release of Hookstate from the version 3 with non-backward compatible API and behavior changes.

### What is new?

- The biggest feature of Hookstate-4 is support for useEffect, useMemo and other React functions which take dependency lists. Hookstate is the first state management library which makes it possible for a mutable data source to work with dependency lists.
- The next big feature is type safe extensions. Previously known as plugins. Extensions are type safe and allow to add custom extension methods and properties to a State object. There are also new standard extensions which enable serialization, cloning and other features which are typically used in advanced large applications.
- Hookstate-4 can hold values of any type, including instances of custom classes and standard classes, like Date.
- Hookstate-4 supports React 18 and its strict mode.
- Hookstate-4 integrates asynchronous state with React 18 Suspend feature.
- `isHookstate` and `isHookstateValue` allow to check any variable if it is a State of a value of a State.
- `configure` function helps to setup the Hookstate module for development and other specific environments. This enabled some undisclosed commercial application to be moved from Angular to React smoothly, having the state managed by Hookstate and shared / used by both frameworks.

### What has changed?

Version 3 | Version 4 | Description
-|-|-
State object is new on each rerender | State object is stable | useHookstate returns the same instance of State object if the subscribed State has not changed. It allows the State instance be used in dependency lists of useEffect and other hooks correctly as any other regular variables.
createState, createHookstate | hookstate | Global state creation function has changed its name and signature
useState | useHookstate | State subscription function has changed its name and signature. This function name also works with React development tools
State.destroy | destroy | Destruction of a global state is done by a Hookstate module destroy function, but not a method.  
Downgraded | `State.get({ noproxy: true })` | Downgraded plugin is gone. There is now the explicit interface to get the original object without it being wrapped in a proxy.
Untracked | `State.get({ silent: true }) | Untracked plugin has been replaced by type safe more explicit interface. 
State.attach | hookstate, useHookstate, extend | Attach method is replaced by the extension argument of `hookstate` and `useHookstate` functions + `extend` function allows to combine multiple extensions.
State.value/get writable | State.value/get is immutable | Hookstate-4 prevents the state value being modified directly by the Typescript "deep readonly" typing.
Misleading State source switchover possible | State switchover is an error | Hookstate-4 throws an error when useHookstate receives a value, which requires to hook into a different data source on rerender. 
State.batch | React native | State updates batching is now supported by React natively
postpone | State.promise | It is possible to provide `then` callback for the asynchronous state.
IE11 support | No IE11 support | Dropped legacy feature. 
Devtools globally enabled | Devtools enabled per state | Devtools is an extension in Hookstate 4, and should be enabled on per State basis like other extensions.
 