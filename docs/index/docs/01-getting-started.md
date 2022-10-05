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

## Installation and dependencies

The library does not have external or peer dependencies, except React.

```bash
npm install --save @hookstate/core
```

Or:

```bash
yarn add @hookstate/core
```

Hookstate consists of the core package `@hookstate/core` and optional plugins `@hookstate/*`, which you may include when needed. We have a goal of keeping the core library as small as possible but still feature-rich to address most of problems in state management and provide a good foundation for plugins. Plugins extend the library and address more specific needs. You can also write your own plugins: it is easy and gives a lot of power.

## Browser support

Hookstate supports all recent browsers and works where React works, including mobile applications and server side rendering.

### IE11 support

The library supports IE11 with a few exceptions for mutations of nested state, which has alternative working methods.
The [nested state](./nested-state) section notes these exceptions.

If you need to polyfill, for example for IE11, you need to make sure the following is supported by the target environment. You may checkout the existing [IE11 demo project](https://github.com/avkonst/hookstate/tree/master/docs/demos/ie11).
- ES5, `Map` and `Set` (All are available a long time ago, including for IE11)
- `Symbol` (You likely already have got one from the [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill). If you do not import [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill), you can get the standalone [`es6-symbol`](https://www.npmjs.com/package/es6-symbol))
- `Number.isInteger` (Polyfill is available from [`core-js/features/number/is-integer`](https://www.npmjs.com/package/core-js))
