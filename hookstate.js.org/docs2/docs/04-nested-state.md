---
id: nested-state
title: Nested state
sidebar_label: Nested state
---

import { PreviewSample } from '../src/PreviewSample'

[Local state](./local-state) and [Global state](./global-state) sections show examples, where state data is a primitive value. Next, we will have a look into one of the most powerful features of the Hookstate - the interface to a nested state of a complex object state. The interface is the same for local and global states and works equally well for both cases.

## Accessing and mutating nested state

Let's consider the following example where a state value is an array of objects. It demonstrates how to dive into nested state of the array and deep nested state of an element
of the array. The state of an element is passed to a child component as a property. The child component gets and sets the deep nested state. 

<PreviewSample example="local-complex-from-documentation" />

As you can see, all the power and flexibility is really behind one `nested` function, which
allows to *walk* complex states and target individual deep nested property for update.
Read more about [StateLink.nested](typedoc-hookstate-core#nested), [StateLink.get](typedoc-hookstate-core#get) and [StateLink.set](typedoc-hookstate-core#set) in the [API reference](typedoc-hookstate-core).

## Scopped state: scalable nested state

The biggest challenge for all state management libraries for React is to deal with large states and frequent updates of nested states. Rerendering of larger states takes longer. The problem becomes worse when many components use the same state, although might be different nested segments of the same state.

While our form above is within 100 fields limit, which is the case for most of the forms in the wild, performance rendering is likely not a problem. However, if our form above is actually a large spreadsheet with 5000 fields, for example, it quickly becomes a problem as every keystroke would cause the entire form to rerender.

### It is simple

Hookstate offers elegant one line solution to this problem. It works the same way and equally well with local and global states. We use the term **scoped state** to name and refer to this performance boost technique. The idea of the scoped state is to use deeply nested state hooks to allow Hookstate to rerender only affected by state change deeply nested children components. For the above example the scopped state for `TaskEditor` component would be the following:

```tsx
const taskState = useStateLink(props.taskState);
```

instead of:

```tsx
const taskState = props.taskState;
```

You can see what effect it makes in the following interactive example. Set / unset `use scopped state` checkbox and try editing the fields in the form:

<iframe src="https://hookstate.js.org/demo-todolist" width="100%" height="700px"></iframe>

### It is efficient

The scopped state makes a form with thousands of fields as responsive as with one field (yes, it is true: we measured the performance): here is the [huge form performance demo](./performance-large-state).

The scopped state also enables most efficient frequent state updates: here is the [huge very dynamic table performance demo](./performance-frequent-updates).

### It is unique

Scopped state is unique feature of Hookstate. There is no other state management library, which we are aware of, offering such a simple and efficient technique. Most of the state management libraries, including Redux, would require:

1. to move the state from local state to a global state or to a `React.useRef` container,
2. to pass field indexes instead of a state to children `TaskEditor` components,
3. to use a state hook on the global state within `TaskEditor` component
4. to apply a selector function for a hook using the passed field index (to make sure every individual child component does not use more than what it needs for rendering)

All of these points (1-4) have got disadvantages but still do not provide with the same performance gain as the scopped state does:

1. exposure of a local state outside of a component is not ideal
2. indexes of fields? ok, maybe this is not much complex, because this is only one level of nesting. This would quickly become non scalable approach, if fields were deeply nested or indexes had dynamic structure, like for the [recursive state](./recursive-state).
3. access to the parent's component state via a global reference and a field's index is not ideal
4. state change for one field triggers execution of the selector function for every field - this is `O(n)` performance in contrast to `O(1)` offered by the scopped state.

> Note: Hookstate has got other technologies built-in, which allow efficient use of a large global states across many different components without using selector functions. But this is another [performance related topic](./performance-overview).

We consider this is the solid reason why the scopped state approach is far better than the methods used by other state management libraries.

## Dealing with nullable state

denull

## Advanced mutations for an array state 

### Updating existing element

### Appending new element

### Deleting existing element

### Concatenating with another array

### Swapping two elements

### Partial updates and deletions

## Advanced mutations for an object state 

TODO document LinkState.keys

### Updating existing property

### Adding new property

### Deleting existing property

### Swapping two properties

### Partial updates and deletions

## Advanced mutations for a string state 

### Updating existing property

### Concatenating with another string
