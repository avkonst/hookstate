---
id: performance-managed-rendering
title: Managed rendering
sidebar_label: Managed rendering
---

import { PreviewSample } from '../src/PreviewSample'

## Downgraded plugin

This plugin allows to opt out from usage tracking. [Performance overview section](./performance-intro) explains what effect it makes. You rarely need to use it as it is purely explicit optimisation technique. Most common application for this is to disable usage tracking for a large object before submitting it to JSON serializer or table dump. For example:

```tsx
const state = useState({ data: some_very_large_object, otherDate: ... })
// disable state usage tracking only for 'data' property
// and it's children
state.data[self].attach(Downgraded)
return <>{JSON.stringify(state.data[self].value)}</>
```

## Untracked plugin

This is a plugin for advanced usecases. It allows to get and set a state without triggering rerendering. It also allows to trigger rerendering even when a state has not been updated. You should understand what you are doing if you decide to use this plugin. Below is the demo of the plugin.

<PreviewSample example="plugin-untracked" />

