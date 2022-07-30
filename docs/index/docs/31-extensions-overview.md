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
Snapshotable | Enables access to an initial value of a [State](typedoc-hookstate-core#state) and allows to check if the current value of the state is modified (compares with the initial value). Helps with tracking of *modified* form field(s). | [Demo](./extensions-snapshotable) | `@hookstate/snapshotable` | [![npm version](https://img.shields.io/npm/v/@hookstate/snapshotable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/snapshotable)
Validation | Enables validation and error / warning messages for a state. Usefull for validation of form fields and form states. | [Demo](./extensions-validation) | `@hookstate/validation` | [![npm version](https://img.shields.io/npm/v/@hookstate/validation.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/validation)
Localstored | Enables persistence of managed states to browser's local storage. | [Demo](./extensions-localstored) | `@hookstate/localstored` | [![npm version](https://img.shields.io/npm/v/@hookstate/localstored.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/localstored)
Broadcasted | Enables synchronization of a state across browser tabs. | [Demo](./extensions-broadcasted) | `@hookstate/broadcasted` | [![npm version](https://img.shields.io/npm/v/@hookstate/broadcasted.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/broadcasted)

## Development tools

Plugin | Description | Example | Package | Version
-|-|-|-|-
DevTools | Development tools for Hookstate. Install [Chrome browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and [activate the plugin](./devtools) in your app. [Learn more](./devtools) about using the development tools. | [Demo](https://hookstate.js.org/demo-todolist) | `@hookstate/devtools` | [![npm version](https://img.shields.io/npm/v/@hookstate/devtools.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/devtools)

## Special extensions

Plugin | Description | Example | Package | Version
-|-|-|-|-
Identifiable | Allows to assign string metadata to a state. | [Demo](./extensions-identifiable) | `@hookstate/identifiable` | [![npm version](https://img.shields.io/npm/v/@hookstate/identifiable.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/identifiable)
