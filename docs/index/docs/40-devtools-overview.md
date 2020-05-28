---
id: devtools
title: Development Tools Overview
sidebar_label: Overview
---

## Setting up

* Insert the line `import '@hookstate/devtools'` in the root of your React app, for example in index.ts or index.js file. The tools should be imported before importing other modules, which create or use states.
* Install [Chrome browser's extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) and reload your app.

There is no impact on performance in production. Development tools are activated only when the browser's extension is opened.

## Demo

[Demo application](https://hookstate.js.org/demo-todolist) has got DevTools intergrated. Try it out!

## Configuring monitored states

When the browser's extension is opened, all global and all explicitly labelled states are monitored, by default.

You can inspect all found states, their names and if they are monitored or not in the inspector consoler for the `@hookstate/devtools: settings` state. The status is printed in the development tools, like the following:

```
:: CREATE 'StateName' (monitored)
```

The `StateName` will be either a module name for a global state, component name for a local not explicitly labelled state, or your custom assigned DevTools label of a state.

If a state is not monitored, you can enable monitoring using 1 of the following methods:

1. Assign explicit label to a state.
2. Configure `@hookstate/devtools: settings` on application start up
3. Configure `@hookstate/devtools: settings` from the browser's extension

All methods are considered below.

### Assign a label for a state

In order to label a state use the following:

```tsx
import { DevTools } from '@hookstate/core'
...
state = createState(...)
DevTools(state).label('my-state')
// Or:
state = useState(...)
DevTools(state).label('my-state')
```

### Configure `@hookstate/devtools: settings` on start up

In order to configure the list of monitored states and other settings use the following:

```tsx
import { DevToolsInitialize } from '@hookstate/devtools'
DevToolsInitialize({
    monitored: ['NameOfState1', 'NameOfState2'],
    callstacksDepth: 30
})
```

### Configure `@hookstate/devtools: settings` from the browser's extension

This method work only in the Web environment where local storage is available.

* Open the development tools browser's extension 
* Choose Inspect mode (top left drop down list)
* Choose `@hookstate/devtools: settings` state (top right drop down list)
* Click 'Dispatcher' button (bottom row buttons) to make sure 'dispatch' form is active
* Put the following content to the 'dispatch' form:
    ```tsx
    {
        type: 'SET',
        value: {
            monitored: ['NameOfState1', 'NameOfState2'],
            callstacksDepth: 30
        }
    }
    ```
* Clich 'Dispatch' button (bottom right button)
* Reload the application

Now all the states enumerated in the `monitored` list will be monitored.

## Set state value from the development tools

You can set new value for a state at root or at a specific path using the development tools.
Put content for an action in the 'Dispatch' form and click 'Dispatch' button.

The easiest way to learn the content of a dispatch action is to inspect an action data for the state update, triggered within an application.

Note: this method is used to configure `@hookstate/devtools: settings` as documented above.

## Rerender components which use state value at path

Open React development tools browser's extension and enable 'Highlight on rerender' option. Trigger a dispatch action from the Redux development tools with the following content:

```tsx
{
    type: 'RERENDER',
    path: []
}
```

Path in the above example points to the root of a state. It can also point to a nested path. Learn more about [state path](./typedoc-hookstate-core#path).

## Toogle breakpoint on state update

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

## Log custom data per state

It is possible to log custom data to the development tools:

```tsx
const state = useState(...)
...
DevTools(state).log('this is custom log', myData)
```

This log data will be visible alongside all other actions, like state updates, attributed to a state.
