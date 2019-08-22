# @hookstate/mutate

[![license](https://img.shields.io/github/license/avkonst/hookstate)](https://img.shields.io/github/license/avkonst/hookstate) [![npm version](https://img.shields.io/npm/v/@hookstate/mutate.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/mutate)


Plugin for @hookstate/core to add mutate actions specific for arrays, objects, strings and numbers. See [demo](https://hookstate.netlify.com/plugin-mutate).

## API Documentation

### Array state

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

There the following object mutation actions available:

- `set([...])` or `set((prevState) => [...])` sets new value of the object state. It has got the same behaviour as the second value returned from the `React.useState` function
- `merge({...})` or `merge((prevState) => ({...}))` sets new value of the object state, updating the specified properties
- `update(propertyKey, newPropertyValue)` or `update(propertyKey, (prevPropertyValue) => newPropertyValue)` sets new value of the object state, updating the specified property
