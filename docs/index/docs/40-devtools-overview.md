---
id: devtools
title: Development Tools Overview
sidebar_label: Overview
---

## Setting up

* Devtools is an extension. Hookstate-4 requires it to be added explicitly to a state, by providing it as a second argument to `hookstate` or `useHookstate` functions.
* If a state does not have `identifiable` extension attached as well, `devtools` extension should be initialized with the `key` option.

    ```tsx
    import { devtools } from '@hookstate/devtools'
    let state = hookstate(value, devtools({ key: 'my-state-label' }))
    ```

    ```tsx
    import { identifiable } from '@hookstate/identifiable'
    import { devtools } from '@hookstate/devtools'
    let state = hookstate(value, extend(identifiable('my-state-label'), devtools()))
    ```

* Install [Chrome browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and reload your app.

There is no impact on performance in production. Development tools are activated only when the browser's extension is opened.

## Demo

[Demo application](https://github.com/avkonst/hookstate/tree/master/docs/demos/todolist) has got DevTools integrated. Try it out!

## Set state value from the development tools

You can set new value for a state at root or at a specific path using the development tools.
Put content for an action in the 'Dispatch' form and click 'Dispatch' button.

The easiest way to learn the content of a dispatch action is to inspect an action data for the state update, triggered within an application.

## Toggle breakpoint on state update

Trigger a dispatch action from the Redux development tools with the following content:

```tsx
{
    type: 'BREAKPOINT',
}
```

Now any event, which sets a state, will trigger a breakpoint in the browser.

To disable the breakpoint, repeat the same dispatch action again.

## Pausing/Unpausing monitoring

Click 'Pause recording' button (bottom row) in the development tools.

## Persist state on page reload

Click 'Persist' button (bottom row) in the development tools.
