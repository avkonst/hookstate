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

As you can see, a state mirrors the actual properties of the corresponding state value.
State of an array is an array of states. State of an object is an object of states.
We can deal with a state of an object like with any other variable, including 
passing it as a component property, like in the example above.

We can dive to the deeply nested states of primitive values and set it, like
we set the name property of a task in the `TaskEditor` component: `taskState.name.set(e.target.value)`.

We can also set a state of an object to the entire new object. In the example above,
we append new element to the state of tasks, using `merge` method: `state.merge([{ name: 'Untitled' }])`.

## `nested` state method

You may noticed, that a state object mixes properties from the state value object (eg. `name` property from
`taskState` state) and state methods (eg. `merge` property from [StateMethods](typedoc-hookstate-core#interfacesstatemethodsmd) interface). It is very likely that names of properties from your state objects will not collide with names of state methods.
In other words, your objects are unlikely to have properties named, like `merge`, `set`, `get`, etc.
Although, it is more likely your objects may have properties with names like `value` or `error`, which also
exist in state methods.

If the collision happens for whatever property name, properties 
from state methods take priority and "hide" access to nested states via `.` syntax. However,
there is a `nested` state method, which allows to access nested state by name. For example
`taskState.nested("name")` would give access to the same nested state as `taskState.name` in the example above.
So, if it ever happens
your `state` object has got a property with name, for example `set`, which collides with the corresponding
state method, you would be able to obtain the nested state behind the `set` property using nested method: `state.nested("set")`.

It is also necessary to use `nested` method instead of property access by index syntax,
when a property name is unknown at compile time and comes as a variable of type `string` or `number`, for
example, if you have got the state defined as the following, which allows for dynamic names of nested properties:

```tsx
const dictionaryState = createState<Record<string, number>>({})
function NestedStateByName(props: { stateKey: string }) {
    const state = useState(dictionaryState)
    ...
}
```

you are required to use `nested` method:

```tsx
state.nested(props.stateKey).value
```

as the following would not be allowed by the typescript compiler:

```tsx
state[props.stateKey].value
```

However, if your dynamic property name is from a set of names, which are known at compile time
and do not collide with state methods, you would be able to use property access by index syntax. For example:

```tsx
const dictionaryState = createState<Record<string, number>>({})
function NestedStateByName(props: {
        // note: compiler knows allowed names
        stateKey: 'property1' | 'property2'
    }) {
    const state = useState(dictionaryState)
    // so access by index works, which would be equivalent to:
    // state.nested(props.stateKey).value
    return <>{state[props.stateKey].value}</>
}
```

Below, you will find more about available methods for managing nested states.

## Advanced mutations for an object state 

### Setting new state value 

Let's consider we have got the following state:

```tsx
const state = useState({ a: 1, b: 2 })
```

One of the state methods is `set`, which is used to set new state value.

```tsx
state.set({ a: 2, b: 3 })
```

New state value can be also a function, which returns new value taking the previous one:

```tsx
state.set(p => { a: p.a + 1, b: p.b - 1 })
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) in the API reference.

### Getting names of existing properties

Let's consider we have got the following state:

```tsx
const state = useState({ a: 1, b: 2 })
```

`state.keys` returns an array of names of existing properties. It is equivalent to `Object.keys(state)` or `Object.keys(state.value)`.

```tsx
const keys = state.keys // will be ['a', 'b'] for the above example
```

Learn more about [StateMethods.keys](typedoc-hookstate-core.md#readonly-keys) in the API reference.

### Updating existing property

For a given state:

```tsx
const state = useState({ a: 1, b: 2 })
```

The most efficient and recommended methods to update nested property are the following: 
```tsx
state.a.set(p => p + 1) // increments value of property a
// or
state['a'].set(p => p + 1)
// or
state.merge(p => ({ a: p.a + 1 }))
```
It sets only property `a`, so it will rerender every component where property `a` is used.

#### Avoid the following:

There are alternative less efficient methods, but resulting in the same mutation and data state. The following sets the entire object state to the new value (although, only `a` property is changed), so it will rerender every component where **any** property of the state is used.

```tsx
state.set(p => ({ ...p, a: p.a + 1 }))
```

The following sets only property `a` but uses the current property value via the [StateMethods.value](typedoc-hookstate-core.md#readonly-value), which marks the property `a` as used by a component even if it was not used during the last rendering. In other words using nested property state in rendering or in action dispatch
has got the same effect: a component is rerendered on property update.
```tsx
state['a'].set(state.a.value + 1) // increments value of property a
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Adding new property

For a given state:

```tsx
const state = useState<{ a: number, b?: number }>({ a: 1 }) // notice b property is optional
```

The recommended methods to add new nested property are the following: 
```tsx
state.b.set(2)
// or 
state['b'].set(2)
// or
state.merge({ b: 2 })
```

Notice the `state` object has got **any** property defined (it is not the case in IE11),
although not every property might pass Typescript compiler check.
We accessed non existing property `b` and set it's state.
It represents the fact the state of `undefined` property is actually defined state object,
which can be used to set `undefined` property to a new value.

It allows to add new properties to the state using the same method as for updating a property.

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => ({ ...p, b: 2 }))
```

But this is the only available method for IE11.

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Deleting existing property

For a given state:

```tsx
const state = useState<{ a: number, b?: number }>({ a: 1, b: 2 }) // notice b property is optional
```

The recommended methods to delete a property are the following: 
```tsx
import { none } from '@hookstate/core'

state.b.set(none)
// or
state['b'].set(none)
// or
state.merge({ b: none })
```

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => {
    delete p.b
    return p
})
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Swapping two properties

For a given state:

```tsx
const state = useState<Record<string, number>>({ a: 1, b: 2 })
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

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Partial updates and deletions

You may noticed the usage of [StateMethods.merge](typedoc-hookstate-core.md#merge) above. This does partial update to the state and can insert, update and delete properties all in one call:

```tsx
const state = useState<Record<string, number>>({
    propertyToUpdate: 1,
    propertyToDelete: 2
})
state.merge({
    propertyToUpdate: 2,
    propertyToDelete: none,
    propertyToAdd: 1
}) // state value will be: { propertyToUpdate: 2, propertyToAdd: 1 }
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

## Advanced mutations for an array state

### Setting new state value 

Let's consider we have got the following state:

```tsx
const state = useState([1, 2])
```

Use `set` state methods to set new state value:

```tsx
state.set([2, 3])
```

New state value can be also a function, which returns new value taking the previous one:

```tsx
state.set(p => [p[0] + 1, p[1] - 1])
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) in the API reference.

### Getting indexes of existing elements

Let's consider we have got the following state:

```tsx
const state = useState([1, 2])
```

`state.keys` returns an array of numbers of existing indexes. It is equivalent to `Object.keys(state)` or `Object.keys(state.value)` but includes only indexes as numbers (not as strings, like for an object state).

```tsx
const keys = state.keys // will be [0, 1] for the above example
```

Learn more about [StateMethods.keys](typedoc-hookstate-core.md#keys) in the API reference.

### Updating existing element

For a given state:

```tsx
const state = useState([1, 2])
```

The most efficient and recommended methods to update nested element are the following: 
```tsx
state[0].set(p => p + 1) // increments value of an element at 0 position
// or
state.merge(p => ({ 0: p[0] + 1 }))
```
It sets only element at `0`, so it will rerender every component where this element is used.

#### Avoid the following:

There are alternative less efficient methods, but resulting in the same mutation and data state. The following sets the entire array state to the new value (although, only `0` index is changed), so it will rerender every component where **any** property of the state is used.

```tsx
state.set(p => ([p[0] + 1].concat(p.slice(1))))
```

The following sets only property `0` but uses the current property value via the [StateMethods.value](typedoc-hookstate-core.md#value), which marks the property `0` as used by a component even if it was not used during the last rendering. In other words using nested property state in rendering or in action dispatch
has got the same effect: a component is rerendered on property update.

```tsx
state[0].set(state[0].value + 1) // increments value of an element at 0
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Appending new element

For a given state:

```tsx
const state = useState([1000])
```

The recommended methods to add new element are the following: 
```tsx
state[state.length].set(2000)
// or 
state.merge([2000])
```

Notice the `state` object has got **any** index defined (it is not the case in IE11).
It allows to extend array state using the same method as for updating of an existing element.

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => p.concat([2000]))
```

But this is the only method available for IE11 environment.

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Deleting existing element

For a given state:

```tsx
const state = useState([1000, 2000, 3000])
```

The recommended methods to delete an element are the following: 
```tsx
import { none } from '@hookstate/core'

state[1].set(none)
// or
state.merge({ 1: none })
```

#### Avoid the following

as it can be potentially less efficient than the above recommended methods:

```tsx
state.set(p => {
    delete p[1]
    return p
})
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Concatenating with another array

For a given state:

```tsx
const state = useState([1000, 2000])
```

The recommended method to append another array is the following: 
```tsx
state.merge([3000, 4000])
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Swapping two elements

For a given state:

```tsx
const state = useState([1000, 2000])
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

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

### Partial updates and deletions

You may noticed the usage of [StateMethods.merge](typedoc-hookstate-core.md#merge) above. This does partial update to the state and can insert, update and delete array elements all in one call:

```tsx
const state = useStateLink([1000, 2000, 3000])
state.merge({
    0: 2,
    1: none,
    3: 4000
}) // state value will be: [2, 3000, 4000]
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

## Advanced mutations for a string state 

### Concatenating with another string

For a given state:

```tsx
const state = useState("Hello ")
```

The recommended method to append another string is the following: 
```tsx
state.merge(" World") // state.value will be "Hello World"
// or the same
state.merge(" World")
```

Learn more about [StateMethods.set](typedoc-hookstate-core.md#set) and [StateMethods.merge](typedoc-hookstate-core.md#merge) in the API reference.

## Limitations for state values

There are few limitations for state values, which are typical for any state management library for Javascript environment.

* State value should be a JS primitive, like string/number/etc., or `null`/`undefined` or a JS object/array containing other JS primitive properties, objects or arrays. In other words, state values with Maps, Sets, Dates will not work properly.
* Cyclic and cross-referrences with the state value will not work properly.
