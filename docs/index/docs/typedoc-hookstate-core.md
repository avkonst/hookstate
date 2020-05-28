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
* [StateMixin](#interfacesstatemixinmd)
* [StateMixinDestroy](#interfacesstatemixindestroymd)

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
* [self](#const-self)

### Functions

* [DevTools](#devtools)
* [Downgraded](#downgraded)
* [StateFragment](#statefragment)
* [createState](#createstate)
* [useState](#usestate)

## Type aliases

###  InferredStateKeysType

Ƭ **InferredStateKeysType**: *`S extends ReadonlyArray<infer _> ? ReadonlyArray<number> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S> : undefined`*

*Defined in [index.d.ts:61](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L61)*

Return type of [StateMethods.keys](#readonly-keys).

___

###  InferredStateOrnullType

Ƭ **InferredStateOrnullType**: *`S extends undefined ? undefined : S extends null ? null : State<S>`*

*Defined in [index.d.ts:67](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L67)*

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

*Defined in [index.d.ts:313](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L313)*

Type of a result of [createState](#createstate) and [useState](#usestate) functions

## Variables

### `Const` none

• **none**: *any*

*Defined in [index.d.ts:55](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L55)*

Special symbol which might be used to delete properties
from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).

[Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)

___

### `Const` postpone

• **postpone**: *keyof symbol*

*Defined in [index.d.ts:48](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L48)*

Special symbol which might be returned by onPromised callback of [StateMethods.map](#map) function.

[Learn more...](https://hookstate.js.org/docs/asynchronous-state#executing-an-action-when-state-is-loaded)

___

### `Const` self

• **self**: *keyof symbol*

*Defined in [index.d.ts:42](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L42)*

Special symbol which is used as a property to switch
between [StateMethods](#interfacesstatemethodsmd) and the corresponding [State](#state).

[Learn more...](https://hookstate.js.org/docs/nested-state)

## Functions

###  DevTools

▸ **DevTools**<**S**>(`state`: [State](#state)‹S›): *[DevToolsExtensions](#interfacesdevtoolsextensionsmd)*

*Defined in [index.d.ts:560](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L560)*

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

*Defined in [index.d.ts:522](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L522)*

A plugin which allows to opt-out from usage of Javascript proxies for
state usage tracking. It is useful for performance tuning.

[Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)

**Returns:** *[Plugin](#interfacespluginmd)*

___

###  StateFragment

▸ **StateFragment**<**S**>(`props`: object): *ReactElement*

*Defined in [index.d.ts:500](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L500)*

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

*Defined in [index.d.ts:512](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L512)*

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

▸ **createState**<**S**>(`initial`: [SetInitialStateAction](#setinitialstateaction)‹S›): *[State](#state)‹S› & [StateMixinDestroy](#interfacesstatemixindestroymd)*

*Defined in [index.d.ts:434](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L434)*

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

**Returns:** *[State](#state)‹S› & [StateMixinDestroy](#interfacesstatemixindestroymd)*

(#state) instance,
which can be used directly to get and set state value
outside of React components.
When you need to use the state in a functional `React` component,
pass the created state to [useState](#usestate) function and
use the returned result in the component's logic.

___

###  useState

▸ **useState**<**S**>(`source`: [State](#state)‹S›): *[State](#state)‹S›*

*Defined in [index.d.ts:462](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L462)*

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

*Defined in [index.d.ts:490](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L490)*

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

*Defined in [index.d.ts:539](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L539)*

Assigns custom label to identify the state in the development tools

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`name` | string | label for development tools  |

**Returns:** *void*

___

####  log

▸ **log**(`str`: string, `data?`: any): *void*

*Defined in [index.d.ts:543](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L543)*

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

*Defined in [index.d.ts:397](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L397)*

Unique identifier of a plugin.

___

#### `Optional` `Readonly` init

• **init**? : *undefined | function*

*Defined in [index.d.ts:401](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L401)*

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

*Defined in [index.d.ts:385](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L385)*

___

#### `Optional` `Readonly` onBatchStart

• **onBatchStart**? : *undefined | function*

*Defined in [index.d.ts:384](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L384)*

___

#### `Optional` `Readonly` onDestroy

• **onDestroy**? : *undefined | function*

*Defined in [index.d.ts:383](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L383)*

___

#### `Optional` `Readonly` onSet

• **onSet**? : *undefined | function*

*Defined in [index.d.ts:382](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L382)*


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

*Defined in [index.d.ts:373](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L373)*

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:371](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L371)*

___

#### `Optional` `Readonly` state

• **state**? : *StateValueAtRoot*

*Defined in [index.d.ts:372](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L372)*


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

*Defined in [index.d.ts:364](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L364)*


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

*Defined in [index.d.ts:357](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L357)*

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:353](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L353)*

___

#### `Optional` `Readonly` previous

• **previous**? : *StateValueAtPath*

*Defined in [index.d.ts:355](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L355)*

___

#### `Optional` `Readonly` state

• **state**? : *StateValueAtRoot*

*Defined in [index.d.ts:354](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L354)*

___

#### `Optional` `Readonly` value

• **value**? : *StateValueAtPath*

*Defined in [index.d.ts:356](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L356)*


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

*Defined in [index.d.ts:80](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L80)*

Get state value, but do not leave the traces of reading it.

**Returns:** *S*

___

####  mergeUntracked

▸ **mergeUntracked**(`mergeValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *[Path](#path)[]*

*Defined in [index.d.ts:92](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L92)*

Merge new state value, but do not trigger rerender.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`mergeValue` | [SetPartialStateAction](#setpartialstateaction)‹S› | new partial value to merge with the current state value and set.  |

**Returns:** *[Path](#path)[]*

___

####  rerender

▸ **rerender**(`paths`: [Path](#path)[]): *void*

*Defined in [index.d.ts:98](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L98)*

Trigger rerender for hooked states, where values at the specified paths are used.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`paths` | [Path](#path)[] | paths of the state variables to search for being used by components and rerender  |

**Returns:** *void*

___

####  setUntracked

▸ **setUntracked**(`newValue`: [SetStateAction](#setstateaction)‹S›): *[Path](#path)[]*

*Defined in [index.d.ts:86](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L86)*

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

* [[self]](#self)
* [keys](#readonly-keys)
* [ornull](#ornull)
* [path](#readonly-path)
* [value](#readonly-value)

#### Methods

* [attach](#attach)
* [get](#get)
* [map](#map)
* [merge](#merge)
* [set](#set)

### Properties

####  [self]

• **[self]**: *[State](#state)‹S›*

*Defined in [index.d.ts:111](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L111)*

Returns the state instance managed by these methods.

___

#### `Readonly` keys

• **keys**: *[InferredStateKeysType](#inferredstatekeystype)‹S›*

*Defined in [index.d.ts:133](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L133)*

Return the keys of nested states.
For a given state of [State](#state) type,
`state[self].keys` will be structurally equal to Object.keys(state),
with two minor difference:
1. if `state[self].value` is an array, the returned result will be
an array of numbers, not strings like with `Object.keys`.
2. if `state[self].value` is not an object, the returned result will be undefined.

___

####  ornull

• **ornull**: *[InferredStateOrnullType](#inferredstateornulltype)‹S›*

*Defined in [index.d.ts:252](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L252)*

If state value is null or undefined, returns state value.
Otherwise, it returns this state instance but
with null and undefined removed from the type parameter.

[Learn more...](https://hookstate.js.org/docs/nullable-state)

___

#### `Readonly` path

• **path**: *[Path](#path)*

*Defined in [index.d.ts:123](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L123)*

'Javascript' object 'path' to an element relative to the root object
in the state. For example:

```tsx
const state = useState([{ name: 'First Task' }])
state[self].path IS []
state[0][self].path IS [0]
state.[0].name[self].path IS [0, 'name']
```

___

#### `Readonly` value

• **value**: *S*

*Defined in [index.d.ts:155](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L155)*

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [StateMethods.get](#get) method.

This property is more useful than [get](#get) method for the cases,
when a value may hold null or undefined values.
Typescript compiler does not handle elimination of undefined with get(),
like in the following examples, but value does:

```tsx
const state = useState<number | undefined>(0)
const myvalue: number = state[self].value
     ? state[self].value + 1
     : 0; // <-- compiles
const myvalue: number = state[self].get()
     ? state[self].get() + 1
     : 0; // <-- does not compile
```

### Methods

####  attach

▸ **attach**(`plugin`: function): *[State](#state)‹S›*

*Defined in [index.d.ts:258](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L258)*

Adds plugin to the state.

[Learn more...](https://hookstate.js.org/docs/extensions-overview)

**Parameters:**

▪ **plugin**: *function*

▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[State](#state)‹S›*

▸ **attach**(`pluginId`: symbol): *[[PluginCallbacks](#interfacesplugincallbacksmd) | Error, [PluginStateControl](#interfacespluginstatecontrolmd)‹S›]*

*Defined in [index.d.ts:268](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L268)*

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

####  get

▸ **get**(): *S*

*Defined in [index.d.ts:162](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L162)*

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [StateMethods.value](#readonly-value) method.

**Returns:** *S*

___

####  map

▸ **map**<**R**, **RL**, **RE**, **C**>(`action`: function, `onPromised`: function, `onError`: function, `context?`: Exclude‹C, Function›): *R | RL | RE*

*Defined in [index.d.ts:208](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L208)*

Maps this state to the result via the provided action.

**Type parameters:**

▪ **R**

▪ **RL**

▪ **RE**

▪ **C**

**Parameters:**

▪ **action**: *function*

mapper function

▸ (`s`: [State](#state)‹S›): *R*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪ **onPromised**: *function*

this will be invoked instead of the action function,
if a state value is unresolved promise.
[Learn more about async states...](https://hookstate.js.org/docs/asynchronous-state)

▸ (`s`: [State](#state)‹S›): *RL*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪ **onError**: *function*

this will be invoked instead of the action function,
if a state value is a promise resolved to an error.
[Learn more about async states...](https://hookstate.js.org/docs/asynchronous-state)

▸ (`e`: StateErrorAtRoot, `s`: [State](#state)‹S›): *RE*

**Parameters:**

Name | Type |
------ | ------ |
`e` | StateErrorAtRoot |
`s` | [State](#state)‹S› |

▪`Optional`  **context**: *Exclude‹C, Function›*

if specified, the callbacks will be invoked in a batch.
Updating state within a batch does not trigger immediate rerendering.
Instead, all required rerendering is done once once the batch is finished.
[Learn more about batching...](https://hookstate.js.org/docs/performance-batched-updates

**Returns:** *R | RL | RE*

▸ **map**<**R**, **RL**, **C**>(`action`: function, `onPromised`: function, `context?`: Exclude‹C, Function›): *R | RL*

*Defined in [index.d.ts:223](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L223)*

Maps this state to the result via the provided action.

**Type parameters:**

▪ **R**

▪ **RL**

▪ **C**

**Parameters:**

▪ **action**: *function*

mapper function

▸ (`s`: [State](#state)‹S›): *R*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪ **onPromised**: *function*

this will be invoked instead of the action function,
if a state value is unresolved promise.
[Learn more about async states...](https://hookstate.js.org/docs/asynchronous-state)

▸ (`s`: [State](#state)‹S›): *RL*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪`Optional`  **context**: *Exclude‹C, Function›*

if specified, the callbacks will be invoked in a batch.
Updating state within a batch does not trigger immediate rerendering.
Instead, all required rerendering is done once once the batch is finished.
[Learn more about batching...](https://hookstate.js.org/docs/performance-batched-updates

**Returns:** *R | RL*

▸ **map**<**R**, **C**>(`action`: function, `context?`: Exclude‹C, Function›): *R*

*Defined in [index.d.ts:234](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L234)*

Maps this state to the result via the provided action.

**Type parameters:**

▪ **R**

▪ **C**

**Parameters:**

▪ **action**: *function*

mapper function

▸ (`s`: [State](#state)‹S›): *R*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [State](#state)‹S› |

▪`Optional`  **context**: *Exclude‹C, Function›*

if specified, the callbacks will be invoked in a batch.
Updating state within a batch does not trigger immediate rerendering.
Instead, all required rerendering is done once once the batch is finished.
[Learn more about batching...](https://hookstate.js.org/docs/performance-batched-updates

**Returns:** *R*

▸ **map**(): *[boolean, StateErrorAtRoot | undefined, S | undefined]*

*Defined in [index.d.ts:244](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L244)*

Unfolds this state to an array representing promise state.
The first element of the array result indicates if promise is loading
(true - loading: promise is not resolved, false - not loading: promise is resolved).
The second element with be either undefined or a value of an error,
which the resolved promise rejected. The third element will be
either undefined or a value of a state, if promise is resolved.
[Learn more about async states...](https://hookstate.js.org/docs/asynchronous-state)

**Returns:** *[boolean, StateErrorAtRoot | undefined, S | undefined]*

___

####  merge

▸ **merge**(`newValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *void*

*Defined in [index.d.ts:189](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L189)*

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

####  set

▸ **set**(`newValue`: [SetStateAction](#setstateaction)‹S›): *void*

*Defined in [index.d.ts:177](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L177)*

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

*Defined in [index.d.ts:280](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L280)*

Destroys an instance of a state, so
it can clear the allocated native resources (if any)
and can not be used anymore after it has been destroyed.

**Returns:** *void*


<a name="interfacesstatemixinmd"/>


## Interface: StateMixin <**S**>

User's state mixin with the special `self`-symbol property,
which allows to get [StateMethods](#interfacesstatemethodsmd) for a [State](#state).

### Type parameters

▪ **S**

Type of a value of a state

### Hierarchy

* **StateMixin**

### Index

#### Properties

* [[self]](#self-1)

### Properties

####  [self]

• **[self]**: *[StateMethods](#interfacesstatemethodsmd)‹S›*

*Defined in [index.d.ts:292](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L292)*

Returns [StateMethods](#interfacesstatemethodsmd) for a [State](#state)


<a name="interfacesstatemixindestroymd"/>


## Interface: StateMixinDestroy

User's state mixin with the special `self`-symbol property,
which allows to get [StateMethodsDestroy](#interfacesstatemethodsdestroymd) for a [State](#state).

### Hierarchy

* **StateMixinDestroy**

### Index

#### Properties

* [[self]](#self-2)

### Properties

####  [self]

• **[self]**: *[StateMethodsDestroy](#interfacesstatemethodsdestroymd)*

*Defined in [index.d.ts:302](https://github.com/avkonst/hookstate/blob/master/dist/index.d.ts#L302)*

Returns [StateMethodsDestroy](#interfacesstatemethodsdestroymd) for a [State](#state)
