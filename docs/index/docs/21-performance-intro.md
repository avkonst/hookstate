---
id: performance-intro
title: Performance overview
sidebar_label: Overview
---

import { PreviewSample } from '../src/PreviewSample'

Preformance is one of the main goals of the Hookstate project alongside with simple and flexible API. Hookstate has got two technologies built-in, which make it stand out and deliver incredible performance for applications:

1. Hookstate does usage tracking to identify what components require rerendering when a state is changed. It is possible to disable this with help of [Downgraded](./performance-managed-rendering) plugin on per component basis or per state.
2. Hookstate has got [scoped state](./scoped-state) feature which multiplies the effect of the first, particularly for the cases involving [large states](./performance-large-state) and [frequent updates](./performance-frequent-updates).

The following matrix explains the effect of usage tracking and scoped states. Code samples are below as well.

Legend:
* Y - component rerenders on state change
* N - component does not rerender on state change
* P - component rerenders because the parent is rerendered

State:
```tsx
const globalState = createState({ A: 0, B: 0 })
```

Actions:
```tsx
const setA = () => globalState.A.set(p => p + 1)
const setB = () => globalState.B.set(p => p + 1)
const mergeA = () => globalState[self].merge(p => ({ A: p.A + 1 }))
const mergeB = () => globalState[self].merge(p => ({ B: p.B + 1 }))
const mergeAB = () => globalState[self].merge(p => ({ A: p.A + 1, B: p.B + 1 }))
const setObj = () => globalState[self].set(p => ({ ...p, A: p.A + 1 }))
```

rerender on actions: | setA<br />mergeA | setB<br/>mergeB | mergeAB | setObj
-|-|-|-|-
||||
Ex1_Parent_GlobalStateNotHooked | N | N | N | N
Ex1_Child_GlobalStateHooked_AUsed | Y | N | Y | Y
Ex1_Child_GlobalStateHooked_BUsed_Downgraded | Y | Y | Y | Y
|||
Ex2_Parent_GlobalStateHooked | Y | Y | Y | Y
Ex2_Child_PropsState_AUsed | P | P | P | P
Ex2_Child_PropsState_BUsed_Downgraded | P | P | P | P
|||
Ex3_Parent_GlobalStateHooked | N | N | N | Y
Ex3_Child_PropsState_AUsed_Scoped | Y | N | Y | P
Ex3_Child_PropsState_BUsed_Scoped_Downgraded | N | Y | Y | P
|||
Ex4_Parent_GlobalStateHooked | N | Y | Y | Y
Ex4_Child_PropsState_AUsed_Scoped | Y | P | P | P
Ex4_Child_PropsState_BUsed | N | P | P | P
|||
Ex5_Component_GlobalStateHooked_NotUsed | N | N | N | N
Ex6_Component_GlobalStateHooked_ObjUsed | N | N | N | Y
Ex7_Component_GlobalStateHooked_KeysUsed | Y | Y | Y | Y

Example 1:
Children hook the state, but the parent does not.
```tsx
function Ex1_Parent_GlobalStateNotHooked() {
    return <>
        <Ex1_Child_GlobalStateHooked_AUsed />
        <Ex1_Child_GlobalStateHooked_BUsed_Downgraded />
    </>
}
function Ex1_Child_GlobalStateHooked_AUsed() {
    const state = useState(globalState)
    return <p>{state.A.value}</p>
}
function Ex1_Child_GlobalStateHooked_BUsed_Downgraded() {
    const state = useState(globalState)
    state[self].attach(Downgraded)
    return <p>{state.B.value}</p>
}
```

Example 2:
The parent hooks the state and passes nested to children.
Children do NOT USE scoped state
```tsx
function Ex2_Parent_GlobalStateHooked() {
    const state = useState(globalState)
    return <>
        <Ex2_Child_PropsState_AUsed state={state.A}/>
        <Ex2_Child_PropsState_BUsed_Downgraded state={state.B}/>
    </>
}
function Ex2_Child_PropsState_AUsed(props: { state: State<number> }) {
    const state = props.state
    return <p>{state.A.value}</p>
}
function Ex2_Child_PropsState_BUsed_Downgraded(props: { state: State<number> }) {
    const state = props.state
    state.attach(Downgraded)
    return <p>{state.B.value}</p>
}
```

Example 3:
The parent hooks the state and passes nested to children.
Children USE scoped state.
```tsx
function Ex3_Parent_GlobalStateHooked() {
    const state = useState(globalState)
    return <>
        <Ex3_Child_PropsState_AUsed_Scoped state={state.A}/>
        <Ex3_Child_PropsState_BUsed_Scoped_Downgraded state={state.B}/>
    </>
}
function Ex3_Child_PropsState_AUsed_Scoped(props: { state: State<number> }) {
    const state = useState(props.state)
    return <p>{state.A.value}</p>
}
function Ex3_Child_PropsState_BUsed_Scoped_Downgraded(props: { state: State<number> }) {
    const state = useState(props.state)
    state.attach(Downgraded)
    return <p>{state.B.value}</p>
}
```

Example 4:
The parent hooks the state and passes nested to children.
Once child USES scoped state, another does NOT.
```tsx
function Ex4_Parent_GlobalStateHooked() {
    const state = useState(globalState)
    return <>
        <Ex4_Child_PropsState_AUsed_Scoped state={state.A}/>
        <Ex4_Child_PropsState_BUsed state={state.B}/>
    </>
}
function Ex4_Child_PropsState_AUsed_Scoped(props: { state: State<number> }) {
    const state = useState(props.state)
    return <p>{state.A.value}</p>
}
function Ex4_Child_PropsState_BUsed(props: { state: State<number> }) {
    const state = props.state
    return <p>{state.B.value}</p>
}
```

Example 5:
A component hooks the state but does not use it.
```tsx
function Ex5_Component_GlobalStateHooked_NotUsed() {
    const state = useState(globalState)
    return <></>
}
```

Example 6:
A component hooks the state and uses only an object without reading it's properties.
```tsx
function Ex6_Component_GlobalStateHooked_ObjUsed() {
    const state = useState(globalState)
    const unused = state[self].value
    return <></>
}
```

Example 7:
A component hooks the state and uses object's keys.
```tsx
function Ex7_Component_GlobalStateHooked_KeysUsed() {
    const state = useState(globalState)
    const unused = state[self].keys
    return <></>
}
```
