# @hookstate/core

[![npm version](https://badge.fury.io/js/%40hookstate%2Fcore.svg)](https://badge.fury.io/js/%40hookstate%2Fcore) [![license](https://img.shields.io/github/license/avkonst/hookstate)](https://img.shields.io/github/license/avkonst/hookstate)

The flexible, fast and extendable state management for React that is based on hooks.

Modern alternative to Redux, Mobx, Formik without boilerplate but with impressive performance and predictable behavior.

Browse [demos and code samples](https://hookstate.netlify.com) to see what it can do and learn it in few minutes.

Any questions? Just ask by raising a github ticket.

## Why Hookstate

- Concise, pragmatic but flexible API. Very easy to learn. See ["Getting Started" code sample](https://hookstate.netlify.com/getting-started).
- Incredible performance based on unique method for tracking of used/rendered and updated state segments. See [the performance demo](https://hookstate.netlify.com/performance-demo-large-table).
- First-class Typescript support. Complete type inferrence for any complexity of structures of managed state data. Full intellisense support tested in VS Code.
- Plugin system enables custom extensions, with several [standard plugins](#plugins) available.
- Tiny footprint: **2.13KB** gziped. No external dependencies, except React.

## Installation

```bash
npm install --save @hookstate/core
# OR
yarn add @hookstate/core
```

## API Documentation

### `createStateLink`

This function creates a reference to a **global** state. The first argument is the initial value to assign to the state. For example:

```tsx
interface Task { name: string; priority?: number }
const initialValue: Task[] = [{ name: 'First Task' }];
const stateRef = createStateLink(initialValue);
```

You can attach various [plugins](#plugins) using `with` method of the state reference.

You can also wrap the state reference by your custom state access interface using the second [`transform` argument](#transform-argument).

### `useStateLinkUnmounted`

This function opens access to the state. It **can** be used outside of a React component. The first argument should be a result of the [`createStateLink`](createstatelink) function. For example:

```tsx
setTimeout(() => useStateLinkUnmounted(stateRef)
    .set(tasks => tasks.concat([{ name: 'Second task by timeout', priority: 1 }]))
, 5000) // adds new task 5 seconds after website load
```

The result variable is of type [`StateLink`](#statelink). The state link variable must be discarded when an event processing is complete. Obtain new state link variable when it is needed in the next event. It is allowed to obtain the state link multiple times within the same event handler.

The result state link inherits all the plugins attached to the state reference.

You can attach more [plugins](#plugins) using `with` method of the state link.

You can also wrap the [state link](#statelink) by your custom state access interface using the second [`transform` argument](#transform-argument).

### `useStateLink`

This function opens access to the state. It **must** be used within a functional React component. The first argument should be one of the following:
- **global state**: a result of the [`createStateLink`](createstatelink) function. For example:

    ```tsx
    export const ExampleComponent = () => {
        const state = useStateLink(stateRef);
        return <button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))} >
            Add task
        </button>
    }
    ```
- **local state**: initial variable to assign to the local (per component) state. It similar to the original `React.createState`, but the result [`StateLink`](statelink) variable has got more features. For example:

    ```tsx
    export const ExampleComponent = () => {
        const state = useStateLink([{ name: 'First Task' }]);
        return <button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}>
            Add task
        </button>
    }
    ```
- **scoped state**: a result of the [`useStateLink`](usestatelink) function, called by a parent component. This scenario is discussed below in more details. For example:

    ```tsx
    const TaskViewer = (props: { taskState: StateLink<Task> }) => {
        const taskState = useStateLink(props.taskState);
        return <p>Task state: {JSON.stringify(taskState.get())}</p>
    }
    ```

The `useStateLink` forces a component to rerender everytime when any segment/part of the state is changed **AND** only if the component used this segment/part of the state.

The result variable is of type [`StateLink`](#statelink).

The result state link inherits all the plugins attached to the provided state reference (**global state** mode) or to the parent component state link (**scoped state** mode).

You can attach more [plugins](#plugins) using `with` method of the state link.

You can also wrap the [state link](#statelink) by your custom state access interface using the second [`transform` argument](#transform-argument).

### `StateLink`

The `StateLink` variable has got the following methods and properties:

- `get()` (or `value` is the same) - returns the instance of data in the state
- `set(...)` or `set((prevState) => ...)` - function which allows to mutate the state value. If `path === []`, it is similar to the `setState` variable returned by `React.useState` hook. If `path !== []`, it sets only the segment of the state value, pointed out by the path. The `set` function will not accept partial updates, however there is the `Mutate` [plugin](#plugins), which adds helpful methods to mutate arrays and objects.
- `nested` 'converts' a statelink of an object to an object of nested state links OR a statelink of an array to an array of nested state links elements.
This allows to 'walk' the tree and access/mutate nested compex data in very convenient way. The typescript support for `nested` will handle correctly any complexy of the state structure. The result of `nested` reports the same object keys as the object/array being 'walked'. However, nested state links object will have ANY property defined (although not every will pass Typescript compiler check). It is very convenient to create 'editor-like' components for properties, which can be undefined. For example:

    ```tsx
    const PriorityEditor = (props: { priorityState: StateLink<number> }) => {
        return <p>Current priority: {priorityState.get() !== undefined ? priority.get() : 'unknown'}
            <button onClick={() => priorityState.set(prevPriority =>
                (prevPriority || 0) + 1 // here the value might be not defined, but we can set it!
            )}>
            Increase Priority</button>
        </p>
    }
    const ExampleComponent = () => {
        const taskState: StateLink<Task> = useStateLink({ name: 'Task name is defined but priority is not' });
        return <PriorityEditor priorityState={
            taskState.nested.priority // it will be always defined, but it's value might be not defined
        } />
    }
    ```
- `path` 'Javascript' object 'path' to an element relative to the root object in the state. For example:

    ```tsx
    const state = useStateLink([{ name: 'First Task' }])
    state.path === []
    state.nested[0].path === [0]
    state.nested[0].nested.name.path === [0, 'name']
    ```

### Transform argument

`createStateLink`, `useStateLinkUnmounted` and `useStateLink` functions accept the second argument, which allows to wrap the state link by custom state access interface. The transform argument is a callback which receives the original [state link](#statelink) variable and should return any custom state access instance.

Examples for all possible combinations:

- **global state**, wrapped state reference:

    ```tsx
    const stateInf = createStateLink(initialValue, s => ({
        addTask = (t: Task) => s.set(tasks => tasks.concat([t]))
    }));
    export const useTaskStoreUnmounted = () => useStateLinkUnmounted(stateInf)
    export const useTaskStore = () => useStateLink(stateInf)

    useTaskStoreUnmounted().addTask({ name: 'Untitled' })

    export const ExampleComponent = () => {
        const state = useTasksStore();
        return <button onClick={() => state.addTask({ name: 'Untitled' })}>
            Add task
        </button>
    }
    ```
- **global state**, wrapped state link:

    ```tsx
    const stateRef = createStateLink(initialValue);
    const transform = (s: StateLink<Task[]>) => ({
        addTask = (t: Task) => s.set(tasks => tasks.concat([t]))
    })

    useStateLinkUnmounted(stateRef, transform).addTask({ name: 'Untitled' })

    export const ExampleComponent = () => {
        const state = useStateLink(stateRef, transform);
        return <button onClick={() => state.addTask({ name: 'Untitled' })}>
            Add task
        </button>
    }
    ```
- **local state**:

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
- **scoped state**:

    ```tsx
    const TaskViewer = (props: { taskState: StateLink<Task> }) => {
        const taskState = useStateLink(props.taskState, s =>({
            getName = () => s.nested.name.get(),
            setName = (n: string) => s.nested.name.set(n)
        }));
        return <input value={state.getName()} onChange={e => state.setName(e.target.value)} />
    }
    ```

### Transform argument as state value aggregation

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
import { StateLink, Prerender, useStateLink } from '@hookstate/core';

const TotalHighestPriorityTasksComponent = (props: { tasksState: StateLink<Task[]> }) => {
    const totalTasksWithZeroPriority = useStateLink(props.tasksState, s => {
        s.with(Prerender).extended.enablePrerender() // use tripple equals to diff the result
        return s.get().filter(t => t.priority === undefined || t.priority === 0).length;
    })
    return <p>Total zero priority tasks: {totalTasksWithZeroPriority}</p>
}
```

The above will rerender only when the result of the aggregation is changed. This allows to achieve advanced optimizations for rendering of various aggregated views.

The second argument of the `transform` callback is defined and equals to the result of the last transform call, when the `transform` is called to checks if the component should rerender. If the core `Prerender` plugin is enabled and the result of the transform is the same as the last result, Hooks state will skip rerendering of the component. This is used by `EqualsPrerender` [plugin](#plugins), which works with complex data structures the same way as we optimized using primitive result number.

## Plugins

To be done.
