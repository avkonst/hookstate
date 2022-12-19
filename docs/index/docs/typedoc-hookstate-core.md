---
id: typedoc-hookstate-core
title: API @hookstate/core
---



## Table of contents

### Interfaces

- [Configuration](#interfacesconfigurationmd)
- [Extension](#interfacesextensionmd)
- [StateMethods](#interfacesstatemethodsmd)
- [\_\_State](#interfaces_statemd)

### Type Aliases

- [DeepReturnType](#deepreturntype)
- [ExtensionFactory](#extensionfactory)
- [Immutable](#immutable)
- [ImmutableArray](#immutablearray)
- [ImmutableMap](#immutablemap)
- [ImmutableObject](#immutableobject)
- [ImmutablePrimitive](#immutableprimitive)
- [ImmutableSet](#immutableset)
- [InferStateExtensionType](#inferstateextensiontype)
- [InferStateKeysType](#inferstatekeystype)
- [InferStateOrnullType](#inferstateornulltype)
- [InferStateValueType](#inferstatevaluetype)
- [Path](#path)
- [SetInitialStateAction](#setinitialstateaction)
- [SetPartialStateAction](#setpartialstateaction)
- [SetStateAction](#setstateaction)
- [State](#state)
- [\_\_KeysOfType](#__keysoftype)

### Variables

- [\_\_state](#__state)
- [none](#none)

### Functions

- [StateFragment](#statefragment)
- [configure](#configure)
- [destroyHookstate](#destroyhookstate)
- [extend](#extend)
- [hookstate](#hookstate)
- [hookstateMemo](#hookstatememo)
- [isHookstate](#ishookstate)
- [isHookstateValue](#ishookstatevalue)
- [suspend](#suspend)
- [useHookstate](#usehookstate)
- [useHookstateCallback](#usehookstatecallback)
- [useHookstateEffect](#usehookstateeffect)
- [useHookstateImperativeHandle](#usehookstateimperativehandle)
- [useHookstateInsertionEffect](#usehookstateinsertioneffect)
- [useHookstateLayoutEffect](#usehookstatelayouteffect)
- [useHookstateMemo](#usehookstatememo)
- [useMemoIntercept](#usememointercept)

## Type Aliases

### DeepReturnType

Ƭ **DeepReturnType**<`V`\>: `V` extends (...`args`: `any`) => infer R ? [`DeepReturnType`](#deepreturntype)<`R`\> : `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:266](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L266)

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

[index.ts:359](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L359)

___

### Immutable

Ƭ **Immutable**<`T`\>: `T` extends [`ImmutablePrimitive`](#immutableprimitive) ? `T` : `T` extends infer U[] ? [`ImmutableArray`](#immutablearray)<`U`\> : `T` extends `Map`<infer K, infer V\> ? [`ImmutableMap`](#immutablemap)<`K`, `V`\> : `T` extends `Set`<infer M\> ? [`ImmutableSet`](#immutableset)<`M`\> : [`ImmutableObject`](#immutableobject)<`T`\>

Makes a value deep readonly

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:81](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L81)

___

### ImmutableArray

Ƭ **ImmutableArray**<`T`\>: `ReadonlyArray`<[`Immutable`](#immutable)<`T`\>\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:87](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L87)

___

### ImmutableMap

Ƭ **ImmutableMap**<`K`, `V`\>: `ReadonlyMap`<[`Immutable`](#immutable)<`K`\>, [`Immutable`](#immutable)<`V`\>\>

#### Type parameters

| Name |
| :------ |
| `K` |
| `V` |

#### Defined in

[index.ts:88](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L88)

___

### ImmutableObject

Ƭ **ImmutableObject**<`T`\>: { readonly [K in keyof T]: Immutable<T[K]\> }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:90](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L90)

___

### ImmutablePrimitive

Ƭ **ImmutablePrimitive**: `undefined` \| ``null`` \| `boolean` \| `string` \| `number` \| `Function`

#### Defined in

[index.ts:86](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L86)

___

### ImmutableSet

Ƭ **ImmutableSet**<`T`\>: `ReadonlySet`<[`Immutable`](#immutable)<`T`\>\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:89](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L89)

___

### InferStateExtensionType

Ƭ **InferStateExtensionType**<`V`\>: [`DeepReturnType`](#deepreturntype)<`V`\> extends [`__State`](#interfaces_statemd)<infer \_, infer E\> ? `E` : [`DeepReturnType`](#deepreturntype)<`V`\> extends [`Extension`](#interfacesextensionmd)<infer \_, infer \_, infer E\> ? `E` : `V`

A routine which allows to extract extension methods / properties type of a state.
Useful for extension developers.

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:262](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L262)

___

### InferStateKeysType

Ƭ **InferStateKeysType**<`S`\>: `S` extends `ReadonlyArray`<infer \_\> ? `ReadonlyArray`<`number`\> : `S` extends ``null`` ? `undefined` : `S` extends `object` ? `ReadonlyArray`<`string`\> : `undefined`

Return type of [State.keys](#readonly-keys).

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

Return type of [State.ornull](#ornull).

**`Typeparam`**

S Type of a value of a state

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Defined in

[index.ts:74](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L74)

___

### InferStateValueType

Ƭ **InferStateValueType**<`V`\>: [`DeepReturnType`](#deepreturntype)<`V`\> extends [`__State`](#interfaces_statemd)<infer S, infer \_\> ? `S` : `V`

A routine which allows to extract value type of a state. Useful for extension developers.

#### Type parameters

| Name |
| :------ |
| `V` |

#### Defined in

[index.ts:257](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L257)

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

Ƭ **SetPartialStateAction**<`S`\>: `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<`U` \| [`Immutable`](#immutable)<`U`\>\> \| `Record`<`number`, `U` \| [`Immutable`](#immutable)<`U`\>\> \| (`prevValue`: `S`) => `ReadonlyArray`<`U` \| [`Immutable`](#immutable)<`U`\>\> \| `Record`<`number`, `U` \| [`Immutable`](#immutable)<`U`\>\> : `S` extends `object` \| `string` ? `Partial`<`S` \| [`Immutable`](#immutable)<`S`\>\> \| (`prevValue`: `S`) => `Partial`<`S` \| [`Immutable`](#immutable)<`S`\>\> : `S` \| [`Immutable`](#immutable)<`S`\> \| (`prevState`: `S`) => `S` \| [`Immutable`](#immutable)<`S`\>

Type of an argument of [State.merge](#merge).

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

Ƭ **SetStateAction**<`S`\>: `S` \| [`Immutable`](#immutable)<`S`\> \| `Promise`<`S` \| [`Immutable`](#immutable)<`S`\>\> \| (`prevState`: `S`) => `S` \| [`Immutable`](#immutable)<`S`\> \| `Promise`<`S` \| [`Immutable`](#immutable)<`S`\>\>

Type of an argument of [State.set](#set).

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

Ƭ **State**<`S`, `E`\>: [`__State`](#interfaces_statemd)<`S`, `E`\> & [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> & `E` & `S` extends `ReadonlyArray`<infer U\> ? `ReadonlyArray`<[`State`](#state)<`U`, `E`\>\> : `S` extends `object` ? `Omit`<{ readonly [K in keyof Required<S\>]: State<S[K], E\> }, keyof [`StateMethods`](#interfacesstatemethodsmd)<`S`, `E`\> \| [`__KeysOfType`](#__keysoftype)<`S`, `Function`\> \| keyof `E`\> : {}

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

[index.ts:277](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L277)

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

[index.ts:235](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L235)

## Variables

### \_\_state

• `Const` **\_\_state**: typeof [`__state`](#__state)

#### Defined in

[index.ts:249](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L249)

___

### none

• `Const` **none**: `any`

Special symbol which might be used to delete properties
from an object calling [State.set](#set) or [State.merge](#merge).

[Learn more...](https://hookstate.js.org/docs/nested-state#deleting-existing-element)

#### Defined in

[index.ts:56](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L56)

## Functions

### StateFragment

▸ **StateFragment**<`S`, `E`\>(`props`): `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` |

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

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` |

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

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` |

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

Configures Hookstate behavior globally. This is for special cases only, when default
heuristics fail to work in a specific environment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`<[`Configuration`](#interfacesconfigurationmd)\> |

#### Returns

`void`

___

### destroyHookstate

▸ **destroyHookstate**<`S`, `E`\>(`state`): `void`

A method to destroy a global state and resources allocated by the extensions

#### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`__State`](#interfaces_statemd)<`S`, `E`\> |

#### Returns

`void`

___

### extend

▸ **extend**<`S`, `E`, `E1`, `E2`, `E3`, `E4`, `E5`\>(`e1?`, `e2?`, `e3?`, `e4?`, `e5?`): [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `E5` & `E4` & `E3` & `E2` & `E1`\>

A function combines multiple extensions into one extension and returns it
Browse an example [here](https://hookstate.js.org/docs/extensions-snapshotable)

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

Creates new state and returns it.

You can create as many global states as you need.

When you the state is not needed anymore,
it should be destroyed by calling
`destroyHookstate()` function.
This is necessary for some extensions,
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

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` = {} |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initial` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> | Initial value of the state.  It can be a value OR a promise,  which asynchronously resolves to a value,  OR a function returning a value or a promise. |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> | - |

#### Returns

[`State`](#state)<`S`, `E`\>

[State](#state) instance,
which can be used directly to get and set state value
outside of React components.
When you need to use the state in a functional `React` component,
pass the created state to [useHookstate](#useHookstate) function and
use the returned result in the component's logic.

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

### isHookstate

▸ **isHookstate**(`v`): `boolean`

A method to check if a variable is an instance of Hookstate State

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `any` |

#### Returns

`boolean`

___

### isHookstateValue

▸ **isHookstateValue**(`v`): `boolean`

A method to check if a variable is an instance of traced (wrapped in a proxy) Hookstate Value

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `any` |

#### Returns

`boolean`

___

### suspend

▸ **suspend**<`S`, `E`\>(`state`): `undefined` \| `FunctionComponentElement`<`any`\>

If state is promised, then it returns a component which integrates with React 18 Suspend feature automatically.
Note, that React 18 Suspend support for data loading is still experimental,
but it worked as per our experiments and testing.

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
| `E` | extends `Object` = {} |

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
| `E` | extends `Object` = {} |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> |
| `extension` | [`ExtensionFactory`](#extensionfactory)<`S`, `E`, `any`\> |

#### Returns

`never`

▸ **useHookstate**<`S`, `E`\>(`source`): [`State`](#state)<`S`, `E`\>

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

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` = {} |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`__State`](#interfaces_statemd)<`S`, `E`\> | a reference to the state to hook into    The `useHookstate` is a hook and should follow React's rules of hooks. |

#### Returns

[`State`](#state)<`S`, `E`\>

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

▸ **useHookstate**<`S`, `E`\>(`source`, `extension?`): [`State`](#state)<`S`, `E`\>

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

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `E` | extends `Object` = {} |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`SetInitialStateAction`](#setinitialstateaction)<`S`\> | An initial value state. |
| `extension?` | [`ExtensionFactory`](#extensionfactory)<`S`, {}, `E`\> | - |

#### Returns

[`State`](#state)<`S`, `E`\>

an instance of [State](#state),
which **must be** used within the component (during rendering
or in effects) or it's children.

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

# Interfaces


<a name="interfacesconfigurationmd"/>

## Interface: Configuration

A type of an argument of the configure function

### Table of contents

#### Properties

- [interceptDependencyListsMode](#interceptdependencylistsmode)
- [isDevelopmentMode](#isdevelopmentmode)
- [promiseDetector](#promisedetector)

### Properties

#### interceptDependencyListsMode

• **interceptDependencyListsMode**: ``"always"`` \| ``"development"`` \| ``"never"``

By default Hookstate intercepts calls to useEffect, useMemo and
other functions where a dependency lists are used as arguments.
This allows these hook functions to have Hookstate State objects
in dependency lists and everything to work as 'expected'.

It is possible to opt-out from this mode, configuring the option to never.

Alternatively, it is possible to set it to intercept only during development,
which will raise HOOKSTATE-100 error whenever Hookstate State is used in a dependency list of standard React hook function.
This error can be fixed by replacing standard React hooks by Hookstate provided hooks,
for example useEffect by useHookstateEffect

##### Defined in

[index.ts:1971](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L1971)

___

#### isDevelopmentMode

• **isDevelopmentMode**: `boolean`

Defines is Hookstate is running in a development mode.
Development mode enables additional checking and HMR support.
By default, it detects if process.env.NODE_ENV is set to 'development'.
It might not work in all environments and so expected to be provided by an application explicitly.

##### Defined in

[index.ts:1978](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L1978)

___

#### promiseDetector

• **promiseDetector**: (`p`: `any`) => `boolean`

##### Type declaration

▸ (`p`): `boolean`

A callback which allows Hookstate to detect if a provided variable is a promise or not.
This allows to enable Hookstate working in Angular environment when Promises are wrapped by zone.js,
which breaks standard promise resolution / detection convention.

###### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `any` |

###### Returns

`boolean`

##### Defined in

[index.ts:1984](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L1984)


<a name="interfacesextensionmd"/>

## Interface: Extension<S, I, E\>

For plugin developers only.
Set of callbacks, a plugin may subscribe to.

[Learn more...](https://hookstate.js.org/docs/writing-extension)

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

• `Optional` `Readonly` **onCreate**: (`state`: [`State`](#state)<`S`, {}\>, `extensionsCallbacks`: { [K in string \| number \| symbol]: Function }) => { readonly [K in string \| number \| symbol]: Function }

##### Type declaration

▸ (`state`, `extensionsCallbacks`): { readonly [K in string \| number \| symbol]: Function }

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, {}\> |
| `extensionsCallbacks` | { [K in string \| number \| symbol]: Function } |

###### Returns

{ readonly [K in string \| number \| symbol]: Function }

##### Defined in

[index.ts:341](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L341)

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

[index.ts:356](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L356)

___

#### onInit

• `Optional` `Readonly` **onInit**: (`state`: [`State`](#state)<`S`, `E` & `I`\>, `extensionsCallbacks`: { [K in string \| number \| symbol]: Function }) => `void`

##### Type declaration

▸ (`state`, `extensionsCallbacks`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`S`, `E` & `I`\> |
| `extensionsCallbacks` | { [K in string \| number \| symbol]: Function } |

###### Returns

`void`

##### Defined in

[index.ts:347](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L347)

___

#### onPremerge

• `Optional` `Readonly` **onPremerge**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `value`: `any`, `rootState`: [`State`](#state)<`any`, `E` & `I`\>) => `void`

##### Type declaration

▸ (`state`, `value`, `rootState`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `value` | `any` |
| `rootState` | [`State`](#state)<`any`, `E` & `I`\> |

###### Returns

`void`

##### Defined in

[index.ts:354](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L354)

___

#### onPreset

• `Optional` `Readonly` **onPreset**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `value`: `any`, `rootState`: [`State`](#state)<`any`, `E` & `I`\>) => `void`

##### Type declaration

▸ (`state`, `value`, `rootState`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `value` | `any` |
| `rootState` | [`State`](#state)<`any`, `E` & `I`\> |

###### Returns

`void`

##### Defined in

[index.ts:353](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L353)

___

#### onSet

• `Optional` `Readonly` **onSet**: (`state`: [`State`](#state)<`any`, `E` & `I`\>, `descriptor`: `SetActionDescriptor`, `rootState`: [`State`](#state)<`any`, `E` & `I`\>) => `void`

##### Type declaration

▸ (`state`, `descriptor`, `rootState`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`State`](#state)<`any`, `E` & `I`\> |
| `descriptor` | `SetActionDescriptor` |
| `rootState` | [`State`](#state)<`any`, `E` & `I`\> |

###### Returns

`void`

##### Defined in

[index.ts:355](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L355)


<a name="interfacesstatemethodsmd"/>

## Interface: StateMethods<S, E\>

An interface to manage a state in Hookstate.

**`Typeparam`**

S Type of a value of a state

### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

### Table of contents

#### Properties

- [error](#error)
- [keys](#keys)
- [ornull](#ornull)
- [path](#path)
- [promise](#promise)
- [promised](#promised)
- [value](#value)

#### Methods

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

[index.ts:160](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L160)

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

[index.ts:120](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L120)

___

#### ornull

• **ornull**: [`InferStateOrnullType`](#inferstateornulltype)<`S`, `E`\>

If state value is null or undefined, returns state value.
Otherwise, it returns this state instance but
with null and undefined removed from the type parameter.

[Learn more...](https://hookstate.js.org/docs/nullable-state)

##### Defined in

[index.ts:227](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L227)

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

[index.ts:109](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L109)

___

#### promise

• `Readonly` **promise**: `undefined` \| `Promise`<[`State`](#state)<`S`, `E`\>\>

If the State is promised, this will be a defined promise
which an application can use to subscribe to with 'then' callback.

##### Defined in

[index.ts:154](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L154)

___

#### promised

• `Readonly` **promised**: `boolean`

True if state value is not yet available (eg. equal to a promise)

##### Defined in

[index.ts:148](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L148)

___

#### value

• `Readonly` **value**: [`Immutable`](#immutable)<`S`\>

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [State.get](#get) method.

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

[index.ts:143](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L143)

### Methods

#### get

▸ **get**(`options?`): [`Immutable`](#immutable)<`S`\>

Unwraps and returns the underlying state value referred by
[path](#readonly-path) of this state instance.

It returns the same result as [State.value](#readonly-value) method.

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

[`Immutable`](#immutable)<`S`\>

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


<a name="interfaces_statemd"/>

## Interface: \_\_State<S, E\>

### Type parameters

| Name |
| :------ |
| `S` |
| `E` |

### Table of contents

#### Properties

- [[\_\_\_state]](#[___state])

### Properties

#### [\_\_\_state]

• **[\_\_\_state]**: [[`Immutable`](#immutable)<`S`\>, `E`]

##### Defined in

[index.ts:251](https://github.com/avkonst/hookstate/blob/master/core/src/index.ts#L251)
