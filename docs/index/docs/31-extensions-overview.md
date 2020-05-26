---
id: extensions-overview
title: Plugins system overview
sidebar_label: Overview
---

import { PreviewSample } from '../src/PreviewSample'

Placeholder. To be completed.


> Please, submit pull request if you would like yours plugin included in the list.

Plugin | Description | Example | Package | Version
-|-|-|-|-
Labelled | Allows to assign unique human readable label to a state. |  | `@hookstate/labelled` | [![npm version](https://img.shields.io/npm/v/@hookstate/labelled.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/labelled)
Initial | Enables access to an initial value of a [`StateLink`](#statelink) and allows to check if the current value of the [`StateLink`](#statelink) is modified (compares with the initial value). Helps with tracking of *modified* form field(s). | [Demo](https://hookstate.js.org/plugin-initial) | `@hookstate/initial` | [![npm version](https://img.shields.io/npm/v/@hookstate/initial.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/initial)
Touched | Helps with tracking of *touched* form field(s). | [Demo](https://hookstate.js.org/plugin-touched) | `@hookstate/touched` | [![npm version](https://img.shields.io/npm/v/@hookstate/touched.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/touched)
Validation | Enables validation and error / warning messages for a state. Usefull for validation of form fields and form states. | [Demo](https://hookstate.js.org/plugin-validation) | `@hookstate/validation` | [![npm version](https://img.shields.io/npm/v/@hookstate/validation.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/validation)
Persistence | Enables persistence of managed states to browser's local storage. | [Demo](https://hookstate.js.org/plugin-persistence) | `@hookstate/persistence` | [![npm version](https://img.shields.io/npm/v/@hookstate/persistence.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/persistence)
Untracked | Enables access to `StateLink`'s `get` and `set` methods which do not track usage or state update. It means these operations do not influence rendering at all. Applicable in specific usecases. You should understand what you are doing when you use it. | [Demo](https://hookstate.js.org/plugin-untracked) | `@hookstate/untracked` | [![npm version](https://img.shields.io/npm/v/@hookstate/untracked.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/untracked)
Downgraded | Turns off optimizations for a StateLink by stopping tracking of it's value usage and assuming the entire state is *used* if StateLink's value is accessed at least once. |  | `@hookstate/core` | [![npm version](https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/core)
Proxy Polyfill | Makes the Hookstate working in older browsers, for example IE11. All features are supported with two known differences in polyfilled behaviour: 1) `StateLink.nested[key]` will return `undefined` if `StateLink.get()[key]` is also `undefined` property. 2) `StateLink.get()[key] = 'some new value'` will not throw but will mutate the object in the state without notifying any of rendered components or plugins. | [Demo](https://github.com/avkonst/hookstate/tree/master/experimental/ie11) | `@hookstate/proxy-polyfill` | [![npm version](https://img.shields.io/npm/v/@hookstate/proxy-polyfill.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/proxy-polyfill)
