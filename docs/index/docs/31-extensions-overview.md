---
id: extensions-overview
title: Plugins system overview
sidebar_label: Overview
---

import { PreviewSample } from '../src/PreviewSample'

> Please, submit pull request if you would like yours plugin included in the list.

## Standard extensions

Plugin | Description | Example | Package | Version
-|-|-|-|-
Initial | Enables access to an initial value of a [State](typedoc-hookstate-core#state) and allows to check if the current value of the state is modified (compares with the initial value). Helps with tracking of *modified* form field(s). | [Demo](./extensions-initial) | `@hookstate/initial` | [![npm version](https://img.shields.io/npm/v/@hookstate/initial.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/initial)
Touched | Helps with tracking of *touched* form field(s). | [Demo](./extensions-touched) | `@hookstate/touched` | [![npm version](https://img.shields.io/npm/v/@hookstate/touched.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/touched)
Validation | Enables validation and error / warning messages for a state. Usefull for validation of form fields and form states. | [Demo](./extensions-validation) | `@hookstate/validation` | [![npm version](https://img.shields.io/npm/v/@hookstate/validation.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/validation)
Persistence | Enables persistence of managed states to browser's local storage. | [Demo](./extensions-persistence) | `@hookstate/persistence` | [![npm version](https://img.shields.io/npm/v/@hookstate/persistence.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/persistence)

## Development tools

Plugin | Description | Example | Package | Version
-|-|-|-|-
DevTools | Development tools for Hookstate. Install [Chrome browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and [activate the plugin](./devtools) in your app. [Learn more](./devtools) about using the development tools. | [Demo](https://hookstate.js.org/demo-todolist) | `@hookstate/devtools` | [![npm version](https://img.shields.io/npm/v/@hookstate/devtools.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/devtools)
Logger | Simpler alternative to development tools. Logs state updates and current value of a state to the development console. | | `@hookstate/logger` | [![npm version](https://img.shields.io/npm/v/@hookstate/logger.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/logger)

## Special extensions

Plugin | Description | Example | Package | Version
-|-|-|-|-
Labelled | Allows to assign string metadata to a state. | [Demo](./extensions-labelled) | `@hookstate/labelled` | [![npm version](https://img.shields.io/npm/v/@hookstate/labelled.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/labelled)
Untracked | It allows to get and set a state without triggering rerendering. It also allows to trigger rerendering even when a state has not been updated. You should understand what you are doing if you decide to use this plugin. | [Demo](./performance-managed-rendering#untracked-plugin) | `@hookstate/untracked` | [![npm version](https://img.shields.io/npm/v/@hookstate/untracked.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/untracked)
Downgraded | Turns off optimizations for a StateLink by stopping tracking of it's value usage and assuming the entire state is *used* if StateLink's value is accessed at least once. | [Docs](./performance-managed-rendering) | `@hookstate/core` | [![npm version](https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/core)

## Compatibility extensions

Plugin | Description | Example | Package | Version
-|-|-|-|-
Proxy Polyfill | Makes the Hookstate working in older browsers, for example IE11. All features are supported with two known differences in polyfilled behaviour: 1) `State[key]` will return `undefined` if `State[self].value[key]` property does not exist. 2) `State[self].value[key] = 'some new value'` will not throw but will mutate the object in the state without notifying any of rendered components or plugins. | [Demo](https://github.com/avkonst/hookstate/tree/master/docs/demos/ie11) | `@hookstate/proxy-polyfill` | [![npm version](https://img.shields.io/npm/v/@hookstate/proxy-polyfill.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/proxy-polyfill)
