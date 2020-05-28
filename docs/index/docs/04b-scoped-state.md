---
id: scoped-state
title: Scoped state
sidebar_label: Scoped state
---

import { PreviewSample } from '../src/PreviewSample'

## Scalable nested state

The biggest challenge for all state management libraries for React is to deal with large states and frequent updates of [nested states](./nested-state). Rerendering of larger states takes longer. The problem becomes worse when many components use the same state, although might be different nested segments of the same state.

While our form above is within 100 fields limit, which is the case for most of the forms in the wild, performance rendering is likely not a problem. However, if our form above is actually a large spreadsheet with 5000 fields, for example, it quickly becomes a problem as every keystroke would cause the entire form to rerender.

Hookstate introduces new concept to solve this problem. We call call it **scoped state**.

### It is simple

Scoped state is elegant, one line solution for the problem of efficient rendering of large states. It works the same way and equally well with local and global states. The idea of the scoped state is to use deeply nested state hooks to allow Hookstate to rerender only affected by state change deeply nested children components. Let's come back to the original [nested state](./nested-state) example:

<PreviewSample example="local-complex-from-documentation" />

To enable the **scoped state**, we would need to replace:

```tsx
const taskState = props.taskState;
```

by

```tsx
const taskState = useState(props.taskState);
```

You can see what effect the scoped state makes in the following interactive example. Set / unset `use scoped state` checkbox and try editing the fields in the form. Colors will change to show which components are re-rendered:

<iframe src="https://hookstate.js.org/demo-todolist" width="100%" height="700px"></iframe>

More detailed comparison of rerendering differences for various types of states is documented in the [performance overview](./performance-intro) page.

### It is efficient

The scoped state makes a form with thousands of fields as responsive as with one field (yes, it is true: we measured the performance): here is the [huge form performance demo](./performance-large-state).

The scoped state also enables most efficient frequent state updates: here is the [huge very dynamic table performance demo](./performance-frequent-updates).

### It is unique

Scoped state is unique feature of Hookstate. There is no other state management library, which we are aware of, offering such a simple and efficient technique. Most of the state management libraries, including Redux, would require:

1. to move the state from local state to a global state or to a `React.useRef` container,
2. to pass field indexes instead of a state to children `TaskEditor` components,
3. to use a state hook on the global state within `TaskEditor` component
4. to apply a selector function for a hook using the passed field index (to make sure every individual child component does not use more than what it needs for rendering)

All these points (1-4) have disadvantages and still do not provide the same performance gain as the scoped state approach does:

1. Exposure of a local state outside of a component is not ideal.
2. Indexes of fields? OK, maybe this is not that complex, because it's only one level of nesting. This approach wouldn't scale well if fields were deeply nested or indexes had dynamic structure, as shown in [recursive state](./recursive-state).
3. Access to the parent's component state via a global reference and a field's index is not ideal.
4. State change for one field triggers execution of the selector function for every field - this is `O(n)` performance in contrast to `O(1)` offered by the scoped state.

> Note: Hookstate has got other technologies built-in, which allow efficient use of a large global states across many different components without using selector functions. But this is another [performance related topic](./performance-overview).

We consider this is the solid reason why the scoped state approach is far better than the methods used by other state management libraries.
