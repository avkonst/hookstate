<h1 align="center">
  Hookstate
</h1>

<p align="center">
  The most straightforward, extensible and incredibly fast state management that is based on React state hook.
</p>
<br/>

<p align="center">
  <a href="https://hookstate.js.org">Why?</a> •
  <a href="https://hookstate.js.org/docs/getting-started">Docs / Samples</a> •
  <a href="https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist">Demo application</a> •
  <a href="https://hookstate.js.org/docs/extensions-overview">Extensions</a> •
  <a href="https://hookstate.js.org/blog/tags/releases">Release notes</a>
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
  <a href="https://travis-ci.com/avkonst/hookstate">
    <img src="https://travis-ci.com/avkonst/hookstate.svg?branch=master" />
  </a>
  <a href="https://codecov.io/gh/avkonst/hookstate">
    <img src="https://codecov.io/gh/avkonst/hookstate/branch/master/graph/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@hookstate/core">
    <img src="https://img.shields.io/npm/v/@hookstate/core.svg?maxAge=300&label=version&colorB=007ec6" />
  </a>
</p>

## Preface

Hookstate is a modern alternative to Redux, Mobx, Recoil, etc. It is simple to learn, easy to use, extensible, very flexible and capable to address all state management needs of large scalable applications. It has got impressive performance and predictable behavior.

**Any questions? Just ask by raising a GitHub ticket.**

## Why Hookstate

[hookstate.js.org](https://hookstate.js.org)

## Migrating to version 4

[hookstate.js.org/docs/migrating-to-v4](https://hookstate.js.org/docs/migrating-to-v4)

## Documentation / Code samples / Demo applications

[hookstate.js.org/docs/getting-started](https://hookstate.js.org/docs/getting-started)

## Demo application

- Running: [https://hookstate.js.org/docs/getting-started](https://hookstate.js.org/docs/getting-started)
- Source code: [https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist](https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist)

## Development tools

[hookstate.js.org/docs/devtools](https://hookstate.js.org/docs/devtools)

## Plugins / Extensions

[hookstate.js.org/docs/extensions-overview](https://hookstate.js.org/docs/extensions-overview)

## API reference

[hookstate.js.org/docs/typedoc-hookstate-core](https://hookstate.js.org/docs/typedoc-hookstate-core)

## Hookstate developers workflow

This is the mono repository, which combine the Hookstate core package, extensions, docs and demo applications. `pnpm` is used as node_modules manager and `nx` as a scripts launcher. Each package defines its own rules how to build, test, etc.

From the repository root directory:

- `npm install -g pnpm` - install pnpm tool
- `pnpm install` - install node_modules for all packages

- `pnpm nx <script> <package>` - run script for a package as well as build dependencies if required, for example:
  - `pnpm nx build core` - run `build` script for `core` package
  - `pnpm nx start todolist` - run `start` script for `todolist` package as well as build for all dependencies
