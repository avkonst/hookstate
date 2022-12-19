---
id: server-side-rendering
title: Server Side Rendering (SSR) with Hookstate
sidebar_label: Server Side Rendering
---

As Hookstate is built on top of the standard `React.useState` and `React.useEffect` hooks, it should support SSR as the standard React hooks would support. There are many frameworks with SSR support, each has their own rules and tools fr SSR. Follow the specific guidelines for SSR in relation to `React.useState` for the framework you use. The same should apply to `useHookstate` hook.

We know a number of cases where a Hookstate is used with NextJS SSR.
