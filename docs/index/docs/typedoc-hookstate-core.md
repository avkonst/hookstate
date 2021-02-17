---
id: typedoc-hookstate-core
title: API @hookstate/core
---




## Index

### Interfaces

* [DevToolsExtensions](#interfacesdevtoolsextensionsmd)
* [Plugin](#interfacespluginmd)
* [PluginCallbacks](#interfacesplugincallbacksmd)
* [PluginCallbacksOnBatchArgument](#interfacesplugincallbacksonbatchargumentmd)
* [PluginCallbacksOnDestroyArgument](#interfacesplugincallbacksondestroyargumentmd)
* [PluginCallbacksOnSetArgument](#interfacesplugincallbacksonsetargumentmd)
* [PluginStateControl](#interfacespluginstatecontrolmd)
* [StateMethods](#interfacesstatemethodsmd)
* [StateMethodsDestroy](#interfacesstatemethodsdestroymd)

### Type aliases

* [InferredStateKeysType](#inferredstatekeystype)
* [InferredStateOrnullType](#inferredstateornulltype)
* [Path](#path)
* [SetInitialStateAction](#setinitialstateaction)
* [SetPartialStateAction](#setpartialstateaction)
* [SetStateAction](#setstateaction)
* [State](#state)

### Variables

* [none](#const-none)
* [postpone](#const-postpone)

### Functions

* [DevTools](#devtools)
* [Downgraded](#downgraded)
* [StateFragment](#statefragment)
* [createState](#createstate)
* [useHookstate](#usehookstate)
* [useState](#usestate)

## Type aliases

###  InferredStateKeysType

Ƭ **InferredStateKeysType**: *`S extends ReadonlyArray<infer _> ? ReadonlyArray<number> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S> : undefined`*

*Defined in [index.d.ts:54](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L54)*

Return type of [StateMethods.keys](#readonly-keys).

___

###  InferredStateOrnullType

Ƭ **InferredStateOrnullType**: *`S extends undefined ? undefined : S extends null ? null : State<S>`*

*Defined in [index.d.ts:60](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L60)*

Return type of [StateMethods.map()](#map).

___

###  Path

Ƭ **Path**: *`ReadonlyArray‹string | number›`*

*Defined in [index.d.ts:17](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L17)*

'JSON path' from root of a state object to a nested property.
Return type of [StateMethod.path](#readonly-path).

For example, an object `{ a: [{ b: 1 }, { 1000: 'value' }, '3rd'] }`,
has got the following paths pointing to existing properties:

- `[]`
- `['a']`
- `['a', 0]`
- `['a', 0, 'b']`
- `['a', 1]`
- `['a', 1, 1000]`
- `['a', 2]`

___

###  SetInitialStateAction

Ƭ **SetInitialStateAction**: *`S | Promise‹S› | function`*

*Defined in [index.d.ts:35](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L35)*

Type of an argument of [createState](#createstate) and [useState](#usestate).

___

###  SetPartialStateAction

Ƭ **SetPartialStateAction**: *`S extends ReadonlyArray<> ? ReadonlyArray<U> | Record<number, U> | function : S extends object | string ? Partial<S> | function : React.SetStateAction<S>`*

*Defined in [index.d.ts:29](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L29)*

Type of an argument of [StateMethods.merge](#merge).

___

###  SetStateAction

Ƭ **SetStateAction**: *`S | Promise‹S› | function`*

*Defined in [index.d.ts:23](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L23)*

Type of an argument of [StateMethods.set](#set).

___

###  State

Ƭ **State**: *[StateMixin](#interfacesstatemixinmd) & `S extends object` ? `{ readonly [K in keyof Required<S>]: State<S[K]> }` : [StateMethods](#interfacesstatemethodsmd)*

*Defined in [index.d.ts:254](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L254)*

Type of a result of [createState](#createstate) and [useState](#usestate) functions

## Variables

### `Const` none

• **none**: *any*

*Defined in [index.d.ts:48](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L48)*

Special symbol which might be used to delete properties
from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).

[Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)

___

### `Const` postpone

• **postpone**: *keyof symbol*

*Defined in [index.d.ts:41](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L41)*

Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.

[Learn more...](https://hookstate.js.org/docs/asynchronous-state#executing-an-action-when-state-is-loaded)

## Functions

###  DevTools

▸ **DevTools**<**S**>(`state`: [State](#state)‹S›): *[DevToolsExtensions](#interfacesdevtoolsextensionsmd)*

*Defined in [index.d.ts:511](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L511)*

Returns access to the development tools for a given state.
Development tools are delivered as optional plugins.
You can activate development tools from `@hookstate/devtools`package,
for example. If no development tools are activated,
it returns an instance of dummy tools, which do nothing, when called.

[Learn more...](https://hookstate.js.org/docs/devtools)

**Type parameters:**

▪ **S**

Type of a value of a state

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`state` | [State](#state)‹S› | A state to relate to the extension.  |

**Returns:** *[DevToolsExtensions](#interfacesdevtoolsextensionsmd)*

Interface to interact with the development tools for a given state.

___

###  Downgraded

▸ **Downgraded**(): *[Plugin](#interfacespluginmd)*

*Defined in [index.d.ts:473](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L473)*

A plugin which allows to opt-out from usage of Javascript proxies for
state usage tracking. It is useful for performance tuning.

[Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)

**Returns:** *[Plugin](#interfacespluginmd)*

___

###  StateFragment

▸ **StateFragment**<**S**>(`props`: object): *ReactElement*

*Defined in [index.d.ts:451](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L451)*

Allows to use a state without defining a functional react component.
It can be also used in class-based React components. It is also
particularly usefull for creating *scoped* states.

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

**Type parameters:**

▪ **S**

Type of a value of a state

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [State](#state)‹S› |

**Returns:** *ReactElement*

▸ **StateFragment**<**S**>(`props`: object): *ReactElement*

*Defined in [index.d.ts:463](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L463)*

Allows to use a state without defining a functional react component.
See more at [StateFragment](#statefragment)

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

**Type parameters:**

▪ **S**

Type of a value of a state

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [SetInitialStateAction](#setinitialstateaction)‹S› |

**Returns:** *ReactElement*

___

###  createState

▸ **createState**<**S**>(`initial`: [SetInitialStateAction](#setinitialstateaction)‹S›): *[State](#state)‹S› & [StateMethodsDestroy](#interfacesstatemethodsdestroymd)*

*Defined in [index.d.ts:375](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L375)*

Creates new state and returns it.

You can create as many global states as you need.

When you the state is not needed anymore,
it should be destroyed by calling
`destroy()` method of the returned instance.
This is necessary for some plugins,
which allocate native resources,
like subscription to databases, broadcast channels, etc.
In most cases, a global state is used during
whole life time of an application and would not require
destruction. However, if you have got, for example,
a catalog of dynamically created and destroyed global states,
the states should be destroyed as advised above.

**Type parameters:**

▪ **S**

Type of a value of the state

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`initial` | [SetInitialStateAction](#setinitialstateaction)‹S› | Initial value of the state. It can be a value OR a promise, which asynchronously resolves to a value, OR a function returning a value or a promise.  |

**Returns:** *[State](#state)‹S› & [StateMethodsDestroy](#interfacesstatemethodsdestroymd)*

(#state) instance,
which can be used directly to get and set state value
outside of React components.
When you need to use the state in a functional `React` component,
pass the created state to [useState](#usestate) function and
use the returned result in the component's logic.

___

###  useHookstate

▸ **useHookstate**<**S**>(`source`: [State](#state)‹S›): *[State](#state)‹S›*

*Defined in [index.d.ts:436](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L436)*

Alias to [useState](#usestate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [State](#state)‹S› |

**Returns:** *[State](#state)‹S›*

▸ **useHookstate**<**S**>(`source`: [SetInitialStateAction](#setinitialstateaction)‹S›): *[State](#state)‹S›*

*Defined in [index.d.ts:441](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L441)*

Alias to [useState](#usestate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [SetInitialStateAction](#setinitialstateaction)‹S› |

**Returns:** *[State](#state)‹S›*

___

###  useState

▸ **useState**<**S**>(`source`: [State](#state)‹S›): *[State](#state)‹S›*

*Defined in [index.d.ts:403](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L403)*

Enables a functional React component to use a state,
either created by [createState](#createstate) (*global* state) or
derived from another call to [useState](#usestate) (*scoped* state).

The `useState` forces a component to rerender everytime, when:
- a segment/part of the state data is updated *AND only if*
- this segement was **used** by the component during or after the latest rendering.

For example, if the state value is `{ a: 1, b: 2 }` and
a component uses only `a` property of the state, it will rerender
only when the whole state object is updated or when `a` property is updated.
Setting the state value/property to the same value is also considered as an update.

A component can use one or many states,
i.e. you may call `useState` multiple times for multiple states.

The same state can be used by multiple different components.

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`source` | [State](#state)‹S› | a reference to the state to hook into  The `useState` is a hook and should follow React's rules of hooks.  |

**Returns:** *[State](#state)‹S›*

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

▸ **useState**<**S**>(`source`: [SetInitialStateAction](#setinitialstateaction)‹S›): *[State](#state)‹S›*

*Defined in [index.d.ts:431](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L431)*

This function enables a functional React component to use a state,
created per component by [useState](#usestate) (*local* state).
In this case `useState` behaves similarly to `React.useState`,
but the returned instance of [State](#state)
has got more features.

When a state is used by only one component, and maybe it's children,
it is recommended to use *local* state instead of *global*,
which is created by [createState](#createstate).

*Local* (per component) state is created when a component is mounted
and automatically destroyed when a component is unmounted.

The same as with the usage of a *global* state,
`useState` forces a component to rerender when:
- a segment/part of the state data is updated *AND only if*
- this segement was **used** by the component during or after the latest rendering.

You can use as many local states within the same component as you need.

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`source` | [SetInitialStateAction](#setinitialstateaction)‹S› | An initial value state.  |

**Returns:** *[State](#state)‹S›*

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

# Interfaces


<a name="interfacesdevtoolsextensionsmd"/>


## Interface: DevToolsExtensions

Return type of [DevTools](#devtools).

### Hierarchy

* **DevToolsExtensions**

### Index

#### Methods

* [label](#label)
* [log](#log)

### Methods

####  label

▸ **label**(`name`: string): *void*

*Defined in [index.d.ts:490](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L490)*

Assigns custom label to identify the state in the development tools

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`name` | string | label for development tools  |

**Returns:** *void*

___

####  log

▸ **log**(`str`: string, `data?`: any): *void*

*Defined in [index.d.ts:494](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L494)*

Logs to the development tools

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |
`data?` | any |

**Returns:** *void*


<a name="interfacespluginmd"/>


## Interface: Plugin

For plugin developers only.
Hookstate plugin specification and factory method.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Hierarchy

* **Plugin**

### Index

#### Properties

* [id](#readonly-id)
* [init](#optional-readonly-init)

### Properties

#### `Readonly` id

• **id**: *symbol*

*Defined in [index.d.ts:338](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L338)*

Unique identifier of a plugin.

___

#### `Optional` `Readonly` init

• **init**? : *undefined | function*

*Defined in [index.d.ts:342](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L342)*

Initializer for a plugin when it is attached for the first time.


<a name="interfacesplugincallbacksmd"/>


## Interface: PluginCallbacks

For plugin developers only.
Set of callbacks, a plugin may subscribe to.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Hierarchy

* **PluginCallbacks**

### Index

#### Properties

* [onBatchFinish](#optional-readonly-onbatchfinish)
* [onBatchStart](#optional-readonly-onbatchstart)
* [onDestroy](#optional-readonly-ondestroy)
* [onSet](#optional-readonly-onset)

### Properties

#### `Optional` `Readonly` onBatchFinish

• **onBatchFinish**? : *undefined | function*

*Defined in [index.d.ts:326](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L326)*

___

#### `Optional` `Readonly` onBatchStart

• **onBatchStart**? : *undefined | function*

*Defined in [index.d.ts:325](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L325)*

___

#### `Optional` `Readonly` onDestroy

• **onDestroy**? : *undefined | function*

*Defined in [index.d.ts:324](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L324)*

___

#### `Optional` `Readonly` onSet

• **onSet**? : *undefined | function*

*Defined in [index.d.ts:323](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L323)*


<a name="interfacesplugincallbacksonbatchargumentmd"/>


## Interface: PluginCallbacksOnBatchArgument

For plugin developers only.
PluginCallbacks.onBatchStart/Finish argument type.

### Hierarchy

* **PluginCallbacksOnBatchArgument**

### Index

#### Properties

* [context](#optional-readonly-context)
* [path](#readonly-path)
* [state](#optional-readonly-state)

### Properties

#### `Optional` `Readonly` context

• **context**? : *AnyContext*

*Defined in [index.d.ts:314](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L314)*

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:312](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L312)*

___

#### `Optional` `Readonly` state

• **state**? : *StateValueAtRoot*

*Defined in [index.d.ts:313](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L313)*


<a name="interfacesplugincallbacksondestroyargumentmd"/>


## Interface: PluginCallbacksOnDestroyArgument

For plugin developers only.
PluginCallbacks.onDestroy argument type.

### Hierarchy

* **PluginCallbacksOnDestroyArgument**

### Index

#### Properties

* [state](#optional-readonly-state)

### Properties

#### `Optional` `Readonly` state

• **state**? : *StateValueAtRoot*

*Defined in [index.d.ts:305](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L305)*


<a name="interfacesplugincallbacksonsetargumentmd"/>


## Interface: PluginCallbacksOnSetArgument

For plugin developers only.
PluginCallbacks.onSet argument type.

### Hierarchy

* **PluginCallbacksOnSetArgument**

### Index

#### Properties

* [merged](#optional-readonly-merged)
* [path](#readonly-path)
* [previous](#optional-readonly-previous)
* [state](#optional-readonly-state)
* [value](#optional-readonly-value)

### Properties

#### `Optional` `Readonly` merged

• **merged**? : *StateValueAtPath*

*Defined in [index.d.ts:298](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L298)*

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:294](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L294)*

___

#### `Optional` `Readonly` previous

• **previous**? : *StateValueAtPath*

*Defined in [index.d.ts:296](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L296)*

___

#### `Optional` `Readonly` state

• **state**? : *StateValueAtRoot*

*Defined in [index.d.ts:295](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L295)*

___

#### `Optional` `Readonly` value

• **value**? : *StateValueAtPath*

*Defined in [index.d.ts:297](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L297)*


<a name="interfacespluginstatecontrolmd"/>


## Interface: PluginStateControl <**S**>

For plugin developers only.
An instance to manipulate the state in more controlled way.

### Type parameters

▪ **S**

Type of a value of a state

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Hierarchy

* **PluginStateControl**

### Index

#### Methods

* [getUntracked](#getuntracked)
* [mergeUntracked](#mergeuntracked)
* [rerender](#rerender)
* [setUntracked](#setuntracked)

### Methods

####  getUntracked

▸ **getUntracked**(): *S*

*Defined in [index.d.ts:73](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L73)*

Get state value, but do not leave the traces of reading it.

**Returns:** *S*

___

####  mergeUntracked

▸ **mergeUntracked**(`mergeValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *[Path](#path)[]*

*Defined in [index.d.ts:85](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L85)*

Merge new state value, but do not trigger rerender.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`mergeValue` | [SetPartialStateAction](#setpartialstateaction)‹S› | new partial value to merge with the current state value and set.  |

**Returns:** *[Path](#path)[]*

___

####  rerender

▸ **rerender**(`paths`: [Path](#path)[]): *void*

*Defined in [index.d.ts:91](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L91)*

Trigger rerender for hooked states, where values at the specified paths are used.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`paths` | [Path](#path)[] | paths of the state variables to search for being used by components and rerender  |

**Returns:** *void*

___

####  setUntracked

▸ **setUntracked**(`newValue`: [SetStateAction](#setstateaction)‹S›): *[Path](#path)[]*

*Defined in [index.d.ts:79](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L79)*

Set new state value, but do not trigger rerender.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`newValue` | [SetStateAction](#setstateaction)‹S› | new value to set to a state.  |

**Returns:** *[Path](#path)[]*


<a name="interfacesstatemethodsmd"/>


## Interface: StateMethods <**S**>

An interface to manage a state in Hookstate.

### Type parameters

▪ **S**

Type of a value of a state

### Hierarchy

* **StateMethods**

### Index

#### Properties

* [error](#readonly-error)
* [keys](#readonly-keys)
* [ornull](#ornull)
* [path](#readonly-path)
* [promised](#readonly-promised)
* [value](#readonly-value)

#### Methods

* [attach](#attach)
* [batch](#batch)
* [get](#get)
* [merge](#merge)
* [nested](#nested)
* [set](#set)

### Properties

#### `Readonly` error

• **error**: *StateErrorAtRoot | undefined*

*Defined in [index.d.ts:151](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L151)*

If a state was set to a promise and the promise was rejected,
this property will return the error captured from the promise rejection

___

#### `Readonly` keys

• **keys**: *[InferredStateKeysType](#inferredstatekeystype)‹S›*

*Defined in [index.d.ts:120](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L120)*

Return the keys of nested states.
For a given state of [State](#state) type,
`state.keys` will be structurally equal to Object.keys(state),
with two minor difference:
1. if `state.value` is an array, the returned result will be
an array of numbers, not strings like with `Object.keys`.
2. if `state.value` is not an object, the returned result will be undefined.

___

####  ornull

• **ornull**: *[InferredStateOrnullType](#inferredstateornulltype)‹S›*

*Defined in [index.d.ts:215](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L215)*

If state value is null or undefined, returns state value.
Otherwise, it returns this state instance but
with null and undefined removed from the type parameter.

[Learn more...](https://hookstate.js.org/docs/nullable-state)

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:110](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L110)*

'Javascript' object 'path' to an element relative to the root object
in the state. For example:

```tsx
const state = useState([{ name: 'First Task' }])
state.path IS []
state[0].path IS [0]
state.[0].name.path IS [0, 'name']
```

___

#### `Readonly` promised

• **promised**: *boolean*

*Defined in [index.d.ts:146](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L146)*

True if state value is not yet available (eg. equal to a promise)

___

#### `Readonly` value

• **value**: *S*

*Defined in [index.d.ts:142](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L142)*

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [StateMethods.get](#get) method.

This property is more useful than [get](#get) method for the cases,
when a value may hold null or undefined values.
Typescript compiler does not handle elimination of undefined with get(),
like in the following examples, but value does:

```tsx
const state = useState<number | undefined>(0)
const myvalue: number = state.value
     ? state.value + 1
     : 0; // <-- compiles
const myvalue: number = state.get()
     ? state.get() + 1
     : 0; // <-- does not compile
```

### Methods

####  attach

▸ **attach**(`plugin`: function): *[State](#state)‹S›*

*Defined in [index.d.ts:221](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L221)*

Adds plugin to the state.

[Learn more...](https://hookstate.js.org/docs/extensions-overview)

**Parameters:**

▪ **plugin**: *function*

▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[State](#state)‹S›*

▸ **attach**(`pluginId`: symbol): *[[PluginCallbacks](#interfacesplugincallbacksmd) | Error, [PluginStateControl](#interfacespluginstatecontrolmd)‹S›]*

*Defined in [index.d.ts:231](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L231)*

For plugin developers only.
It is a method to get the instance of the previously attached plugin.
If a plugin has not been attached to a state,
it returns an Error as the first element.
A plugin may trhow an error to indicate that plugin has not been attached.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

**Parameters:**

Name | Type |
------ | ------ |
`pluginId` | symbol |

**Returns:** *[[PluginCallbacks](#interfacesplugincallbacksmd) | Error, [PluginStateControl](#interfacespluginstatecontrolmd)‹S›]*

___

####  batch

▸ **batch**<**R**, **C**>(`action`: function, `context?`: Exclude‹C, Function›): *R*

*Defined in [index.d.ts:207](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L207)*

Runs the provided action callback with optimised re-rendering.
Updating state within a batch action does not trigger immediate rerendering.
Instead, all required rerendering is done once the batch is finished.

[Learn more about batching...](https://hookstate.js.org/docs/performance-batched-updates

**Type parameters:**

▪ **R**

▪ **C**

**Parameters:**

▪ **action**: *function*

callback function to execute in a batch

▸ (`s`: [State](#state)‹S›): *R*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪`Optional`  **context**: *Exclude‹C, Function›*

custom user's value, which is passed to plugins

**Returns:** *R*

___

####  get

▸ **get**(): *S*

*Defined in [index.d.ts:158](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L158)*

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [StateMethods.value](#readonly-value) method.

**Returns:** *S*

___

####  merge

▸ **merge**(`newValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *void*

*Defined in [index.d.ts:185](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L185)*

Similarly to [set](#set) method updates state value.

- If current state value is an object, it does partial update for the object.
- If state value is an array and the argument is an array too,
it concatenates the current value with the value of the argument and sets it to the state.
- If state value is an array and the `merge` argument is an object,
it does partial update for the current array value.
- If current state value is a string, it concatenates the current state
value with the argument converted to string and sets the result to the state.

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetPartialStateAction](#setpartialstateaction)‹S› |

**Returns:** *void*

___

####  nested

▸ **nested**<**K**>(`key`: K): *[State](#state)‹S[K]›*

*Defined in [index.d.ts:195](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L195)*

Returns nested state by key.
`state.nested('myprop')` returns the same as `state.myprop` or `state['myprop']`,
but also works for properties, which names collide with names of state methods.

[Learn more about nested states...](https://hookstate.js.org/docs/nested-state)

**Type parameters:**

▪ **K**: *keyof S*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`key` | K | child property name or index  |

**Returns:** *[State](../README.md#state)‹S[K]›*

___

####  set

▸ **set**(`newValue`: [SetStateAction](#setstateaction)‹S›): *void*

*Defined in [index.d.ts:173](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L173)*

Sets new value for a state.
If `this.path === []`,
it is similar to the `setState` variable returned by `React.useState` hook.
If `this.path !== []`, it sets only the segment of the state value, pointed out by the path.
Unlike [merge](#merge) method, this method will not accept partial updates.
Partial updates can be also done by walking the nested states and setting those.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`newValue` | [SetStateAction](#setstateaction)‹S› | new value to set to a state. It can be a value, a promise resolving to a value (only if [this.path](#readonly-path) is `[]`), or a function returning one of these. The function receives the current state value as an argument.  |

**Returns:** *void*


<a name="interfacesstatemethodsdestroymd"/>


## Interface: StateMethodsDestroy

Mixin for the [StateMethods](#interfacesstatemethodsmd) for a [State](#state),
which can be destroyed by a client.

### Hierarchy

* **StateMethodsDestroy**

### Index

#### Methods

* [destroy](#destroy)

### Methods

####  destroy

▸ **destroy**(): *void*

*Defined in [index.d.ts:243](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L243)*

Destroys an instance of a state, so
it can clear the allocated native resources (if any)
and can not be used anymore after it has been destroyed.

**Returns:** *void*
