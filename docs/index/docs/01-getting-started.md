---
id: getting-started
title: Getting started
sidebar_label: Getting started
---

## Preface

We know you will learn Hookstate library API very quickly without reading much (if any) of the documentation. The following will help you to get started in minutes:

* **Intuitive API**. Most of the things will be self-explanatory. More in depth description will be always there.
* **Code samples** in each section are self-contained, complete and interactive. So, jump to the relevant section, copy-paste a sample to your app and extend it as needed.
* **Intellisense by IDE.** If your project is in Typescript, you will benefit a lot as type inference of the API functions supports any complexity of data structures of your states. Of course, you can also use it from a plain javascript.
* **Complete demo application**. There is a *Todo-list-like* complete [demo application](https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist) built with Hookstate. It uses and demonstrates most of the core features of Hookstate. It gives an example how to organise your project. You may follow the example or use any other module-composition structure. Here it is running in `iframe`:

<iframe src="https://hookstate.js.org/demo-todolist" width="100%" height="700px"></iframe>

## Installation and dependencies

The library does not have external or peer dependencies, except React.

```bash
npm install --save @hookstate/core
```

Or:

```bash
yarn add @hookstate/core
```

Hookstate consists of the core package `@hookstate/core` and optional plugins `@hookstate/*`, which you may include when needed. We have got the goal to keep the core library as small as possible but still feature-rich to address most of problems in state management and provide with good foundation for plugins. Plugins extend the library and address more specific needs. You can also write your own plugins: it is easy and gives a lot of power.

## Browser support

It supports all recent browsers and works where React works, including mobile applications and server side rendering.

### IE11 support

If you need to polyfill, for example for IE11, you need to make sure the following is supported by the target environment. You may checkout existing [IE11 demo project](https://github.com/avkonst/hookstate/tree/master/docs/demos/ie11).
- ES5, `Map` and `Set` (All are available long time ago, including IE11)
- `Symbol` (You likely already have got one from the [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill). If you do not import [`react-app-polyfill`](https://www.npmjs.com/package/react-app-polyfill), you can get the standalone [`es6-symbol`](https://www.npmjs.com/package/es6-symbol))
- `Number.isInteger` (Polyfill is available from [`core-js/features/number/is-integer`](https://www.npmjs.com/package/core-js))
- `Proxy` (Sufficient for the library polyfill is available from `@hookstate/proxy-polyfill` package.
