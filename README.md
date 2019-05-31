# React-use-state-x
Complex state management and global store done in type-safe, high-performance way using react useState/useContext hooks.

## Features

- Concise, pragmatic but flexible API with automated typescript type inferrence for any type of managed data.
- State management for complex state data, including:
  - arrays and objects
  - deeply nested combinations on arrays and objects
  - validation of input data
  - tracking of modifications
  - valuelink-like pattern for two-way data binding and form state management
- Global data state management using the same API
  - Allows to drop Mobx / Redux completely and simplify the source code a lot.
- Small bundle size. No external dependencies, except React.
- Written in typescript. Compiles to javascript module and typescript declarations.
- Performance tuned:
  - offers component-level cache state management to minimise re-rendering when necessary
  - efficient global state observer using only `React.useContext` and `React.useState`

## Alternatives

  - [valuelink](https://www.npmjs.com/package/valuelink) for complex local state management and two-way data binding. 
    - This work was initially inspired by the implementation of [valuelink](https://www.npmjs.com/package/valuelink), but I wanted greater type-safety of the API and some other features to handle greater variety of usecases in concise and simple way.
  - [react-use](https://github.com/streamich/react-use) `useList` and `useMap` libraries for local state management of arrays and objects
  - [mobx-react-lite](https://www.npmjs.com/package/mobx-react-lite) for global state management

## Installation

Using NPM:
```
npm install --save react-use-state-x
```

Using yarn:
```
yarn add react-use-state-x
```

## Documentation

### Array state

`useStateArray` returns the current state of an array instance and a set of functions to mutate the state of the array in various ways. The following example demonstrates the usage of `push` mutation action, which adds one more element in to the array.

```tsx
const UseStateArrayExample = () => {
    const [array, { push }] = useStateArray([1, 2]);
    return (
        <div>
            {array.join(',')}
            <button onClick={() => push(array.length)}>Add</button>
        </div>
    );
};
```

There the following array mutation actions available:

- `set([...])` or `set((prevState) => [...])` sets new value of the array state. It has got the same behaviour as the second value returned from the `React.useState` function
- `merge({...})` or `merge((prevState) => ({...}))` sets new value of the array state, updating the provided elements of the array, for example:
    ```ts
    merge({
        0: 'the first element is updated',
        4: 'and the fifth too',
    })
    ```
    Note: `prevState` variable in the callback is a clone/copy of the current array state
- `update(index, newElementValue)` or `update(index, (prevElementValue) => newElementValue)` sets new value of the array state, updating the element of an array by the specified index
- `concat([...])` or `concat((prevState) => [...])` sets new value of the array state, appending the provided array to the end of the current array.

    Note: `prevState` variable in the callback is a clone/copy of the current array state
- `push(newElement)` sets new value of the array state, adding new element to the end
- `pop()` sets new value of the array state, removing the last element
- `insert(indexWhereToInsert, newElement)` sets new value of the array state, inserting the new element by the specified index
- `remove(index)` sets new value of the array state, removing the element by the specified index
- `swap(index1, index2)` sets new value of the array state, swapping two elements by the specified indexes

### Object state

`useStateObject` returns the current state of an object instance and a set of functions to mutate the state of the object in various ways. The following example demonstrates the usage of `merge` mutation action, which updates the specified properties of the object.

```tsx
const UseStateObjectExample = () => {
    const [instance, { merge }] = useStateObject({ a: 1, b: 'two' });
    return (
        <div>
            {JSON.stringify(instance)}
            <button onClick={() => merge({ b: 'Three' })}>Modify instance</button>
        </div>
    );
};
```

There the following object mutation actions available:

- `set([...])` or `set((prevState) => [...])` sets new value of the object state. It has got the same behaviour as the second value returned from the `React.useState` function
- `merge({...})` or `merge((prevState) => ({...}))` sets new value of the object state, updating the specified properties
- `update(propertyKey, newPropertyValue)` or `update(index, (prevPropertyValue) => newPropertyValue)` sets new value of the object state, updating the specified property

