---
id: exceptions
title: Exceptions catalog
sidebar_label: Exceptions catalog
---

import { PreviewSample } from '../src/PreviewSample'

## HOOKSTATE-101

Happens when new state is created with an initial value, which is a value of another state.

```tsx
const state1 = useState(...)
const state2 = useState(state1[self].value) // <== Error!
```

If you would like to create a state from a clone of a state, you may do something along this line:

```tsx
const state1 = useState(...)
const state2 = useState(
    // simplest way to clone an object
    JSON.parse(JSON.stringify(state1[self].value)))
```

## HOOKSTATE-102

Happens when state is set to a new value, which is a value of another state.

```tsx
const state1 = useState(...)
const state2 = useState(...)
state2[self].set(state1[self].value) // <== Error!
```

If you would like to set state value from a clone of a state, you may do something along this line:

```tsx
const state1 = useState(...)
const state2 = useState(...)
state2[self].set(
    // simplest way to clone an object
    JSON.parse(JSON.stringify(state1[self].value)))
```

## HOOKSTATE-103

Happens when state is read (used) when its underlying promise has not been resolved or rejected yet.

```tsx
const state = useState(new Promise(...))
state[self].value // <== Error!
state[self].keys // <== Error!
state.map(...) // <== Error!
state[self].map(...) // <== OK
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-104

Happens when state is written (set or merged) when its underlying promise has not been resolved or rejected yet.

```tsx
const state = useState(new Promise(...))
state[self].set(...) // <== Error!
state[self].merge(...) // <== Error!
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-105

Happens when nested state is set to a promise. Nested state does not support asynchronous state separately from a root state.

```tsx
const state = useState({ prop: ... })
state.prop[self].set(new Promise(...)) // <== Error!
```

More information about [asynchronous states](./asynchronous-state).

## HOOKSTATE-106

Happens when state is set after destroy. Typically it may happen when a component is unmounted but leaves asynchronous operations running, which trigger state updates when awaited finally.

```tsx
const state = createState(...)
state[self].destroy()
state[self].set(...) // <== Error!
```

```tsx
const state = useState(...)
React.useEffect(() => {
    setTimeout(() => {
        state[self].set(...)
    }, 5000)
    // <== Error is not cancelling the timeout when a component is unmounted!
})
```

## HOOKSTATE-107

Happens when state property is read when underlying state value is a primitive value.

```tsx
const state = useState(1)
state.prop // <== Error!

const state = useState({ child: 1 })
state.child.prop // <== Error!
```

## HOOKSTATE-108

Happens when state is serialized to JSON.

```tsx
const state = useState(...)
JSON.stringify(state) // <== Error!
```

More likely you want to serialize state value instead:

```tsx
const state = useState(...)
JSON.stringify(state[self].value)
```

## HOOKSTATE-109

See [HOOKSTATE-108](#hookstate-108)

## HOOKSTATE-120

Happens when a plugin attempts to get its own instance from a state, where the plugin has not been attached before.

Using [Initial](./extensions-initial) plugin as an example:

```tsx
const state = useState(...)
Initial(state) // <== Error!
```

Correct way:

```tsx
const state = useState(...)
state[self].attach(Initial)
Initial(state)
```

## HOOKSTATE-201
    SetProperty_State = 201,

## HOOKSTATE-202
    SetProperty_Value = 202,

## HOOKSTATE-203
    SetPrototypeOf_State = 203,

## HOOKSTATE-204
    SetPrototypeOf_Value = 204,

## HOOKSTATE-205
    PreventExtensions_State = 205,

## HOOKSTATE-206
    PreventExtensions_Value = 206,

## HOOKSTATE-207
    DefineProperty_State = 207,

## HOOKSTATE-208
    DefineProperty_Value = 208,

## HOOKSTATE-209
    DeleteProperty_State = 209,

## HOOKSTATE-210
    DeleteProperty_Value = 210,

## HOOKSTATE-211
    Construct_State = 211,

## HOOKSTATE-212
    Construct_Value = 212,

## HOOKSTATE-213
    Apply_State = 213,

## HOOKSTATE-214
    Apply_Value = 214,

