---
id: performance-batched-updates
title: Batching state updates
sidebar_label: Batching updates
---

import { PreviewSample } from '../src/PreviewSample'

If you have got an event handler, which results in multiple state update actions
(for the same nested part of a state or different),
you can batch updates together. Batched updates trigger rerendering only once for each affected component.
Use [StateMethods.map](typedoc-hookstate-core#map) method with batch context argument to activate batching:

```tsx
const state = useState({ a: 0, b: 0 })
return <button onClick={() => {
    state.map(
        // this function is executed as a batch
        (s) => {
            // multiple state updates,
            // one rerender
            s.a.set(p => p + 1)
            s.b.set(p => p + 1)
        }, 'custom-batch-context')
}}>{state.a.value + state.b.value}</button>
```

Context argument can be anything. It is passed down to plugins, which may use it to implement transactional persistence, for example.

