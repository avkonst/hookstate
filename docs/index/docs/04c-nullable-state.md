---
id: nullable-state
title: Nullable state
sidebar_label: Nullable state
---

import { PreviewSample } from '../src/PreviewSample'

## Dealing with nullable state

If a state can be missing (eg. nested property is undefined) or null, checking for null state value is essential before diving into the nested states.

Typescript will fail a compilation if you attempt to work with nested states of a state, which might have null or underfined state value. For example:

```tsx
interface Task { name: string, priority?: number }

const MyComponent = () => {
    const state = useState<Task | null>(null)
    
    // JS - runtime error, TS - compilation error
    state.name[self].value
    // JS - runtime error, TS - compilation error
    state[self].value.name
}
```

Here is the recommended way to check for `null`/`undefined` before unfolding nested states:

```tsx
// type is for clarity, it is inferred by the compiler
const stateOrNull: State<Task> | null = state[self].ornull
if (stateOrNull) {
    // no compilation and runtime errors
    stateOrNull.name[self].value

    // no compilation and runtime errors
    stateOrNull[self].value.name
}
```

[StateMethods.ornull](typedoc-hookstate-core.md#ornull) property is a very convenient to deal with nullable and undefined value states. Here is the example of a component, which receives a state, those state value might be null.

```tsx
const MyInputField = (props: { state: State<string | null>}) => {
    const state: State<string> | null = props.state.ornull;
    // state is either null or an instance of State<string>:
    if (!state) {
        // state value was null, do not render form field
        return <></>;
    }
    // state value is an instance of string, can not be null here:
    return <input value={state.value} onChange={(v) => state.set(v.target.value)} />
}
```
