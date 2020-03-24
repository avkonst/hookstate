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

If a state can be missing (eg. nested property is undefined) or null, checking for null state value is essential before diving into the nested states.

Typescript will fail a compilation if you attempt to work with nested states of a state, which might have null or underfined state value. For example:

```tsx
interface Task { name: string, priority?: number }

const MyComponent = () => {
    const state = useStateLink<Task | null>(null)
    
    // JS - runtime error, TS - compilation error
    state.nested.name
    // JS - runtime error, TS - compilation error
    state.value.name
}
```

Here is the simplest way to check for null before unfolding nested states:

```tsx
if (state.nested) {
    // no compilation and runtime errors
    state.nested.name

    // no runtime error, but compilation error
    // since state.value can be null
    state.value.name
}
```

Here is the other way:

```tsx
if (state.value) {
    // no runtime error, but compilation error
    // since state.value can be null
    state.nested.name

    // no compilation and runtime errors
    state.value.name
}
```

The complete check to please the compiler would be:
```tsx
if (state.value && state.nested) {
    // no compilation and runtime errors
    state.nested.name

    // no compilation and runtime errors
    state.value.name
}
```

However, there is one more way using [StateLink.denull](typedoc-hookstate-core.md#denull) function.
```tsx
const stateOrNull = state.denull()
if (stateOrNull) {
    // no compilation and runtime errors
    stateOrNull.nested.name

    // no compilation and runtime errors
    stateOrNull.value.name
}
```

[StateLink.denull](typedoc-hookstate-core.md#denull) function is a very confient method to deal with nullable states. Here is the example of a component, which receives a state, those state value might be null.

```tsx
const MyInputField = (props: { state: StateLink<string | null | undefined>}) => {
    const state = props.state.denull();
    // state is either null or an instance of StateLink<string>:
    if (!state) {
        // state value was null, do not render form field
        return <></>;
    }
    // state.value is an instance of string, can not be null here:
    return <input value={state.value} onChange={(v) => state.set(v.target.value)} />
}
```

## Advanced mutations for an array state 

### Getting indexes of existing elements

### Updating existing element

### Appending new element

### Deleting existing element

### Concatenating with another array

### Swapping two elements

### Partial updates and deletions

## Advanced mutations for an object state 

TODO document LinkState.keys

### Getting names of existing properties

For a give `state` variable of `StateLink` type, the result of `Object.keys(state.nested)` is the same as `Object.keys(state.value)` and the same as `state.keys()`.
However, the `state.nested` object will have **ANY** property defined
(although not every property might pass Typescript compiler check).
It gives a lot of flexibility to manage states of potentially non-existing / undefined properties.

Let's say an object might have an undefined or missing property (`priority` in the example below):

```tsx
interface Task { name: string, priority?: number }
```

And we have got a component managing it's state.

```tsx
const MyComponent = () => {
    const state = useStateLink<Task>({ name: 'A task' })
    // state.nested.property will be defined and
    // will be an object of type StateLink<number | undefined>
    return <MyPriorityEditor state={state.nested.property} />
}

const MyPriorityEditor = (props: { state: StateLink<number | undefined> }) => {
    return <select onChange={e => Number(e.target.value)}>
        <option value="0" selected={!props.state.value}>None</option>
        <option value="1" selected={props.state.value === 1}>Low</option>
        <option value="2" selected={props.state.value === 2}>High</option>
    </select>
}
```

Notice that on the first selection event, the `priority` property will be set to a value by the child component and added to the `Task` state object created by the parent component. Child component does know if it deals with a nested state or root state (although it could use [LinkState.path](typedoc-hookstate-core.md#path) to detect this), it just manages state value pointed out by the provided state link.

This feature of the [StateLink.nested](typedoc-hookstate-core.md#nested) is also very convenient for managing dynamic dictionaries, for example:

```tsx
const state = useStateLink<Record<string, number>>({});
// initially:
state.value; // will be {}
state.nested['newProperty'].value; // will be undefined
// setting non existing nested property:
state.nested['newProperty'].set('newValue');
// will update the state to:
state.value; // will be { newProperty: 'newValue' }
state.nested['newProperty'].value; // will be 'newValue'
```

### Updating existing property

### Adding new property

### Deleting existing property

### Swapping two properties

### Partial updates and deletions

## Advanced mutations for a string state 

### Updating existing property

### Concatenating with another string
