<h1 align="center">
  Hookstate
</h1>

<p align="center">
  The simple but very powerful and incredibly fast state management for React that is based on hooks.
</p>
<br/>

<p align="center">
  <a href="#why-hookstate">Why?</a> •
  <a href="#quick-start">Demos / Examples</a> •
  <a href="#api-documentation">Documentation</a> •
  <a href="#plugins">Plugins</a>
  <a href="./CHANGELOG.md">Changelog</a>
</p>

<p align="center">
  <a href="./">
    <img src="https://badgen.net/badge/icon/typescript/green?icon=typescript&label">
  </a>
  <a href="https://www.npmjs.com/package/@hookstate/core">
      <img src="https://badgen.net/bundlephobia/minzip/@hookstate/core?label=size&color=green" />
  </a>
  <a href="https://www.npmjs.com/package/@hookstate/core">
    <img src="https://badgen.net/badge/dependencies/none/green" />
  </a>
  <a href="./LICENSE">
    <img src="https://badgen.net/github/license/avkonst/hookstate?color=green" />
  </a>
  <a href="https://travis-ci.org/avkonst/hookstate">
    <img src="https://travis-ci.org/avkonst/hookstate.svg?branch=master" />
  </a>
  <a href="https://codecov.io/gh/avkonst/hookstate">
    <img src="https://codecov.io/gh/avkonst/hookstate/branch/master/graph/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@hookstate/core">
    <img src="https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6" />
  </a>
</p>

## Preface

Hookstate is a modern alternative to Redux, Mobx, Formik without boilerplate. It is simple to learn but very flexible to use. It has got impressive performance and predictable behavior.

Any questions? Just ask by raising a github ticket.

## Why Hookstate

- Concise, pragmatic but flexible API. Very easy to learn. See ["Quick Start"](#quick-start) section.
- Incredible performance based on unique method for tracking of used/rendered and updated state segments. See the performance demos [with huge table state](https://hookstate.js.org/performance-demo-large-table) and [with huge form state](https://hookstate.js.org/performance-demo-large-form).
- First-class Typescript support. Complete type inferrence for any complexity of structures of managed state data. Full intellisense support tested in VS Code.
- [Used in production](#used-by). Code simplification and incredible performance boost are proven in a number of real cases.
- Plugin system enables custom extensions, with several [standard plugins](#plugins) available.
- Tiny footprint: **2.8KB** gziped by create-react-app. No external dependencies, except React.
- Support for older browsers, for example IE11, via [the polyfill plugin](#plugins).
- Runs with [Preact](https://preactjs.com/) without polyfills.

## Quick start

See the code samples below and other demos [running online](https://hookstate.js.org). You will learn how to use Hookstate and what it can do in few minutes.

For more detailed explanation read the [API documentation](#api-documentation).

For the complete example application built with Hookstate, check out [this demo](https://hookstate-example-app.netlify.com/) and it's [source code](https://github.com/avkonst/hookstate-example-app).


### Global state

> Create the state:
```tsx
const stateLink = createStateLink(0);
```
> and use it *within* a React component:
```tsx
export function ExampleComponent() {
  const state = useStateLink(stateLink);
  return <p>State value: {state.get()}
    <button onClick={() => state.set(p => p + 1)}>Increment</button></p>
}
```
> and *outside* of a React component:
```tsx
setInterval(() => stateLink.set(p => p + 1), 3000)
```

### Local state

> create local state and use *within* a React component:
```tsx
export function ExampleComponent() {
  const state = useStateLink(0);
  return <p>State value: {state.get()}
    <button onClick={() => state.set(p => p + 1)}>Increment</button></p>
}
```

## Used By

Known applications, which use Hookstate in production:

- [MoonPiano](https://moonpiano.praisethemoon.org) - read [the success story](https://praisethemoon.org/hookstate-how-one-small-react-library-saved-moonpiano/) of moving from Redux to Hookstate.
- [Nextfinal](https://nextfinal.com/)

> Submit pull request to include yours.

## Installation

```bash
npm install --save @hookstate/core
# OR
yarn add @hookstate/core
```

## Browser support

It supports all recent browsers and works where React works. If you need to polyfill, for example for IE11, you need to make sure the following is supported by the target environment:
- ES5, `Map` and `Set` (All are available long time ago, including IE11)
- `Symbol` (You likely already have got one from the [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill). If you do not import [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill), you can get the standalone [`es6-symbol`](https://www.npmjs.com/package/es6-symbol))
- `Number.isInteger` (Polyfill is available from [`core-js/features/number/is-integer`](https://www.npmjs.com/package/core-js))
- `Proxy` (Sufficient for the library polyfill is available from [`@hookstate/proxy-polyfill`](#plugins))

## API Documentation

### `createStateLink`

This function creates a reference to a **global** state. The first argument of generic type `S` is the initial value to assign to the state. The return type is [`StateInf<R>`](#stateinf). By default, generic `R` type is a [`StateLink<S>`](#statelink). You can wrap the state reference by your custom state access interface using the second [`transform` argument](#transform-argument). In this case `R` type is the result type of the `transform` function.

For example ([see it running](https://hookstate.js.org/global-complex-from-documentation)):

```tsx
interface Task { name: string; priority?: number }
const initialValue: Task[] = [{ name: 'First Task' }];
const stateLink = createStateLink(initialValue);
```

### `StateInf`

The type of an object returned by `createStateLink`. The `StateInf` variable has got the following methods and properties:

- `with(...)` - attaches various [plugins](#plugins) to extend the functionality of the state
- `wrap(...)` - transforms state access interface similarly to [`transform` argument](#transform-argument) for the `createStateLink`
- `destroy()` - destroys the state, so the resources (if any allocated by custom plugins) can be released, and the state can be closed.
- `access()` - this function opens access to the state. It **can** be used outside of a React component to read and update the state object. For example ([see it running](https://hookstate.js.org/global-complex-from-documentation)):

```tsx
setTimeout(() => stateLink.access()
    .set(tasks => tasks.concat([{ name: 'Second task by timeout', priority: 1 }]))
, 5000) // adds new task 5 seconds after website load
```

### `useStateLink`

This function opens access to the state. It **must** be used within a functional React component. The first argument should be one of the following:
- **global state**: a result of the [`createStateLink`](#createstatelink) function. For example ([see it running](https://hookstate.js.org/global-complex-from-documentation)):

    ```tsx
    export const ExampleComponent = () => {
        const state = useStateLink(stateLink);
        return <button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))} >
            Add task
        </button>
    }
    ```
- **local state**: initial variable to assign to the local (per component) state. It similar to the original `React.useState`, but the result [`StateLink`](#statelink) variable has got more features. For example ([see it running](https://hookstate.js.org/local-complex-from-documentation)):

    ```tsx
    export const ExampleComponent = () => {
        const state = useStateLink([{ name: 'First Task' }]);
        return <button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}>
            Add task
        </button>
    }
    ```
- **scoped state**: a result of the [`useStateLink`](#usestatelink) function, called by a parent component either for a **global state**, for **local state** or it's parent **scoped state**. This is discussed in more details below. For example ([see it running for global state](https://hookstate.js.org/global-complex-from-documentation) or for [local state](https://hookstate.js.org/local-complex-from-documentation)):

    ```tsx
    const TaskViewer = (props: { taskState: StateLink<Task> }) => {
        const taskState = useStateLink(props.taskState);
        return <p>Task state: {JSON.stringify(taskState.get())}</p>
    }
    ```

The `useStateLink` forces a component to rerender everytime when any segment/part of the state data is changed **AND only if** this segement was used by the component.

A segment/part of the state is considered as **not used** by a parent's state link, if it is only used by a **scoped state** link. This gives great rendering performance of nested components for large data sets. It is demonstrated in [this example for global state](https://hookstate.js.org/global-complex-from-documentation), [this example for local state](https://hookstate.js.org/local-complex-from-documentation), [this performance demo with large table state](https://hookstate.js.org/performance-demo-large-table)
and [this performance demo with large form state](https://hookstate.js.org/performance-demo-large-form).

The **global state** can be consumed by:
- multiple components as demonstrated in [this example](https://hookstate.js.org/global-multiple-consumers)
- or by a 'parent' component passing `nested` links to it's children as demonstarted in [this example](https://hookstate.js.org/global-multiple-consumers-from-root) or [this example](https://hookstate.js.org/global-complex-from-documentation)
- or any combination of the above two options

The result of `useStateLink` is of type [`StateLink`](#statelink).

The result state link inherits all the plugins attached to the provided state link (**global state** mode) or to the parent component state link (**scoped state** mode).

You can attach more [plugins](#plugins) using `with` method of the state link.

You can also wrap the [state link](#statelink) by your custom state access interface using the second [`transform` argument](#transform-argument).

You can also use the state (**global**, **local** or **scoped**) via `StateFragment` React component. It is particularly useful for creating **scoped state** links, as demonstrated in [this](https://hookstate.js.org/global-multiple-consumers-statefragment) and [this](https://hookstate.js.org/plugin-initial-statefragment) examples.

### `StateLink`

The `StateLink` variable has got the following methods and properties:

- `get()` or `value` - returns the instance of data in the state
- `set(...)` or `set((prevState) => ...)` - function which allows to mutate the state value. If `path === []`, it is similar to the `setState` variable returned by `React.useState` hook. If `path !== []`, it sets only the segment of the state value, pointed out by the path. The `set` function will not accept partial updates. It can be done by combining `set` with `nested`. There is the `Mutate` [plugin](#plugins), which adds helpful methods to mutate arrays and objects.
- `merge(...)` or `merge((prevState) => ...)` - similarly to `set` method updates the state. If target current state value is an object, it does partial update for the object. If state value is an array and the `merge` argument is an array too, it concatenates the current value with `merge` value and sets it to the state. If state value is an array and the `merge` argument is an object, it does partial update for the current array value. If target current state value is a string, it concatenates the current state value string with the `merge` argument converted to string and sets the result to the state.
- `path` 'Javascript' object 'path' to an element relative to the root object in the state. For example:

    ```tsx
    const state = useStateLink([{ name: 'First Task' }])
    state.path IS []
    state.nested[0].path IS [0]
    state.nested[0].nested.name.path IS [0, 'name']
    ```

- `nested` 'converts' a `StateLink` of an object to an object of nested `StateLink`s OR a `StateLink` of an array to an array of nested `StateLink` elements.
This allows to 'walk' the tree and access/mutate nested compex data in very convenient way. The result of `nested` for primitive values is `undefined`. The typescript support for `nested` will handle correctly any complexy of the state structure. The result of `Object.keys(state.nested)` is the same as `Object.keys(state.get())`. However, nested state links object will have ANY property defined (although not every will pass Typescript compiler check). It is very convenient to create 'editor-like' components for properties, which can be undefined. For example:

    ```tsx
    const PriorityEditor = (props: { priorityState: StateLink<number | undefined> }) => {
        return <p>Current priority: {priorityState.get() === undefined ? 'unknown' : priority.get()}
            <button onClick={() => priorityState.set(prevPriority =>
                (prevPriority || 0) + 1 // here the value might be not defined, but we can set it!
            )}>
            Increase Priority</button>
        </p>
    }
    const ExampleComponent = () => {
        const taskState: StateLink<{ name: string, priority?: number }> =
            useStateLink({ name: 'Task name is defined but priority is not' });
        return <PriorityEditor priorityState={
            taskState.nested.priority // it will be always defined, but it's value might be not defined
        } />
    }
    ```

### `Transform` argument

`createStateLink`, `useStateLink` and `StateLink.wrap()` functions accept the last argument, which allows to wrap the state link by custom state access interface. The transform argument is a callback which receives the original [state link](#statelink) variable and should return any custom state access instance.

Examples for all possible combinations:

- **global state**, `createStateLink` with transform:

    ```tsx
    const stateLink = createStateLink(initialValue, s => ({
        addTask = (t: Task) => s.set(tasks => tasks.concat([t]))
    }));
    export const getTaskStore = () => stateLink.access()
    export const useTaskStore = () => useStateLink(stateLink)

    getTaskStore().addTask({ name: 'Untitled' })

    export const ExampleComponent = () => {
        const state = useTasksStore();
        return <button onClick={() => state.addTask({ name: 'Untitled' })}>
            Add task
        </button>
    }
    ```
- **global state**, `StateLink` with transform:

    ```tsx
    const stateLink = createStateLink(initialValue);
    const transform = (s: StateLink<Task[]>) => ({
        addTask = (t: Task) => s.set(tasks => tasks.concat([t]))
    })

    stateLink.wrap(transform).addTask({ name: 'Untitled' })

    export const ExampleComponent = () => {
        const state = useStateLink(stateLink.wrap(transform));
        return <button onClick={() => state.addTask({ name: 'Untitled' })}>
            Add task
        </button>
    }
    ```
- **local state**: `useStateLink` with transform:

    ```tsx
    export const ExampleComponent = () => {
        const state = useStateLink([{ name: 'First Task' }], s => ({
            addTask = (t: Task) => s.set(tasks => tasks.concat([t]))
        }));
        return <button onClick={() => state.addTask({ name: 'Untitled' })}>
            Add task
        </button>
    }
    ```
- **scoped state**: `useStateLink` with transform:

    ```tsx
    const TaskViewer = (props: { taskState: StateLink<Task> }) => {
        const taskState = useStateLink(props.taskState, s =>({
            getName = () => s.nested.name.get(),
            setName = (n: string) => s.nested.name.set(n)
        }));
        return <input value={state.getName()} onChange={e => state.setName(e.target.value)} />
    }
    ```

### `Transform` argument with `StateMemo`

You can apply the transform argument to reduce the the state value down to an aggregated value. It works for local, global and scoped states. For example:

```tsx
const TotalHighestPriorityTasksComponent = (props: { tasksState: StateLink<Task[]> }) => {
    const totalTasksWithZeroPriority = useStateLink(props.tasksState, s => {
        return s.get().filter(t => t.priority === undefined || t.priority === 0).length;
    })
    return <p>Total zero priority tasks: {totalTasksWithZeroPriority}</p>
}
```

The above will rerender when any task changes a priority or when tasks are added or removed. However, because there is no point to rerender this component when it's aggregated result in the transformation is not changed, we can optimize it:

```tsx
import { StateLink, StateMemo, useStateLink } from '@hookstate/core';

const TotalHighestPriorityTasksComponent = (props: { tasksState: StateLink<Task[]> }) => {
    const totalTasksWithZeroPriority = useStateLink(props.tasksState, StateMemo(s => {
        return s.get().filter(t => t.priority === undefined || t.priority === 0).length;
    }))
    return <p>Total zero priority tasks: {totalTasksWithZeroPriority}</p>
}
```

The above will rerender only when the result of the aggregation is changed. This allows to achieve advanced optimizations for rendering of various aggregated views.

`StateMemo` usage is demonstarted in [this](https://hookstate.js.org/plugin-initial), [this](https://hookstate.js.org/plugin-initial-statefragment) and [this](https://hookstate.js.org/plugin-touched) examples.

`StateMemo` can be invoked with the second argument, which is equality operator used to compare the new and the previous results of the `transform` callback. By default, tripple equality (===) is used. If new and previous are equal, Hookstate will skip rerendering the component on state chage.

The second argument of the `transform` callback is defined and equals to the result of the last transform call, when the `transform` is called by Hookstate to check if the component should rerender. If the core `StateMemo` plugin is used with default equality operator and the result of the transform is the same as the last result, Hookstate will skip rerendering the component.

## Plugins

> Please, submit pull request if you would like yours plugin included in the list.

Plugin | Description | Example | Package | Version
-|-|-|-|-
Labelled | Allows to assign unique human readable label to a state. It is used by development tools and other extensions. |  | `@hookstate/core` | [![npm version](https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/core)
Initial | Enables access to an initial value of a [`StateLink`](#statelink) and allows to check if the current value of the [`StateLink`](#statelink) is modified (compares with the initial value). Helps with tracking of *modified* form field(s). | [Demo](https://hookstate.js.org/plugin-initial) | `@hookstate/initial` | [![npm version](https://img.shields.io/npm/v/@hookstate/initial.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/initial)
Touched | Helps with tracking of *touched* form field(s). | [Demo](https://hookstate.js.org/plugin-touched) | `@hookstate/touched` | [![npm version](https://img.shields.io/npm/v/@hookstate/touched.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/touched)
Validation | Enables validation and error / warning messages for a state. Usefull for validation of form fields and form states. | [Demo](https://hookstate.js.org/plugin-validation) | `@hookstate/validation` | [![npm version](https://img.shields.io/npm/v/@hookstate/validation.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/validation)
Persistence | Enables persistence of managed states to browser's local storage. | [Demo](https://hookstate.js.org/plugin-persistence) | `@hookstate/persistence` | [![npm version](https://img.shields.io/npm/v/@hookstate/persistence.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/persistence)
Logger | Logs state updates and current value of a [`StateLink`](#statelink) to the development console. | [Demo](https://hookstate.js.org/plugin-logger) | `@hookstate/logger` | [![npm version](https://img.shields.io/npm/v/@hookstate/logger.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/logger)
DevTools | Development tools for Hookstate. Install [Chrome Redux browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and [activate the plugin in your app](https://github.com/avkonst/hookstate/tree/master/plugins/DevTools#how-to-use) | [Demo](https://hookstate.js.org/demo-todolist) | `@hookstate/devtools` | [![npm version](https://img.shields.io/npm/v/@hookstate/devtools.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/devtools)
Untracked | Enables access to `StateLink`'s `get` and `set` methods which do not track usage or state update. It means these operations do not influence rendering at all. Applicable in specific usecases. You should understand what you are doing when you use it. | [Demo](https://hookstate.js.org/plugin-untracked) | `@hookstate/untracked` | [![npm version](https://img.shields.io/npm/v/@hookstate/untracked.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/untracked)
Downgraded | Turns off optimizations for a StateLink by stopping tracking of it's value usage and assuming the entire state is *used* if StateLink's value is accessed at least once. |  | `@hookstate/core` | [![npm version](https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/core)
Proxy Polyfill | Makes the Hookstate working in older browsers, for example IE11. All features are supported with two known differences in polyfilled behaviour: 1) `StateLink.nested[key]` will return `undefined` if `StateLink.get()[key]` is also `undefined` property. 2) `StateLink.get()[key] = 'some new value'` will not throw but will mutate the object in the state without notifying any of rendered components or plugins. | [Demo](https://github.com/avkonst/hookstate/tree/master/experimental/ie11) | `@hookstate/proxy-polyfill` | [![npm version](https://img.shields.io/npm/v/@hookstate/proxy-polyfill.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/proxy-polyfill)
