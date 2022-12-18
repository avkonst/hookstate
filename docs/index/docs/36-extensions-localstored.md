---
id: extensions-localstored
title: Localstored state
sidebar_label: Localstored state
---

import { PreviewSample } from '../src/PreviewSample'

Simple plugin which enables local storage persistence for a state.
- It works same way for local and global states
- An application can provide storage engine instance to allow for storing the data elsewhere. By default it stores it in a local browser storage.
- Setting a state to `none` will delete the persisted data from the storage.

<PreviewSample example="plugin-localstored" />

