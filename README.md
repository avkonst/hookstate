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

  - [Valuelink](https://www.npmjs.com/package/valuelink) for complex local state management and two-way data binding. 
    - This work was initially inspired by the implementation of [Valuelink](https://www.npmjs.com/package/valuelink), but I wanted greater type-safety of the API and some other features to handle greater variety of usecases in concise and simple way.
  - [react-use](https://github.com/streamich/react-use) `useList` and `useMap` libraries for local state management of arrays and objects
  - [Mobx-react-lite](https://www.npmjs.com/package/mobx-react-lite) for global state management

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
TBD