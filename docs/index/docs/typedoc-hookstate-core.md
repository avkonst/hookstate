---
id: typedoc-hookstate-core
title: API @hookstate/core
---



## Table of contents

### Interfaces

- [Configuration](#interfacesconfigurationmd)
- [DevToolsExtensions](#interfacesdevtoolsextensionsmd)
- [Extension](#interfacesextensionmd)
- [Plugin](#interfacespluginmd)
- [PluginCallbacks](#interfacesplugincallbacksmd)
- [PluginCallbacksOnDestroyArgument](#interfacesplugincallbacksondestroyargumentmd)
- [PluginCallbacksOnSetArgument](#interfacesplugincallbacksonsetargumentmd)
- [PluginStateControl](#interfacespluginstatecontrolmd)
- [SetActionDescriptor](#interfacessetactiondescriptormd)
- [StateMethods](#interfacesstatemethodsmd)
- [StateMethodsDestroy](#interfacesstatemethodsdestroymd)
- [\_\_State](#interfaces_statemd)

### Type aliases

- [InferredStateKeysType](#inferredstatekeystype)
- [InferredStateOrnullType](#inferredstateornulltype)
- [Path](#path)
- [SetInitialStateAction](#setinitialstateaction)
- [SetPartialStateAction](#setpartialstateaction)
- [SetStateAction](#setstateaction)
- [State](#state)
- [StateExtension](#stateextension)
- [StateValue](#statevalue)
- [\_\_KeysOfType](#__keysoftype)

### Variables

- [\_\_state](#__state)
- [none](#none)

### Functions

- [DevTools](#devtools)
- [Downgraded](#downgraded)
- [StateFragment](#statefragment)
- [configure](#configure)
- [hookstate](#hookstate)
- [createState](#createstate)
- [extend](#extend)
- [hookMemo](#hookmemo)
- [useHookCallback](#usehookcallback)
- [useHookEffect](#usehookeffect)
- [useHookImperativeHandle](#usehookimperativehandle)
- [useHookInsertionEffect](#usehookinsertioneffect)
- [useHookLayoutEffect](#usehooklayouteffect)
- [useHookMemo](#usehookmemo)
- [useHookstate](#usehookstate)
- [useState](#usestate)

## Type aliases

### InferredStateKeysType

Ƭ **InferredStateKeysType**<`S`\>: `S` extends `ReadonlyArray`<infer \_\> ? `ReadonlyArray`<`number`\> : `S` extends ``null`` ? `undefined` : `S` extends `object` ? `ReadonlyArray`<keyof `S`\> : `undefined`

Return type of [StateMethods.keys](#readonly-keys).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |

#### Defined in

[index.ts:63](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L63)

___

### InferredStateOrnullType

Ƭ **InferredStateOrnullType**<`S`, `E`\>: `S` extends `undefined` ? `undefined` : `S` extends ``null`` ? ``null`` : [`State`](#state)<`S`, `E`\>

Return type of [StateMethods.map()](#map).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |
| `E` | - |

#### Defined in

[index.ts:74](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L74)

___

### Path

Ƭ **Path**: `ReadonlyArray`<`string` \| `number`\>

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

#### Defined in

[index.ts:23](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L23)

___

### SetInitialStateAction

Ƭ **SetInitialStateAction**<`S`\>: `S` \| `Promise`<`S`\> \| () => `S` \| `Promise`<`S`\>

Type of an argument of [createState](#createstate) and [useState](#usestate).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |

#### Defined in

[index.ts:48](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L48)

___

### SetPartialStateAction

Ƭ **SetPartialStateAction**<`S`\>: `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<`U`\> \| `Record`<`number`, `U`\> \| (`prevValue`: `S`) => `ReadonlyArray`<`U`\> \| `Record`<`number`, `U`\> : `S` extends `object` \| `string` ? `Partial`<`S`\> \| (`prevValue`: `S`) => `Partial`<`S`\> : `React.SetStateAction`<`S`\>

Type of an argument of [StateMethods.merge](#merge).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |

#### Defined in

[index.ts:37](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L37)

___

### SetStateAction

Ƭ **SetStateAction**<`S`\>: `S` \| `Promise`<`S`\> \| (`prevState`: `S`) => `S` \| `Promise`<`S`\>

Type of an argument of [StateMethods.set](#set).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |

#### Defined in

[index.ts:30](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L30)

___

### State

Ƭ **State**<`S`, `E`\>: [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> & `E` & `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<[`State`](#state)<`U`, `E`\>\> : `S` extends `object` ? `Omit`<{ readonly [K in keyof Required<S\>]: State<S[K], E\> }, keyof [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> \| keyof [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd) \| [`__KeysOfType`](#__keysoftype)<`S`, `Function`\> \| keyof `E`\> : {}

Type of a result of [createState](#createstate) and [useState](#usestate) functions

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `S` | `S` | Type of a value of a state  [Learn more about global states...](https://hookstate.js.org/docs/global-state) [Learn more about local states...](https://hookstate.js.org/docs/local-state) [Learn more about nested states...](https://hookstate.js.org/docs/nested-state) |
| `E` | {} | - |

#### Defined in

[index.ts:317](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L317)

___

### StateExtension

Ƭ **StateExtension**<`V`\>: `V` extends [`__State`](#interfaces_statemd)<infer \_, infer E\> ? `E` : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:306](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L306)

___

### StateValue

Ƭ **StateValue**<`V`\>: `V` extends [`__State`](#interfaces_statemd)<infer S, infer \_\> ? `S` : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:304](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L304)

___

### \_\_KeysOfType

Ƭ **\_\_KeysOfType**<`T`, `U`, `B`\>: { [P in keyof T]: B extends true ? T[P] extends U ? U extends T[P] ? P : never : never : T[P] extends U ? P : never }[keyof `T`]

Returns an interface stripped of all keys that don't resolve to U, defaulting
to a non-strict comparison of T[key] extends U. Setting B to true performs
a strict type comparison of T[key] extends U & U extends T[key]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `U` | `U` |
| `B` | ``false`` |

#### Defined in

[index.ts:284](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L284)

## Variables

### \_\_state

• `Const` **\_\_state**: typeof [`__state`](#__state)

#### Defined in

[index.ts:298](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L298)

___

### none

• `Const` **none**: `any`

Special symbol which might be used to delete properties
from an object calling [StateMethods.set](#set) or [StateMethods.merge](#merge).

[Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)

#### Defined in

[index.ts:56](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L56)

## Functions

### DevTools

▸ **DevTools**<`S`, `E`\>(`state`): [`DevToolsExtensions`](#interfacesdevtoolsextensionsmd)

Returns access to the development tools for a given state.
Development tools are delivered as optional plugins.
You can activate development tools from `@hookstate/devtools`package,
for example. If no development tools are activated,
it returns an instance of dummy tools, which do nothing, when called.

[Learn more...](https://hookstate.js.org/docs/devtools)

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |
| `E` | - |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`State`](#state)<`S`, `E`\> | A state to relate to the extension. |

#### Returns

[`DevToolsExtensions`](#interfacesdevtoolsextensionsmd)

Interface to interact with the development tools for a given state.

#### Defined in

[index.ts:913](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L913)

___

### Downgraded

▸ **Downgraded**(): [`Plugin`](#interfacespluginmd)

A plugin which allows to opt-out from usage of Javascript proxies for
state usage tracking. It is useful for performance tuning.

[Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)

#### Returns

[`Plugin`](#interfacespluginmd)

#### Defined in

[index.ts:868](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L868)

___

### StateFragment

▸ **StateFragment**<`S`, `E`\>(`props`): `never`

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.state` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `props.extension` | () => [`Extension`](#interfacesextensionmd)<`E`\> |

#### Returns

`never`

#### Defined in

[index.ts:813](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L813)

▸ **StateFragment**<`S`, `E`\>(`props`): `React.ReactElement`

Allows to use a state without defining a functional react component.
It can be also used in class-based React components. It is also
particularly useful for creating *scoped* states.

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |
| `E` | - |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.state` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |

#### Returns

`React.ReactElement`

#### Defined in

[index.ts:829](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L829)

▸ **StateFragment**<`S`, `E`\>(`props`): `React.ReactElement`

Allows to use a state without defining a functional react component.
See more at [StateFragment](#statefragment)

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state |
| `E` | - |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.state` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `props.extension?` | () => [`Extension`](#interfacesextensionmd)<`E`\> |

#### Returns

`React.ReactElement`

#### Defined in

[index.ts:843](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L843)

___

### configure

▸ **configure**(`config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`<[`Configuration`](#interfacesconfigurationmd)\> |

#### Returns

`void`

#### Defined in

[index.ts:2091](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2091)

___

### hookstate

▸ **hookstate**<`S`, `E`\>(`initial`, `extension?`): [`State`](#state)<`S`, `E`\> & [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd)

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `extension?` | () => [`Extension`](#interfacesextensionmd)<`E`\> |

#### Returns

[`State`](#state)<`S`, `E`\> & [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd)

#### Defined in

[index.ts:465](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L465)

___

### createState

▸ **createState**<`S`\>(`initial`): [`State`](#state)<`S`, {}\> & [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd)

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

#### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of the state |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> | Initial value of the state. It can be a value OR a promise, which asynchronously resolves to a value, OR a function returning a value or a promise. |

#### Returns

[`State`](#state)<`S`, {}\> & [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd)

(#state) instance,
which can be used directly to get and set state value
outside of React components.
When you need to use the state in a functional `React` component,
pass the created state to [useState](#usestate) function and
use the returned result in the component's logic.

#### Defined in

[index.ts:459](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L459)

___

### extend

▸ **extend**<`E1`, `E2`, `E3`, `E4`, `E5`\>(`extensions`): [`Extension`](#interfacesextensionmd)<`E5` & `E4` & `E3` & `E2` & `E1`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E1` | extends `Object` = {} |
| `E2` | extends `Object` = {} |
| `E3` | extends `Object` = {} |
| `E4` | extends `Object` = {} |
| `E5` | extends `Object` = {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `extensions` | [[`Extension`](#interfacesextensionmd)<`E1`\>, Extension<E2\>?, Extension<E3\>?, Extension<E4\>?, Extension<E5\>?] |

#### Returns

[`Extension`](#interfacesextensionmd)<`E5` & `E4` & `E3` & `E2` & `E1`\>

#### Defined in

[index.ts:554](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L554)

___

### hookMemo

▸ **hookMemo**<`T`\>(`Component`, `propsAreEqual?`): `React.MemoExoticComponent`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ComponentType`<`any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Component` | `T` |
| `propsAreEqual?` | (`prevProps`: `Readonly`<`ComponentProps`<`T`\>\>, `nextProps`: `Readonly`<`ComponentProps`<`T`\>\>) => `boolean` |

#### Returns

`React.MemoExoticComponent`<`T`\>

#### Defined in

[index.ts:2209](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2209)

___

### useHookCallback

▸ **useHookCallback**<`T`\>(`callback`, `deps`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Function` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `T` |
| `deps` | `DependencyList` |

#### Returns

`T`

#### Defined in

[index.ts:2196](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2196)

___

### useHookEffect

▸ **useHookEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

#### Defined in

[index.ts:2146](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2146)

___

### useHookImperativeHandle

▸ **useHookImperativeHandle**<`T`, `R`\>(`ref`, `init`, `deps?`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |
| `R` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ref` | `undefined` \| `Ref`<`T`\> |
| `init` | () => `R` |
| `deps?` | `DependencyList` |

#### Returns

`void`

#### Defined in

[index.ts:2176](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2176)

___

### useHookInsertionEffect

▸ **useHookInsertionEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

#### Defined in

[index.ts:2166](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2166)

___

### useHookLayoutEffect

▸ **useHookLayoutEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

#### Defined in

[index.ts:2156](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2156)

___

### useHookMemo

▸ **useHookMemo**<`T`\>(`factory`, `deps`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `factory` | () => `T` |
| `deps` | `undefined` \| `DependencyList` |

#### Returns

`T`

#### Defined in

[index.ts:2186](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2186)

___

### useHookstate

▸ **useHookstate**<`S`, `E`\>(`source`, `extension?`): `never`

**`warning`** Initializing a local state to a promise without using
an initializer callback function, which returns a Promise,
is almost always a mistake. So, it is blocked.
Use `useHookstate(() => your_promise)` instead of `useHookstate(your_promise)`.

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `Promise`<`S`\> |
| `extension?` | () => [`Extension`](#interfacesextensionmd)<`E`\> |

#### Returns

`never`

#### Defined in

[index.ts:602](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L602)

▸ **useHookstate**<`S`, `E`, `E2`\>(`source`, `extension`): `never`

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |
| `E2` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `extension` | () => [`Extension`](#interfacesextensionmd)<`E2`\> |

#### Returns

`never`

#### Defined in

[index.ts:607](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L607)

▸ **useHookstate**<`S`, `E`\>(`source`): [`State`](#state)<`S`, `E`\>

Alias to [useState](#usestate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |

#### Returns

[`State`](#state)<`S`, `E`\>

#### Defined in

[index.ts:615](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L615)

▸ **useHookstate**<`S`, `E`\>(`source`, `extension?`): [`State`](#state)<`S`, `E`\>

Alias to [useState](#usestate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `extension?` | () => [`Extension`](#interfacesextensionmd)<`E`\> |

#### Returns

[`State`](#state)<`S`, `E`\>

#### Defined in

[index.ts:622](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L622)

___

### useState

▸ **useState**<`S`\>(`source`): `never`

**`warning`** Initializing a local state to a promise without using
an initializer callback function, which returns a Promise,
is almost always a mistake. So, it is blocked.
Use `useState(() => your_promise)` instead of `useState(your_promise)`.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `Promise`<`S`\> |

#### Returns

`never`

#### Defined in

[index.ts:484](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L484)

▸ **useState**<`S`\>(`source`): [`State`](#state)<`S`, {}\>

Enables a functional React component to use a state,
either created by [createState](#createstate) (*global* state) or
derived from another call to [useState](#usestate) (*scoped* state).

The `useState` forces a component to rerender every time, when:
- a segment/part of the state data is updated *AND only if*
- this segment was **used** by the component during or after the latest rendering.

For example, if the state value is `{ a: 1, b: 2 }` and
a component uses only `a` property of the state, it will rerender
only when the whole state object is updated or when `a` property is updated.
Setting the state value/property to the same value is also considered as an update.

A component can use one or many states,
i.e. you may call `useState` multiple times for multiple states.

The same state can be used by multiple different components.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`State`](#state)<`S`, {}\> | a reference to the state to hook into  The `useState` is a hook and should follow React's rules of hooks. |

#### Returns

[`State`](#state)<`S`, {}\>

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

#### Defined in

[index.ts:514](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L514)

▸ **useState**<`S`\>(`source`): [`State`](#state)<`S`, {}\>

This function enables a functional React component to use a state,
created per component by [useState](#usestate) (*local* state).
In this case `useState` behaves similarly to `React.useState`,
but the returned instance of [State](#state)
has got more features.

When a state is used by only one component, and maybe it's children,
it is recommended to use *local* state instead of *global*,
which is created by [hookstate](#hookstate).

*Local* (per component) state is created when a component is mounted
and automatically destroyed when a component is unmounted.

The same as with the usage of a *global* state,
`useState` forces a component to rerender when:
- a segment/part of the state data is updated *AND only if*
- this segment was **used** by the component during or after the latest rendering.

You can use as many local states within the same component as you need.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> | An initial value state. |

#### Returns

[`State`](#state)<`S`, {}\>

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

#### Defined in

[index.ts:544](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L544)

# Interfaces


<a name="interfacesconfigurationmd"/>

## Interface: Configuration

### Table of contents

#### Properties

- [interceptDependencyListsMode](#interceptdependencylistsmode)
- [isDevelopmentMode](#isdevelopmentmode)

#### Methods

- [promiseDetector](#promisedetector)

### Properties

#### interceptDependencyListsMode

• **interceptDependencyListsMode**: ``"always"`` \| ``"development"`` \| ``"never"``

##### Defined in

[index.ts:2077](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2077)

___

#### isDevelopmentMode

• **isDevelopmentMode**: `boolean`

##### Defined in

[index.ts:2078](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2078)

### Methods

#### promiseDetector

▸ **promiseDetector**(`p`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `any` |

##### Returns

`boolean`

##### Defined in

[index.ts:2079](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2079)


<a name="interfacesdevtoolsextensionsmd"/>

## Interface: DevToolsExtensions

Return type of [DevTools](#devtools).

### Table of contents

#### Methods

- [label](#label)
- [log](#log)

### Methods

#### label

▸ **label**(`name`): `void`

Assigns custom label to identify the state in the development tools

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | label for development tools |

##### Returns

`void`

##### Defined in

[index.ts:891](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L891)

___

#### log

▸ **log**(`str`, `data?`): `void`

Logs to the development tools

##### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |
| `data?` | `any` |

##### Returns

`void`

##### Defined in

[index.ts:895](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L895)


<a name="interfacesextensionmd"/>

## Interface: Extension<E\>

### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `Object` |

### Table of contents

#### Methods

- [onDestroy](#ondestroy)
- [onInit](#oninit)
- [onSet](#onset)

### Methods

#### onDestroy

▸ `Optional` `Readonly` **onDestroy**(`state`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, {}\> |

##### Returns

`void`

##### Defined in

[index.ts:424](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L424)

___

#### onInit

▸ `Readonly` **onInit**(`state`): { readonly [K in string \| number \| symbol]: Function }

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | () => [`State`](#state)<`any`, {}\> |

##### Returns

{ readonly [K in string \| number \| symbol]: Function }

##### Defined in

[index.ts:420](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L420)

___

#### onSet

▸ `Optional` `Readonly` **onSet**(`state`, `descriptor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, {}\> |
| `descriptor` | [`SetActionDescriptor`](#interfacessetactiondescriptormd) |

##### Returns

`void`

##### Defined in

[index.ts:423](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L423)


<a name="interfacespluginmd"/>

## Interface: Plugin

For plugin developers only.
Hookstate plugin specification and factory method.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Table of contents

#### Properties

- [id](#id)

#### Methods

- [init](#init)

### Properties

#### id

• `Readonly` **id**: `symbol`

Unique identifier of a plugin.

##### Defined in

[index.ts:411](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L411)

### Methods

#### init

▸ `Optional` `Readonly` **init**(`state`): [`PluginCallbacks`](#interfacesplugincallbacksmd)

Initializer for a plugin when it is attached for the first time.

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, {}\> |

##### Returns

[`PluginCallbacks`](#interfacesplugincallbacksmd)

##### Defined in

[index.ts:415](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L415)


<a name="interfacesplugincallbacksmd"/>

## Interface: PluginCallbacks

For plugin developers only.
Set of callbacks, a plugin may subscribe to.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Table of contents

#### Methods

- [onDestroy](#ondestroy)
- [onSet](#onset)

### Methods

#### onDestroy

▸ `Optional` `Readonly` **onDestroy**(`arg`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`PluginCallbacksOnDestroyArgument`](#interfacesplugincallbacksondestroyargumentmd) |

##### Returns

`void`

##### Defined in

[index.ts:398](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L398)

___

#### onSet

▸ `Optional` `Readonly` **onSet**(`arg`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`PluginCallbacksOnSetArgument`](#interfacesplugincallbacksonsetargumentmd) |

##### Returns

`void`

##### Defined in

[index.ts:397](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L397)


<a name="interfacesplugincallbacksondestroyargumentmd"/>

## Interface: PluginCallbacksOnDestroyArgument

For plugin developers only.
PluginCallbacks.onDestroy argument type.

### Table of contents

#### Properties

- [state](#state)

### Properties

#### state

• `Optional` `Readonly` **state**: `any`

##### Defined in

[index.ts:387](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L387)


<a name="interfacesplugincallbacksonsetargumentmd"/>

## Interface: PluginCallbacksOnSetArgument

For plugin developers only.
PluginCallbacks.onSet argument type.

### Table of contents

#### Properties

- [merged](#merged)
- [path](#path)
- [previous](#previous)
- [state](#state)
- [value](#value)

### Properties

#### merged

• `Optional` `Readonly` **merged**: `any`

##### Defined in

[index.ts:379](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L379)

___

#### path

• `Readonly` **path**: [`Path`](#path)

##### Defined in

[index.ts:355](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L355)

___

#### previous

• `Optional` `Readonly` **previous**: `any`

**A note about previous values and merging:**
State values are muteable in Hookstate for performance reasons. This causes a side effect in the merge operation.
While merging, the previous state object is mutated as the desired changes are applied. This means the value of
`previous` will reflect the merged changes as well, matching the new `state` value rather than the previous
state value. As a result, the `previous` property is unreliable when merge is used. The
[merged](#optional-readonly-merged) property can be used to detect which values were merged in but it will not
inform you whether those values are different from the previous state.

As a workaround, you can replace merge calls with the immutable-style set operation like so:

```
state.set(p => {
    let copy = p.clone(); /// here it is up to you to define how to clone the current state
    copy.field = 'new value for field';
    delete copy.fieldToDelete;
    return copy;
})
```

##### Defined in

[index.ts:377](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L377)

___

#### state

• `Optional` `Readonly` **state**: `any`

##### Defined in

[index.ts:356](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L356)

___

#### value

• `Optional` `Readonly` **value**: `any`

##### Defined in

[index.ts:378](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L378)


<a name="interfacespluginstatecontrolmd"/>

## Interface: PluginStateControl<S\>

For plugin developers only.
An instance to manipulate the state in more controlled way.

### Type parameters

| Name | Description |
| :------ | :------ |
| `S` | Type of a value of a state  [Learn more...](https://hookstate.js.org/docs/writing-plugin) |

### Table of contents

#### Methods

- [getUntracked](#getuntracked)
- [mergeUntracked](#mergeuntracked)
- [rerender](#rerender)
- [setUntracked](#setuntracked)

### Methods

#### getUntracked

▸ **getUntracked**(): `S`

Get state value, but do not leave the traces of reading it.

##### Returns

`S`

##### Defined in

[index.ts:90](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L90)

___

#### mergeUntracked

▸ **mergeUntracked**(`mergeValue`): [`Path`](#path)[]

Merge new state value, but do not trigger rerender.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mergeValue` | [`SetPartialStateAction`](#setpartialstateaction)<`S`\> | new partial value to merge with the current state value and set. |

##### Returns

[`Path`](#path)[]

##### Defined in

[index.ts:102](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L102)

___

#### rerender

▸ **rerender**(`paths`): `void`

Trigger rerender for hooked states, where values at the specified paths are used.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paths` | [`Path`](#path)[] | paths of the state variables to search for being used by components and rerender |

##### Returns

`void`

##### Defined in

[index.ts:108](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L108)

___

#### setUntracked

▸ **setUntracked**(`newValue`): [`Path`](#path)[]

Set new state value, but do not trigger rerender.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newValue` | [`SetStateAction`](#setstateaction)<`S`\> | new value to set to a state. |

##### Returns

[`Path`](#path)[]

##### Defined in

[index.ts:96](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L96)


<a name="interfacessetactiondescriptormd"/>

## Interface: SetActionDescriptor

### Table of contents

#### Properties

- [actions](#actions)
- [path](#path)

### Properties

#### actions

• `Optional` **actions**: `Record`<`string` \| `number`, ``"I"`` \| ``"U"`` \| ``"D"``\>

##### Defined in

[index.ts:997](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L997)

___

#### path

• **path**: [`Path`](#path)

##### Defined in

[index.ts:996](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L996)


<a name="interfacesstatemethodsmd"/>

## Interface: StateMethods<S, E\>

An interface to manage a state in Hookstate.

### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `S` | `S` | Type of a value of a state |
| `E` | {} | - |

### Hierarchy

- [`__State`](#interfaces_statemd)<`S`, `E`\>

  ↳ **`StateMethods`**

### Table of contents

#### Properties

- [error](#error)
- [keys](#keys)
- [ornull](#ornull)
- [path](#path)
- [promised](#promised)
- [value](#value)

#### Methods

- [[\_\_\_state]](#[___state])
- [attach](#attach)
- [get](#get)
- [merge](#merge)
- [nested](#nested)
- [set](#set)

### Properties

#### error

• `Readonly` **error**: `any`

If a state was set to a promise and the promise was rejected,
this property will return the error captured from the promise rejection

##### Defined in

[index.ts:176](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L176)

___

#### keys

• `Readonly` **keys**: [`InferredStateKeysType`](#inferredstatekeystype)<`S`\>

Return the keys of nested states.
For a given state of [State](#state) type,
`state.keys` will be structurally equal to Object.keys(state),
with two minor difference:
1. if `state.value` is an array, the returned result will be
an array of numbers, not strings like with `Object.keys`.
2. if `state.value` is not an object, the returned result will be undefined.

##### Defined in

[index.ts:142](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L142)

___

#### ornull

• **ornull**: [`InferredStateOrnullType`](#inferredstateornulltype)<`S`, `E`\>

If state value is null or undefined, returns state value.
Otherwise, it returns this state instance but
with null and undefined removed from the type parameter.

[Learn more...](https://hookstate.js.org/docs/nullable-state)

##### Defined in

[index.ts:243](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L243)

___

#### path

• `Readonly` **path**: [`Path`](#path)

'Javascript' object 'path' to an element relative to the root object
in the state. For example:

```tsx
const state = useState([{ name: 'First Task' }])
state.path IS []
state[0].path IS [0]
state.[0].name.path IS [0, 'name']
```

##### Defined in

[index.ts:131](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L131)

___

#### promised

• `Readonly` **promised**: `boolean`

True if state value is not yet available (eg. equal to a promise)

##### Defined in

[index.ts:170](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L170)

___

#### value

• `Readonly` **value**: `S`

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

##### Defined in

[index.ts:165](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L165)

### Methods

#### [\_\_\_state]

▸ **[___state]**(`s`, `e`): `never`

##### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `S` |
| `e` | `E` |

##### Returns

`never`

##### Inherited from

[__State](#interfaces_statemd).[[___state]](#[___state])

##### Defined in

[index.ts:300](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L300)

___

#### attach

▸ **attach**(`plugin`): [`State`](#state)<`S`, `E`\>

Adds plugin to the state.

[Learn more...](https://hookstate.js.org/docs/extensions-overview)

##### Parameters

| Name | Type |
| :------ | :------ |
| `plugin` | () => [`Plugin`](#interfacespluginmd) |

##### Returns

[`State`](#state)<`S`, `E`\>

##### Defined in

[index.ts:251](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L251)

▸ **attach**(`pluginId`): [[`PluginCallbacks`](#interfacesplugincallbacksmd) \| `Error`, [`PluginStateControl`](#interfacespluginstatecontrolmd)<`S`\>]

For plugin developers only.
It is a method to get the instance of the previously attached plugin.
If a plugin has not been attached to a state,
it returns an Error as the first element.
A plugin may trhow an error to indicate that plugin has not been attached.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

##### Parameters

| Name | Type |
| :------ | :------ |
| `pluginId` | `symbol` |

##### Returns

[[`PluginCallbacks`](#interfacesplugincallbacksmd) \| `Error`, [`PluginStateControl`](#interfacespluginstatecontrolmd)<`S`\>]

##### Defined in

[index.ts:263](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L263)

___

#### get

▸ **get**(`options?`): `S`

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [StateMethods.value](#readonly-value) method.

If the additional option `noproxy` is set, the method will return
the original data object without wrapping it by proxy.
All properties of the object will be marked as used and on change will trigger the rerender.

If the additional option `stealth` is set, the method will not mark
the object as used and it will not trigger the rerender if it is changed.
It might be helpful to use it during debugging, for example:
`console.log(state.get({ stealth: true }))`.
If you use it, make sure you know what you are doing.

##### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.noproxy?` | `boolean` |
| `options.stealth?` | `boolean` |

##### Returns

`S`

##### Defined in

[index.ts:194](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L194)

___

#### merge

▸ **merge**(`newValue`): `void`

Similarly to [set](#set) method updates state value.

- If current state value is an object, it does partial update for the object.
- If state value is an array and the argument is an array too,
it concatenates the current value with the value of the argument and sets it to the state.
- If state value is an array and the `merge` argument is an object,
it does partial update for the current array value.
- If current state value is a string, it concatenates the current state
value with the argument converted to string and sets the result to the state.

##### Parameters

| Name | Type |
| :------ | :------ |
| `newValue` | [`SetPartialStateAction`](#setpartialstateaction)<`S`\> |

##### Returns

`void`

##### Defined in

[index.ts:223](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L223)

___

#### nested

▸ **nested**<`K`\>(`key`): [`State`](#state)<`S`[`K`], `E`\>

Returns nested state by key.
`state.nested('myprop')` returns the same as `state.myprop` or `state['myprop']`,
but also works for properties, which names collide with names of state methods.

[Learn more about nested states...](https://hookstate.js.org/docs/nested-state)

##### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `number` \| `symbol` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `K` | child property name or index |

##### Returns

[`State`](#state)<`S`[`K`], `E`\>

##### Defined in

[index.ts:234](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L234)

___

#### set

▸ **set**(`newValue`): `void`

Sets new value for a state.
If `this.path === []`,
it is similar to the `setState` variable returned by `React.useState` hook.
If `this.path !== []`, it sets only the segment of the state value, pointed out by the path.
Unlike [merge](#merge) method, this method will not accept partial updates.
Partial updates can be also done by walking the nested states and setting those.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newValue` | [`SetStateAction`](#setstateaction)<`S`\> | new value to set to a state. It can be a value, a promise resolving to a value (only if [this.path](#readonly-path) is `[]`), or a function returning one of these. The function receives the current state value as an argument. |

##### Returns

`void`

##### Defined in

[index.ts:210](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L210)


<a name="interfacesstatemethodsdestroymd"/>

## Interface: StateMethodsDestroy

Mixin for the [StateMethods](#interfacesstatemethodsmd) for a [State](#state),
which can be destroyed by a client.

### Table of contents

#### Methods

- [destroy](#destroy)

### Methods

#### destroy

▸ **destroy**(): `void`

Destroys an instance of a state, so
it can clear the allocated native resources (if any)
and can not be used anymore after it has been destroyed.

##### Returns

`void`

##### Defined in

[index.ts:276](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L276)


<a name="interfaces_statemd"/>

## Interface: \_\_State<S, E\>

### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

### Hierarchy

- **`__State`**

  ↳ [`StateMethods`](#interfacesstatemethodsmd)

### Table of contents

#### Methods

- [[\_\_\_state]](#[___state])

### Methods

#### [\_\_\_state]

▸ **[___state]**(`s`, `e`): `never`

##### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `S` |
| `e` | `E` |

##### Returns

`never`

##### Defined in

[index.ts:300](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L300)
