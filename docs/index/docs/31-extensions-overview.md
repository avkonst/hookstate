---
id: extensions-overview
title: Extensions overview
sidebar_label: Overview
---

import { PreviewSample } from '../src/PreviewSample'

> Please, submit pull request if you would like your extensions included in the list.

## Standard extensions

Extension | Description | Example | Package | Version
-|-|-|-|-
Clonable | Defines state cloning capabilities. |  | `@hookstate/clonable` | [![npm version](https://img.shields.io/npm/v/@hookstate/clonable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/clonable)
Comparable | Defines state comparison capabilities. |  | `@hookstate/comparable` | [![npm version](https://img.shields.io/npm/v/@hookstate/comparable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/comparable)
Serializable | Adds serialization and deserialization capabilities to a state. |  | `@hookstate/serializable` | [![npm version](https://img.shields.io/npm/v/@hookstate/serializable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/serializable)
Identifiable | Enable state labeling and identification by string identifier. |  | `@hookstate/identifiable` | [![npm version](https://img.shields.io/npm/v/@hookstate/identifiable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/identifiable)
Initializable | Provides a way to run one off initialization callback after a state is created. |  | `@hookstate/initializable` | [![npm version](https://img.shields.io/npm/v/@hookstate/initializable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/initializable)
Subscribable | Make it easier to subscribe a custom callback to state changes. | [Demo](./extensions-subscribable) | `@hookstate/subscribable` | [![npm version](https://img.shields.io/npm/v/@hookstate/subscribable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/subscribable)
Snapshotable | Enables access to an initial value of a [State](typedoc-hookstate-core#state) and allows to check if the current value of the state is modified (compares with the initial value). Helps with tracking of *modified* form field(s). | [Demo](./extensions-snapshotable) | `@hookstate/snapshotable` | [![npm version](https://img.shields.io/npm/v/@hookstate/snapshotable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/snapshotable)
Validation | Enables validation and error / warning messages for a state. Useful for validation of form fields and form states. | [Demo](./extensions-validation) | `@hookstate/validation` | [![npm version](https://img.shields.io/npm/v/@hookstate/validation.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/validation)
Localstored | Enables persistence of managed states to browser's local storage. | [Demo](./extensions-localstored) | `@hookstate/localstored` | [![npm version](https://img.shields.io/npm/v/@hookstate/localstored.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/localstored)
Broadcasted | Enables synchronization of a state across browser tabs. | [Demo](./extensions-broadcasted) | `@hookstate/broadcasted` | [![npm version](https://img.shields.io/npm/v/@hookstate/broadcasted.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/broadcasted)

## Development tools

Plugin | Description | Example | Package | Version
-|-|-|-|-
DevTools | Development tools for Hookstate. Install [Chrome browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and [activate the plugin](./devtools) in your app. [Learn more](./devtools) about using the development tools. | [Demo](https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist) | `@hookstate/devtools` | [![npm version](https://img.shields.io/npm/v/@hookstate/devtools.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/devtools)
Logged | Enables logging into the development console (or elsewhere if specified) when state is created, updated and destroyed. |  | `@hookstate/logged` | [![npm version](https://img.shields.io/npm/v/@hookstate/logged.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/logged)
