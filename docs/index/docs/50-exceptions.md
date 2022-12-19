---
id: exceptions
title: Exceptions catalog
sidebar_label: Exceptions catalog
---

import { PreviewSample } from '../src/PreviewSample'

## HOOKSTATE-100

Happens when 
- a Hookstate State object is used in a dependency list AND
- Hookstate is configured (via a configure function) to intercept and assert on standard Reach hooks with dependency lists only in development mode (by default, it is configured to automatically intercept always and so, this exception should not happen in the default configuration)

```tsx
const state1 = useHookstate(...)
useEffect(() => {...}, [state1]) // <== Error in development mode!
```

To fix it, use the Hookstate provided hook functions instead:

```tsx
const state1 = useHookstate(...)
useHookstateEffect(() => {...}, [state1]) // <== OK
```

## HOOKSTATE-101

Happens when new state is created with an initial value, which is a value of another state.

```tsx
const state1 = useHookstate(...)
const state2 = useHookstate(state1.value) // <== Error!
```

If you would like to create a state from a clone of a state, you may do something along this line:

```tsx
const state1 = useHookstate(...)
const state2 = useHookstate(
    // simplest way to clone an object
    JSON.parse(JSON.stringify(state1.value)))
```

## HOOKSTATE-102

Happens when state is set to a new value, which is a value of another state.

```tsx
const state1 = useHookstate(...)
const state2 = useHookstate(...)
state2.set(state1.value) // <== Error!
```

If you would like to set state value from a clone of a state, you may do something along this line:

```tsx
const state1 = useHookstate(...)
const state2 = useHookstate(...)
state2.set(
    // simplest way to clone an object
    JSON.parse(JSON.stringify(state1.value)))
```

## HOOKSTATE-103

Happens when state is read (used) when its underlying promise has not been resolved or rejected yet.

```tsx
const state = useHookstate(new Promise(...))
state.value // <== Error!
state.keys // <== Error!
state.map(...) // <== Error!
state.promised // <== OK
state.promise.then(...) // <== OK
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-104

Happens when state is written (set or merged) when its underlying promise has not been resolved or rejected yet.

```tsx
const state = useHookstate(new Promise(...))
state.set(...) // <== Error!
state.merge(...) // <== Error!
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-105

Happens when nested state is set to a promise. Nested state does not support asynchronous state separately from a root state.

```tsx
const state = useHookstate({ prop: ... })
state.prop.set(new Promise(...)) // <== Error!
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-106

Happens when state is set after destroy. Typically it may happen when a component is unmounted but leaves asynchronous operations running, which trigger state updates when awaited finally.

```tsx
const state = hookstate(...)
destroyHookstate(state)
state.set(...) // <== Error!
```

```tsx
const state = useHookstate(...)
React.useEffect(() => {
    setTimeout(() => {
        state.set(...)
    }, 5000)
    // <== Error is not cancelling the timeout when a component is unmounted!
})
```

## HOOKSTATE-107

Happens when state property is read when underlying state value is a primitive value.

```tsx
const state = useHookstate(1)
state.prop // <== Error!

const state = useHookstate({ child: 1 })
state.child.prop // <== Error!
```

## HOOKSTATE-108

Happens when state is serialized to JSON.

```tsx
const state = useHookstate(...)
JSON.stringify(state) // <== Error!
```

You likely intended to serialize state value instead:

```tsx
const state = useHookstate(...)
JSON.stringify(state.value)
```

## HOOKSTATE-109

Happens when state methods instance is serialized to JSON.

```tsx
const state = useHookstate(...)
JSON.stringify(state) // <== Error!
```

You likely intended to serialize state value instead:

```tsx
const state = useHookstate(...)
JSON.stringify(state.value)
```

## HOOKSTATE-110

Happens when a state property of type function is being used and a parent object class is just Object.

```tsx
const state = useHookstate({ callback: () => {} })
state.callback // <== Error!
```

If you would like to call a property of an object you should do the following instead:

```tsx
const state = useHookstate({ callback: () => {} })
state.get({ noproxy: true }).callback() // <== OK
```

Please, note that this error happens only when an a value has Object class name.
Hookstate handles correctly the cases when you call methods of instances of other classes, for example Date class.

## HOOKSTATE-111

Happens when a state is attempted to be reinitialized on rerender with another store source.
This is likely a mistake in a parent calling component where a new property value is passed to a child,
and this property value refers to a different Hookstate State then in the previous renders.

This issue may also happen under Nextjs and Vite hot module reload (HMR), but it does not happen with react-scripts HMR.
We will look in the future how to support HMR with Vite / Nextjs ([see more](https://github.com/avkonst/hookstate/issues/364)).

## HOOKSTATE-120

Deprecated in Hookstate 4.

For Hookstate 3, it happens when a plugin attempts to get its own instance from a state, where the plugin has not been attached before.

Using the Initial plugin as an example:

```tsx
const state = useHookstate(...)
Initial(state) // <== Error!
```

Correct way:

```tsx
const state = useHookstate(...)
state.attach(Initial)
Initial(state)
```

## HOOKSTATE-201

Happens when state property is set via direct assignment.

```tsx
const state = useHookstate(...)
state.prop = 'some value' // <== Error!
```

Correct way:

```tsx
const state = useHookstate(...)
state.prop.set('some value')
```

## HOOKSTATE-202

Happens when state value property is set via direct assignment.

```tsx
const state = useHookstate(...)
state.value.prop = 'some value' // <== Error!
```

Correct way:

```tsx
const state = useHookstate(...)
state.prop.set('some value')
```

## HOOKSTATE-203

Setting prototype for a state is not supported.

```tsx
const state = useHookstate(...)
Object.setPrototypeOf(state, ...) // <== Error!
```

## HOOKSTATE-204

Setting prototype for a state value is not supported.

```tsx
const state = useHookstate(...)
Object.setPrototypeOf(state.value, ...) // <== Error!
```

## HOOKSTATE-205

Preventing extensions for a state is not supported.

```tsx
const state = useHookstate(...)
Object.preventExtensions(state) // <== Error!
```

## HOOKSTATE-206


Preventing extensions for a state value is not supported.

```tsx
const state = useHookstate(...)
Object.preventExtensions(state.value) // <== Error!
```

## HOOKSTATE-207

Defining new property directly on a state is not supported.

```tsx
const state = useHookstate(...)
Object.defineProperty(state, 'prop', ...) // <== Error!
```

You likely intended the following instead:

```tsx
const state = useHookstate(...)
state.prop.set(...)
```

## HOOKSTATE-208

Defining new property directly on a state value is not supported.

```tsx
const state = useHookstate(...)
Object.defineProperty(state.value, 'prop', ...) // <== Error!
```

You likely intended the following instead:

```tsx
const state = useHookstate(...)
state.prop.set(...)
```

## HOOKSTATE-209

Delete operator is not supported for a state object.

```tsx
const state = useHookstate(...)
delete state.prop // <== Error!
```

You likely intended the following instead:

```tsx
import { none, useHookstate } from '@hookstate/core'
const state = useHookstate(...)
state.prop.set(none)
```

## HOOKSTATE-210

Delete operator is not supported for a state value object.

```tsx
const state = useHookstate(...)
delete state[self.value].prop // <== Error!
```

You likely intended the following instead:

```tsx
import { none, useHookstate } from '@hookstate/core'
const state = useHookstate(...)
state.prop.set(none)
```

## HOOKSTATE-211

New operator is not supported for a state object.

```tsx
const state = useHookstate(...)
new state.prop // <== Error!
```

## HOOKSTATE-212

New operator is not supported for a state value object.

```tsx
const state = useHookstate(...)
new state.value.prop // <== Error!
```

## HOOKSTATE-213

State object is not callable.

```tsx
const state = useHookstate(...)
state() // <== Error!
state.prop() // <== Error!
```

## HOOKSTATE-214

State value object is not callable.

```tsx
const state = useHookstate(...)
state.value() // <== Error!
state.value.prop() // <== Error!
```
