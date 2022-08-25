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

### Type Aliases

- [DeepReturnType](#deepreturntype)
- [ExtensionFactory](#extensionfactory)
- [InferStateExtensionType](#inferstateextensiontype)
- [InferStateKeysType](#inferstatekeystype)
- [InferStateOrnullType](#inferstateornulltype)
- [InferStateValueType](#inferstatevaluetype)
- [InferredStateKeysType](#inferredstatekeystype)
- [InferredStateOrnullType](#inferredstateornulltype)
- [Path](#path)
- [SetInitialStateAction](#setinitialstateaction)
- [SetPartialStateAction](#setpartialstateaction)
- [SetStateAction](#setstateaction)
- [State](#state)
- [StateExtensionUnknown](#stateextensionunknown)
- [\_\_KeysOfType](#__keysoftype)

### Variables

- [\_\_state](#__state)
- [none](#none)

### Functions

- [DevTools](#devtools)
- [Downgraded](#downgraded)
- [StateFragment](#statefragment)
- [configure](#configure)
- [createHookstate](#createhookstate)
- [createState](#createstate)
- [extend](#extend)
- [hookstate](#hookstate)
- [hookstateMemo](#hookstatememo)
- [suspend](#suspend)
- [useHookstate](#usehookstate)
- [useHookstateCallback](#usehookstatecallback)
- [useHookstateEffect](#usehookstateeffect)
- [useHookstateImperativeHandle](#usehookstateimperativehandle)
- [useHookstateInsertionEffect](#usehookstateinsertioneffect)
- [useHookstateLayoutEffect](#usehookstatelayouteffect)
- [useHookstateMemo](#usehookstatememo)
- [useMemoIntercept](#usememointercept)
- [useState](#usestate)

## Type Aliases

### DeepReturnType

Ƭ **DeepReturnType**<`V`\>: `V` extends (...`args`: `any`) => infer R ? [`DeepReturnType`](#deepreturntype)<`R`\> : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:320](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L320)

___

### ExtensionFactory

Ƭ **ExtensionFactory**<`S`, `I`, `E`\>: (`typemarker?`: [`__State`](#interfaces_statemd)<`S`, `I`\>) => [`Extension`](#interfacesextensionmd)<`S`, `I`, `E`\>

#### Type parameters

| Name |
| :------ |
| `S` |
| `I` |
| `E` |

#### Type declaration

▸ (`typemarker?`): [`Extension`](#interfacesextensionmd)<`S`, `I`, `E`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `typemarker?` | [`__State`](#interfaces_statemd)<`S`, `I`\> |

##### Returns

[`Extension`](#interfacesextensionmd)<`S`, `I`, `E`\>

#### Defined in

[index.ts:454](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L454)

___

### InferStateExtensionType

Ƭ **InferStateExtensionType**<`V`\>: [`DeepReturnType`](#deepreturntype)<`V`\> extends [`__State`](#interfaces_statemd)<infer \_, infer E\> ? `E` : [`DeepReturnType`](#deepreturntype)<`V`\> extends [`Extension`](#interfacesextensionmd)<infer \_, infer \_, infer E\> ? `E` : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:316](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L316)

___

### InferStateKeysType

Ƭ **InferStateKeysType**<`S`\>: `S` extends `ReadonlyArray`<infer \_\> ? `ReadonlyArray`<`number`\> : `S` extends ``null`` ? `undefined` : `S` extends `object` ? `ReadonlyArray`<`string`\> : `undefined`

Return type of [StateMethods.keys](#readonly-keys).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |

#### Defined in

[index.ts:63](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L63)

___

### InferStateOrnullType

Ƭ **InferStateOrnullType**<`S`, `E`\>: `S` extends `undefined` ? `undefined` : `S` extends ``null`` ? ``null`` : [`State`](#state)<`S`, `E`\>

Return type of [StateMethods.map()](#map).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Defined in

[index.ts:76](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L76)

___

### InferStateValueType

Ƭ **InferStateValueType**<`V`\>: [`DeepReturnType`](#deepreturntype)<`V`\> extends [`__State`](#interfaces_statemd)<infer S, infer \_\> ? `S` : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:314](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L314)

___

### InferredStateKeysType

Ƭ **InferredStateKeysType**<`S`\>: [`InferStateKeysType`](#inferstatekeystype)<`S`\>

#### Type parameters

| Name |
| :------ |
| `S` |

#### Defined in

[index.ts:70](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L70)

___

### InferredStateOrnullType

Ƭ **InferredStateOrnullType**<`S`, `E`\>: [`InferStateOrnullType`](#inferstateornulltype)<`S`, `E`\>

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Defined in

[index.ts:81](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L81)

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

Type of an argument of [hookstate](#hookstate) and [useHookstate](#useHookstate).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |

#### Defined in

[index.ts:48](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L48)

___

### SetPartialStateAction

Ƭ **SetPartialStateAction**<`S`\>: `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<`U`\> \| `Record`<`number`, `U`\> \| (`prevValue`: `S`) => `ReadonlyArray`<`U`\> \| `Record`<`number`, `U`\> : `S` extends `object` \| `string` ? `Partial`<`S`\> \| (`prevValue`: `S`) => `Partial`<`S`\> : `React.SetStateAction`<`S`\>

Type of an argument of [StateMethods.merge](#merge).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |

#### Defined in

[index.ts:37](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L37)

___

### SetStateAction

Ƭ **SetStateAction**<`S`\>: `S` \| `Promise`<`S`\> \| (`prevState`: `S`) => `S` \| `Promise`<`S`\>

Type of an argument of [StateMethods.set](#set).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |

#### Defined in

[index.ts:30](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L30)

___

### State

Ƭ **State**<`S`, `E`\>: [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> & `E` & `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<[`State`](#state)<`U`, `E`\>\> : `S` extends `object` ? `Omit`<{ readonly [K in keyof Required<S\>]: State<S[K], E\> }, keyof [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> \| keyof [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd) \| [`__KeysOfType`](#__keysoftype)<`S`, `Function`\> \| keyof `E`\> : {}

Type of a result of [hookstate](#hookstate) and [useHookstate](#useHookstate) functions

**`Typeparam`**

S Type of a value of a state

[Learn more about global states...](https://hookstate.js.org/docs/global-state)
[Learn more about local states...](https://hookstate.js.org/docs/local-state)
[Learn more about nested states...](https://hookstate.js.org/docs/nested-state)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Defined in

[index.ts:331](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L331)

___

### StateExtensionUnknown

Ƭ **StateExtensionUnknown**: `any`

#### Defined in

[index.ts:366](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L366)

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

[index.ts:294](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L294)

## Variables

### \_\_state

• `Const` **\_\_state**: typeof [`__state`](#__state)

#### Defined in

[index.ts:308](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L308)

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

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`State`](#state)<`S`, `E`\> | A state to relate to the extension. |

#### Returns

[`DevToolsExtensions`](#interfacesdevtoolsextensionsmd)

Interface to interact with the development tools for a given state.

___

### Downgraded

▸ **Downgraded**(): [`Plugin`](#interfacespluginmd)

A plugin which allows to opt-out from usage of JavaScript proxies for
state usage tracking. It is useful for performance tuning.

[Learn more...](https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin)

#### Returns

[`Plugin`](#interfacespluginmd)

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
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `props.extension` | [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `any`\> |
| `props.state` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `props.suspend?` | `boolean` |

#### Returns

`never`

▸ **StateFragment**<`S`, `E`\>(`props`): `React.ReactElement`

Allows to use a state without defining a functional react component.
It can be also used in class-based React components. It is also
particularly useful for creating *scoped* states.

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `props.state` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `props.suspend?` | `boolean` |

#### Returns

`React.ReactElement`

▸ **StateFragment**<`S`, `E`\>(`props`): `React.ReactElement`

Allows to use a state without defining a functional react component.
See more at [StateFragment](#statefragment)

[Learn more...](https://hookstate.js.org/docs/using-without-statehook)

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.children` | (`state`: [`State`](#state)<`S`, `E`\>) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `props.extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> |
| `props.state` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `props.suspend?` | `boolean` |

#### Returns

`React.ReactElement`

___

### configure

▸ **configure**(`config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`<[`Configuration`](#interfacesconfigurationmd)\> |

#### Returns

`void`

___

### createHookstate

▸ **createHookstate**<`S`\>(`initial`): [`State`](#state)<`S`, {}\>

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |

#### Returns

[`State`](#state)<`S`, {}\>

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

**`Typeparam`**

S Type of a value of the state

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> | Initial value of the state.  It can be a value OR a promise,  which asynchronously resolves to a value,  OR a function returning a value or a promise. |

#### Returns

[`State`](#state)<`S`, {}\> & [`StateMethodsDestroy`](#interfacesstatemethodsdestroymd)

[State](#state) instance,
which can be used directly to get and set state value
outside of React components.
When you need to use the state in a functional `React` component,
pass the created state to [useHookstate](#useHookstate) function and
use the returned result in the component's logic.

___

### extend

▸ **extend**<`S`, `E`, `E1`, `E2`, `E3`, `E4`, `E5`\>(`e1?`, `e2?`, `e3?`, `e4?`, `e5?`): [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `E5` & `E4` & `E3` & `E2` & `E1`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | `E` |
| `E1` | extends `Object` = {} |
| `E2` | extends `Object` = {} |
| `E3` | extends `Object` = {} |
| `E4` | extends `Object` = {} |
| `E5` | extends `Object` = {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `e1?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `E1`\> |
| `e2?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E1` & `E`, `E2`\> |
| `e3?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E2` & `E1` & `E`, `E3`\> |
| `e4?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E3` & `E2` & `E1` & `E`, `E4`\> |
| `e5?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E4` & `E3` & `E2` & `E1` & `E`, `E5`\> |

#### Returns

[`ExtensionFactory`](#extensionfactory)<`S`, `E`, `E5` & `E4` & `E3` & `E2` & `E1`\>

___

### hookstate

▸ **hookstate**<`S`, `E`\>(`source`, `extension?`): `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `any`\> |

#### Returns

`never`

▸ **hookstate**<`S`, `E`\>(`initial`, `extension?`): [`State`](#state)<`S`, `E`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> |

#### Returns

[`State`](#state)<`S`, `E`\>

___

### hookstateMemo

▸ **hookstateMemo**<`T`\>(`Component`, `propsAreEqual?`): `React.MemoExoticComponent`<`T`\>

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

___

### suspend

▸ **suspend**<`S`, `E`\>(`state`): `undefined` \| `FunctionComponentElement`<`any`\>

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, `E`\> |

#### Returns

`undefined` \| `FunctionComponentElement`<`any`\>

___

### useHookstate

▸ **useHookstate**<`S`, `E`\>(`source`, `extension?`): `never`

**`Warning`**

Initializing a local state to a promise without using 
an initializer callback function, which returns a Promise,
is almost always a mistake. So, it is blocked.
Use `useHookstate(() => your_promise)` instead of `useHookstate(your_promise)`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `Promise`<`S`\> |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> |

#### Returns

`never`

▸ **useHookstate**<`S`, `E`\>(`source`, `extension`): `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `extension` | [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `any`\> |

#### Returns

`never`

▸ **useHookstate**<`S`, `E`\>(`source`): [`State`](#state)<`S`, `E`\>

Alias to [useHookstate](#useHookstate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |

#### Returns

[`State`](#state)<`S`, `E`\>

▸ **useHookstate**<`S`, `E`\>(`source`, `extension?`): [`State`](#state)<`S`, `E`\>

Alias to [useHookstate](#useHookstate) which provides a workaround
for [React 20613 bug](https://github.com/facebook/react/issues/20613)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> |

#### Returns

[`State`](#state)<`S`, `E`\>

___

### useHookstateCallback

▸ **useHookstateCallback**<`T`\>(`callback`, `deps`): `T`

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

___

### useHookstateEffect

▸ **useHookstateEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

___

### useHookstateImperativeHandle

▸ **useHookstateImperativeHandle**<`T`, `R`\>(`ref`, `init`, `deps?`): `void`

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

___

### useHookstateInsertionEffect

▸ **useHookstateInsertionEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

___

### useHookstateLayoutEffect

▸ **useHookstateLayoutEffect**(`effect`, `deps?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `effect` | `EffectCallback` |
| `deps?` | `DependencyList` |

#### Returns

`void`

___

### useHookstateMemo

▸ **useHookstateMemo**<`T`\>(`factory`, `deps`): `T`

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

___

### useMemoIntercept

▸ **useMemoIntercept**<`T`\>(`factory`, `deps`): `T`

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

___

### useState

▸ **useState**<`S`\>(`source`): `never`

**`Warning`**

Initializing a local state to a promise without using 
an initializer callback function, which returns a Promise,
is almost always a mistake. So, it is blocked.
Use `useHookstate(() => your_promise)` instead of `useHookstate(your_promise)`.

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

▸ **useState**<`S`\>(`source`): [`State`](#state)<`S`, {}\>

Enables a functional React component to use a state,
either created by [hookstate](#hookstate) (*global* state) or
derived from another call to [useHookstate](#useHookstate) (*scoped* state).

The `useHookstate` forces a component to rerender every time, when:
- a segment/part of the state data is updated *AND only if*
- this segment was **used** by the component during or after the latest rendering.

For example, if the state value is `{ a: 1, b: 2 }` and
a component uses only `a` property of the state, it will rerender
only when the whole state object is updated or when `a` property is updated.
Setting the state value/property to the same value is also considered as an update.

A component can use one or many states,
i.e. you may call `useHookstate` multiple times for multiple states.

The same state can be used by multiple different components.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`State`](#state)<`S`, {}\> | a reference to the state to hook into    The `useHookstate` is a hook and should follow React's rules of hooks. |

#### Returns

[`State`](#state)<`S`, {}\>

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

▸ **useState**<`S`\>(`source`): [`State`](#state)<`S`, {}\>

This function enables a functional React component to use a state,
created per component by [useHookstate](#useHookstate) (*local* state).
In this case `useHookstate` behaves similarly to `React.useState`,
but the returned instance of [State](#state)
has got more features.

When a state is used by only one component, and maybe it's children,
it is recommended to use *local* state instead of *global*,
which is created by [hookstate](#hookstate).

*Local* (per component) state is created when a component is mounted
and automatically destroyed when a component is unmounted.

The same as with the usage of a *global* state,
`useHookstate` forces a component to rerender when:
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

# Interfaces


<a name="interfacesconfigurationmd"/>

## Interface: Configuration

### Table of contents

#### Properties

- [interceptDependencyListsMode](#interceptdependencylistsmode)
- [isDevelopmentMode](#isdevelopmentmode)
- [promiseDetector](#promisedetector)

### Properties

#### interceptDependencyListsMode

• **interceptDependencyListsMode**: ``"always"`` \| ``"development"`` \| ``"never"``

##### Defined in

[index.ts:2247](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2247)

___

#### isDevelopmentMode

• **isDevelopmentMode**: `boolean`

##### Defined in

[index.ts:2248](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2248)

___

#### promiseDetector

• **promiseDetector**: (`p`: `any`) => `boolean`

##### Type declaration

▸ (`p`): `boolean`

###### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `any` |

###### Returns

`boolean`

##### Defined in

[index.ts:2249](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L2249)


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


<a name="interfacesextensionmd"/>

## Interface: Extension<S, I, E\>

### Type parameters

| Name |
| :------ |
| `S` |
| `I` |
| `E` |

### Table of contents

#### Properties

- [onCreate](#oncreate)
- [onDestroy](#ondestroy)
- [onInit](#oninit)
- [onPremerge](#onpremerge)
- [onPreset](#onpreset)
- [onSet](#onset)

### Properties

#### onCreate

• `Optional` `Readonly` **onCreate**: (`state`: [`State`](#state)<`S`, {}\>, `extensionsCallbacks`: `Record`<`string`, (`i`: [`State`](#state)<`any`, `E` & `I`\>) => `any`\>) => { readonly [K in string \| number \| symbol]: Function }

##### Type declaration

▸ (`state`, `extensionsCallbacks`): { readonly [K in string \| number \| symbol]: Function }

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, {}\> |
| `extensionsCallbacks` | `Record`<`string`, (`i`: [`State`](#state)<`any`, `E` & `I`\>) => `any`\> |

###### Returns

{ readonly [K in string \| number \| symbol]: Function }

##### Defined in

[index.ts:438](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L438)

___

#### onDestroy

• `Optional` `Readonly` **onDestroy**: (`state`: [`State`](#state)<`S`, `E` & `I`\>) => `void`

##### Type declaration

▸ (`state`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, `E` & `I`\> |

###### Returns

`void`

##### Defined in

[index.ts:451](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L451)

___

#### onInit

• `Optional` `Readonly` **onInit**: (`state`: [`State`](#state)<`S`, `E` & `I`\>, `extensionsCallbacks`: `Record`<`string`, (`i`: [`State`](#state)<`any`, `E` & `I`\>) => `any`\>) => `void`

##### Type declaration

▸ (`state`, `extensionsCallbacks`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, `E` & `I`\> |
| `extensionsCallbacks` | `Record`<`string`, (`i`: [`State`](#state)<`any`, `E` & `I`\>) => `any`\> |

###### Returns

`void`

##### Defined in

[index.ts:444](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L444)

___

#### onPremerge

• `Optional` `Readonly` **onPremerge**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `value`: `any`) => `void`

##### Type declaration

▸ (`state`, `value`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `value` | `any` |

###### Returns

`void`

##### Defined in

[index.ts:449](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L449)

___

#### onPreset

• `Optional` `Readonly` **onPreset**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `value`: `any`) => `void`

##### Type declaration

▸ (`state`, `value`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `value` | `any` |

###### Returns

`void`

##### Defined in

[index.ts:448](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L448)

___

#### onSet

• `Optional` `Readonly` **onSet**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `descriptor`: [`SetActionDescriptor`](#interfacessetactiondescriptormd)) => `void`

##### Type declaration

▸ (`state`, `descriptor`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `descriptor` | [`SetActionDescriptor`](#interfacessetactiondescriptormd) |

###### Returns

`void`

##### Defined in

[index.ts:450](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L450)


<a name="interfacespluginmd"/>

## Interface: Plugin

For plugin developers only.
Hookstate plugin specification and factory method.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Table of contents

#### Properties

- [id](#id)
- [init](#init)

### Properties

#### id

• `Readonly` **id**: `symbol`

Unique identifier of a plugin.

##### Defined in

[index.ts:429](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L429)

___

#### init

• `Optional` `Readonly` **init**: (`state`: [`State`](#state)<`any`, {}\>) => [`PluginCallbacks`](#interfacesplugincallbacksmd)

##### Type declaration

▸ (`state`): [`PluginCallbacks`](#interfacesplugincallbacksmd)

Initializer for a plugin when it is attached for the first time.

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, {}\> |

###### Returns

[`PluginCallbacks`](#interfacesplugincallbacksmd)

##### Defined in

[index.ts:433](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L433)


<a name="interfacesplugincallbacksmd"/>

## Interface: PluginCallbacks

For plugin developers only.
Set of callbacks, a plugin may subscribe to.

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Table of contents

#### Properties

- [onDestroy](#ondestroy)
- [onSet](#onset)

### Properties

#### onDestroy

• `Optional` `Readonly` **onDestroy**: (`arg`: [`PluginCallbacksOnDestroyArgument`](#interfacesplugincallbacksondestroyargumentmd)) => `void`

##### Type declaration

▸ (`arg`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`PluginCallbacksOnDestroyArgument`](#interfacesplugincallbacksondestroyargumentmd) |

###### Returns

`void`

##### Defined in

[index.ts:416](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L416)

___

#### onSet

• `Optional` `Readonly` **onSet**: (`arg`: [`PluginCallbacksOnSetArgument`](#interfacesplugincallbacksonsetargumentmd)) => `void`

##### Type declaration

▸ (`arg`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`PluginCallbacksOnSetArgument`](#interfacesplugincallbacksonsetargumentmd) |

###### Returns

`void`

##### Defined in

[index.ts:415](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L415)


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

[index.ts:405](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L405)


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

[index.ts:397](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L397)

___

#### path

• `Readonly` **path**: [`Path`](#path)

##### Defined in

[index.ts:373](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L373)

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

[index.ts:395](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L395)

___

#### state

• `Optional` `Readonly` **state**: `any`

##### Defined in

[index.ts:374](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L374)

___

#### value

• `Optional` `Readonly` **value**: `any`

##### Defined in

[index.ts:396](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L396)


<a name="interfacespluginstatecontrolmd"/>

## Interface: PluginStateControl<S\>

For plugin developers only.
An instance to manipulate the state in more controlled way.

**`Typeparam`**

S Type of a value of a state

[Learn more...](https://hookstate.js.org/docs/writing-plugin)

### Type parameters

| Name |
| :------ |
| `S` |

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

[index.ts:1103](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L1103)

___

#### path

• **path**: [`Path`](#path)

##### Defined in

[index.ts:1102](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L1102)


<a name="interfacesstatemethodsmd"/>

## Interface: StateMethods<S, E\>

An interface to manage a state in Hookstate.

**`Typeparam`**

S Type of a value of a state

### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | {} |

### Hierarchy

- [`__State`](#interfaces_statemd)<`S`, `E`\>

  ↳ **`StateMethods`**

### Table of contents

#### Properties

- [[\_\_\_state]](#[___state])
- [error](#error)
- [keys](#keys)
- [ornull](#ornull)
- [path](#path)
- [promise](#promise)
- [promised](#promised)
- [value](#value)

#### Methods

- [attach](#attach)
- [get](#get)
- [merge](#merge)
- [nested](#nested)
- [set](#set)

### Properties

#### [\_\_\_state]

• **[\_\_\_state]**: (`s`: `S`, `e`: `E`) => `never`

##### Type declaration

▸ (`s`, `e`): `never`

###### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `S` |
| `e` | `E` |

###### Returns

`never`

##### Inherited from

[__State](#interfaces_statemd).[[___state]](#[___state])

##### Defined in

[index.ts:310](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L310)

___

#### error

• `Readonly` **error**: `any`

If a state was set to a promise and the promise was rejected,
this property will return the error captured from the promise rejection

##### Defined in

[index.ts:185](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L185)

___

#### keys

• `Readonly` **keys**: [`InferStateKeysType`](#inferstatekeystype)<`S`\>

Return the keys of nested states.
For a given state of [State](#state) type,
`state.keys` will be structurally equal to Object.keys(state),
with two minor difference:
1. if `state.value` is an array, the returned result will be
an array of numbers, not strings like with `Object.keys`.
2. if `state.value` is not an object, the returned result will be undefined.

##### Defined in

[index.ts:147](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L147)

___

#### ornull

• **ornull**: [`InferStateOrnullType`](#inferstateornulltype)<`S`, `E`\>

If state value is null or undefined, returns state value.
Otherwise, it returns this state instance but
with null and undefined removed from the type parameter.

[Learn more...](https://hookstate.js.org/docs/nullable-state)

##### Defined in

[index.ts:252](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L252)

___

#### path

• `Readonly` **path**: [`Path`](#path)

'Javascript' object 'path' to an element relative to the root object
in the state. For example:

```tsx
const state = useHookstate([{ name: 'First Task' }])
state.path IS []
state[0].path IS [0]
state.[0].name.path IS [0, 'name']
```

##### Defined in

[index.ts:136](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L136)

___

#### promise

• `Readonly` **promise**: `undefined` \| `Promise`<[`State`](#state)<`S`, `E`\>\>

##### Defined in

[index.ts:179](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L179)

___

#### promised

• `Readonly` **promised**: `boolean`

True if state value is not yet available (eg. equal to a promise)

##### Defined in

[index.ts:176](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L176)

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
const state = useHookstate<number | undefined>(0)
const myvalue: number = state.value
     ? state.value + 1
     : 0; // <-- compiles
const myvalue: number = state.get()
     ? state.get() + 1
     : 0; // <-- does not compile
```

##### Defined in

[index.ts:170](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L170)

### Methods

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
| `newValue` | [`SetStateAction`](#setstateaction)<`S`\> | new value to set to a state.  It can be a value, a promise resolving to a value  (only if [this.path](#readonly-path) is `[]`),  or a function returning one of these.  The function receives the current state value as an argument. |

##### Returns

`void`


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

#### Properties

- [[\_\_\_state]](#[___state])

### Properties

#### [\_\_\_state]

• **[\_\_\_state]**: (`s`: `S`, `e`: `E`) => `never`

##### Type declaration

▸ (`s`, `e`): `never`

###### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `S` |
| `e` | `E` |

###### Returns

`never`

##### Defined in

[index.ts:310](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L310)
