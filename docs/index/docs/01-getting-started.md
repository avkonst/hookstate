---
id: getting-started
title: Getting started
sidebar_label: Getting started
---

import App from '@hookstate/todolist'

## Preface

We know you will learn the Hookstate library API very quickly without reading much (if any) of the documentation. The following will help you get started in minutes:

* **Intuitive API**. Most things will be self-explanatory. More in depth description will always be there.
* **Code samples** in each section are self-contained, complete and interactive. So, jump to the relevant section, copy-paste a sample to your app and extend it as needed.
* **IntelliSense by IDE.** If your project is in TypeScript, you will benefit a lot as type inference of the API functions supports any complexity of data structures of your states. Of course, you can also use it from plain JavaScript.
* **Complete demo application**. There is a *Todo-list-like* complete [demo application](https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist) built with Hookstate. It uses and demonstrates most of the core features of Hookstate. It gives an example of how to organise your project. You may follow the example or use any other module-composition structure. Here it is running embeded in the page:


<div style={{ 
  margin: 0,
  "-webkit-font-smoothing": "antialiased",
  "-moz-osx-font-smoothing": "grayscale",
  "background-color": "#282c34"
}}>
<App />
</div>

## Concepts

- Hookstate creates a state by [hookstate](typedoc-hookstate-core#hookstate) function tacking an initial value for a state.
- This state can be used directly to read / write the state, and it can be subscribed to in a React component by [useHookstate](typedoc-hookstate-core#usehookstate) function.
- [useHookstate](typedoc-hookstate-core#usehookstate) can create a state automatically if it takes an initial value instead of a state created by [hookstate](typedoc-hookstate-core#hookstate). 
  - States created by [hookstate](typedoc-hookstate-core#hookstate) are [global states](/docs/global-state), created and destroyed by an application. 
  - States created by [useHookstate](typedoc-hookstate-core#usehookstate) are [local states](/docs/local-state), created and destroyed by React when a component is mounted / unmounted.
- The initial provided state value becomes a mutable source of a state. It is expected to be mutated by only via Hookstate mechanisms, such as [State.set](typedoc-hookstate-core.md#set) and [State.merge](typedoc-hookstate-core.md#merge) methods.
- States returned by [hookstate](typedoc-hookstate-core#hookstate) and [useHookstate](typedoc-hookstate-core#usehookstate) functions allow drilling down to [nested children properties](/docs/nested-state), which are also State objects and have the same API as [local](/docs/local-state) and [global](/docs/global-state) states.
- State objects can be passed to components as properties. This effectively makes components' properties "writable".
- A state can be uplifted to a parent component, if the same state (for example, a form state) needs to be accessed by multiple children components. In contrast to other state management libraries, state uplifting does NOT cause performance downgrade, thanks to unique Hookstate feature, called [scoped state](/docs/scoped-state).
- Unified API for local, global, nested, scoped, extended and all other Hookstate states makes an application's code easier to develop and maintain (for example, move of a state from a local variable to a global variable or to a component property, does not require a component to be rewritten). 
- A state object can be enriched by standard and custom [extensions](/docs/extensions-overview). Extensions (or plugins, an alternative term) are super powerful as these allow to add type safe methods and properties to a State object, hook into state's lifecycle events, use and be combined with other extensions. This enables an elegant way to implement state persistence, remote server synchronization, and other advanced application specific use cases.
- A state object can be used in a dependency list argument for useEffect, useMemo, memo and other functions requiring dependency lists. Hookstate is the only known state management library, which supports mutable data source to be used in a dependency list. 

Developed with love by a developer for developers, who love writing concise, understandable and maintainable code. Enjoy!

## Installation and dependencies

The library does not have external or peer dependencies, except React.

```bash
npm install --save @hookstate/core
```

Or:

```bash
yarn add @hookstate/core
```

Hookstate consists of the core package `@hookstate/core` and optional extensions `@hookstate/*`, which you may include when needed. We have a goal of keeping the core library as small as possible but still feature-rich to address most of problems in state management and provide a good foundation for plugins. Plugins extend the library and address more specific needs. You can also write your own plugins: it is easy and gives a lot of power.

## Browser support

Hookstate supports all recent browsers and works where React works, including mobile applications and server side rendering.
