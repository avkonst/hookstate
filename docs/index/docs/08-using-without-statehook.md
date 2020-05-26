---
id: using-without-statehook
title: Using state without state hook
sidebar_label: Using state without hook
---

import { PreviewSample } from '../src/PreviewSample'

You can use Hookstate without a hook. It is particularly useful for integration with old class-based React components.
It works with [global](./global-state), [local](./local-state), [nested](./nested-state) and [scoped](./scoped-state) states the same way.

The following example demonstrates how to use a global state without [useState](typedoc-hookstate-core#usestate) hook:

<PreviewSample example="global-multiple-consumers-statefragment" />

And the following components are identical in behavior:

Functional component:

```tsx
const globalState = createState('');

const MyComponent = () => {
    const state = useState(globalState);
    return <input value={state[self].value}
        onChange={e => state[self].set(e.target.value)} />;
}
```

Functional component without a hook:

```tsx
const globalState = createState('');

const MyComponent = () => <StateFragment state={globalState}>{
    state => <input value={state[self].value}
        onChange={e => state[self].set(e.target.value)}>
}</StateFragment>
```

Class-based component:

```tsx
const globalState = createState('');

class MyComponent extends React.Component {
    render() {
        return <StateFragment state={globalState}>{
            state => <input value={state[self].value}
                onChange={e => state[self].set(e.target.value)}>
        }</StateFragment>
    }
}
```
