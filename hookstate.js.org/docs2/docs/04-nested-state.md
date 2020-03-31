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

All these points (1-4) have got disadvantages but still do not provide with the same performance gain as the scopped state does:

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

[StateLink.denull](typedoc-hookstate-core.md#denull) function is a very convenient method to deal with nullable and undefined value states. Here is the example of a component, which receives a state, those state value might be null.

```tsx
const MyInputField = (props: { state: StateLink<string | null>}) => {
    const state: StateLink<string> | null = props.state.denull();
    // state is either null or an instance of StateLink<string>:
    if (!state) {
        // state value was null, do not render form field
        return <></>;
    }
    // state.value is an instance of string, can not be null here:
    return <input value={state.value} onChange={(v) => state.set(v.target.value)} />
}
```

## Advanced mutations for an object state 

### Getting names of existing properties

Let's consider we have got the following state:

```tsx
const state = useStateLink({ a: 1, b: 2 })
```

`state.keys()` returns an array of names of existing properties. It is equivalent to `Object.keys(state.value)` or `Object.keys(state.nested)`.

```tsx
const keys = state.keys() // will be ['a', 'b'] for the above example
```

Learn more about [StateLink.keys](typedoc-hookstate-core.md#keys) in the API reference.

### Updating existing property

For a given state:

```tsx
const state = useStateLink({ a: 1, b: 2 })
```

The most efficient and recommended methods to update nested property are the following: 
```tsx
state.nested.a.set(p => p + 1) // increments value of property a
// or
state.nested['a']set(p => p + 1)
// or
state.merge(p => ({ a: p.a + 1 }))
```
It sets only property `a`, so it will rerender every component where property `a` is used.

#### Avoid the following:

There are alternative less efficient methods, but resulting in the same mutation and data state. The following sets the entire object state to the new value (although, only `a` property is changed), so it will rerender every component where **any** property of the state is used.

```tsx
state.set(p => ({ ...p, a: p.a + 1 }))
```

The following sets only property `a` but uses the current property value via the [StateLink.value](typedoc-hookstate-core.md#value), which marks the property `a` as used by a component even if it was not used during the last rendering. In other words using nested property state in rendering or in action dispatch
has got the same effect: a component is rerendered on property update.
```tsx
state.nested['a'].set(state.value.a + 1) // increments value of property a
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Adding new property

For a given state:

```tsx
const state = useStateLink<{ a: number, b?: number }>({ a: 1 }) // notice b property is optional
```

The recommended methods to add new nested property are the following: 
```tsx
state.nested.b.set(2)
// or 
state.nested['b'].set(2)
// or
state.merge({ b: 2 })
```

Notice the `state.nested` object has got **any** property defined
(although not every property might pass Typescript compiler check).
It allows to add new properties to the state using the same method as for updating of a property.

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => ({ ...p, b: 2 }))
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Deleting existing property

For a given state:

```tsx
const state = useStateLink<{ a: number, b?: number }>({ a: 1, b: 2 }) // notice b property is optional
```

The recommended methods to delete a property are the following: 
```tsx
import { None } from '@hookstate/core'

state.nested.b.set(None)
// or
state.nested['b'].set(None)
// or
state.merge({ b: None })
```

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => {
    delete p.b
    return p
})
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Swapping two properties

For a given state:

```tsx
const state = useStateLink<Record<string, number>>({ a: 1, b: 2 })
```

The recommended method to swap properties is the following: 
```tsx
state.merge(p => ({ b: p.a, a: p.b }))
```

#### Avoid the following

as it can be potentially less efficient than the above recommended method:

```tsx
state.set(p => {
    const tmp = p.a;
    p.a = p.b;
    p.b = tmp;
    return p
})
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Partial updates and deletions

You may noticed the usage of [StateLink.merge](typedoc-hookstate-core.md#merge) above. This does partial update to the state and can insert, update and delete properties all in one call:

```tsx
const state = useStateLink<Record<string, number>>({
    propertyToUpdate: 1,
    propertyToDelete: 2
})
state.merge({
    propertyToUpdate: 2,
    propertyToDelete: None,
    propertyToAdd: 1
}) // state value will be: { propertyToUpdate: 2, propertyToAdd: 1 }
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

## Advanced mutations for an array state

### Getting indexes of existing elements

Let's consider we have got the following state:

```tsx
const state = useStateLink([1, 2])
```

`state.keys()` returns an array of numbers of existing indexes. It is equivalent to `Object.keys(state.value)` or `Object.keys(state.nested)` but includes only indexes as numbers (not as strings, like for an object state).

```tsx
const keys = state.keys() // will be [0, 1] for the above example
```

Learn more about [StateLink.keys](typedoc-hookstate-core.md#keys) in the API reference.

### Updating existing element

For a given state:

```tsx
const state = useStateLink([1, 2])
```

The most efficient and recommended methods to update nested element are the following: 
```tsx
state.nested[0].set(p => p + 1) // increments value of an element at 0 position
// or
state.merge(p => ({ 0: p[0] + 1 }))
```
It sets only element at `0`, so it will rerender every component where this element is is used.

#### Avoid the following:

There are alternative less efficient methods, but resulting in the same mutation and data state. The following sets the entire array state to the new value (although, only `0` index is changed), so it will rerender every component where **any** property of the state is used.

```tsx
state.set(p => ([p[0] + 1].concat(p.slice(1))))
```

The following sets only property `0` but uses the current property value via the [StateLink.value](typedoc-hookstate-core.md#value), which marks the property `0` as used by a component even if it was not used during the last rendering. In other words using nested property state in rendering or in action dispatch
has got the same effect: a component is rerendered on property update.

```tsx
state.nested[0].set(state.value[0] + 1) // increments value of an element at 0
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Appending new element

For a given state:

```tsx
const state = useStateLink([1000])
```

The recommended methods to add new element are the following: 
```tsx
state.nested[state.value.length].set(2000)
// or 
state.merge([2000])
```

Notice the `state.nested` object has got **any** index defined.
It allows to extend array state using the same method as for updating of an existing element.

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => p.concat([2000]))
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Deleting existing element

For a given state:

```tsx
const state = useStateLink([1000, 2000, 3000])
```

The recommended methods to delete an element are the following: 
```tsx
import { None } from '@hookstate/core'

state.nested[1].set(None)
// or
state.merge({ 1: None })
```

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => {
    delete p[1]
    return p
})
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Concatenating with another array

For a given state:

```tsx
const state = useStateLink([1000, 2000])
```

The recommended method to append another array is the following: 
```tsx
state.merge([3000, 4000])
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Swapping two elements

For a given state:

```tsx
const state = useStateLink([1000, 2000])
```

The recommended method to swap elements is the following: 
```tsx
state.merge(p => ({ 1: p[0], 0: p[1] }))
```

#### Avoid the following

as it can be potentially less efficient than the above recommended method:

```tsx
state.set(p => {
    const tmp = p[0];
    p[0] = p[1];
    p[1] = tmp;
    return p
})
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Partial updates and deletions

You may noticed the usage of [StateLink.merge](typedoc-hookstate-core.md#merge) above. This does partial update to the state and can insert, update and delete array elements all in one call:

```tsx
const state = useStateLink([1000, 2000, 3000])
state.merge({
    0: 2,
    1: None,
    3: 4000
}) // state value will be: [2, 3000, 4000]
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.

## Advanced mutations for a string state 

### Concatenating with another string

For a given state:

```tsx
const state = useStateLink("Hello ")
```

The recommended method to append another string is the following: 
```tsx
state.merge(" World") // state.value will be "Hello World"
```

Learn more about [StateLink.set](typedoc-hookstate-core.md#set) and [StateLink.merge](typedoc-hookstate-core.md#merge) in the API reference.