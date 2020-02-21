
<Meta title="API Reference/Core library"/>


# @hookstate/core

## Index

### Interfaces

* [DestroyableStateLink](#interfacesdestroyablestatelinkmd)
* [DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)
* [Plugin](#interfacespluginmd)
* [PluginCallbacks](#interfacesplugincallbacksmd)
* [PluginCallbacksOnBatchArgument](#interfacesplugincallbacksonbatchargumentmd)
* [PluginCallbacksOnDestroyArgument](#interfacesplugincallbacksondestroyargumentmd)
* [PluginCallbacksOnSetArgument](#interfacesplugincallbacksonsetargumentmd)
* [StateLink](#interfacesstatelinkmd)
* [StateLinkPlugable](#interfacesstatelinkplugablemd)
* [WrappedStateLink](#interfaceswrappedstatelinkmd)

### Type aliases

* [CustomContext](#customcontext)
* [ErrorValueAtPath](#errorvalueatpath)
* [InitialValueAtRoot](#initialvalueatroot)
* [NestedInferredKeys](#nestedinferredkeys)
* [NestedInferredLink](#nestedinferredlink)
* [OnlyNullable](#onlynullable)
* [Path](#path)
* [SetPartialStateAction](#setpartialstateaction)
* [SetStateAction](#setstateaction)
* [StateInf](#stateinf)
* [StateRef](#stateref)
* [StateValueAtPath](#statevalueatpath)
* [StateValueAtRoot](#statevalueatroot)

### Variables

* [DevTools](#const-devtools)
* [None](#const-none)

### Functions

* [Downgraded](#downgraded)
* [StateFragment](#statefragment)
* [StateMemo](#statememo)
* [createStateLink](#createstatelink)
* [useStateLink](#usestatelink)
* [useStateLinkUnmounted](#usestatelinkunmounted)

## Type aliases

###  CustomContext

Ƭ **CustomContext**: *any*

*Defined in [UseStateLink.d.ts:66](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L66)*

___

###  ErrorValueAtPath

Ƭ **ErrorValueAtPath**: *any*

*Defined in [UseStateLink.d.ts:65](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L65)*

___

###  InitialValueAtRoot

Ƭ **InitialValueAtRoot**: *S | Promise‹S› | function*

*Defined in [UseStateLink.d.ts:67](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L67)*

___

###  NestedInferredKeys

Ƭ **NestedInferredKeys**: *S extends ReadonlyArray<infer _\> ? ReadonlyArray<number\> : S extends null ? undefined : S extends object ? ReadonlyArray<keyof S\> : undefined*

*Defined in [UseStateLink.d.ts:13](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L13)*

___

###  NestedInferredLink

Ƭ **NestedInferredLink**: *S extends ReadonlyArray<\> ? ReadonlyArray<StateLink<U\>> : S extends null ? undefined : S extends object ? object : undefined*

*Defined in [UseStateLink.d.ts:10](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L10)*

___

###  OnlyNullable

Ƭ **OnlyNullable**: *S extends null ? S extends undefined ? null | undefined : null : S extends undefined ? undefined : never*

*Defined in [UseStateLink.d.ts:17](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L17)*

___

###  Path

Ƭ **Path**: *ReadonlyArray‹string | number›*

*Defined in [UseStateLink.d.ts:14](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L14)*

___

###  SetPartialStateAction

Ƭ **SetPartialStateAction**: *S extends ReadonlyArray<\> ? ReadonlyArray<U\> | Record<number, U\> | function : S extends object | string ? Partial<S\> | function : React.SetStateAction<S\>*

*Defined in [UseStateLink.d.ts:16](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L16)*

___

###  SetStateAction

Ƭ **SetStateAction**: *S | Promise‹S› | function*

*Defined in [UseStateLink.d.ts:15](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L15)*

___

###  StateInf

Ƭ **StateInf**: *S extends StateLink<infer U\> ? DestroyableStateLink<U\> : DestroyableWrappedStateLink<S\>*

*Defined in [UseStateLink.d.ts:9](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L9)*

**`deprecated,`** declared for backward compatibility.

___

###  StateRef

Ƭ **StateRef**: *[StateInf](#stateinf)‹[StateLink](#interfacesstatelinkmd)‹S››*

*Defined in [UseStateLink.d.ts:5](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L5)*

**`deprecated,`** declared for backward compatibility.

___

###  StateValueAtPath

Ƭ **StateValueAtPath**: *any*

*Defined in [UseStateLink.d.ts:64](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L64)*

___

###  StateValueAtRoot

Ƭ **StateValueAtRoot**: *any*

*Defined in [UseStateLink.d.ts:63](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L63)*

## Variables

### `Const` DevTools

• **DevTools**: *keyof symbol*

*Defined in [UseStateLink.d.ts:71](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L71)*

**`warning`** experimental feature

___

### `Const` None

• **None**: *any*

*Defined in [UseStateLink.d.ts:69](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L69)*

**`warning`** experimental feature

## Functions

###  Downgraded

##### ▸ **Downgraded**(): *[Plugin](#interfacespluginmd)*

*Defined in [UseStateLink.d.ts:139](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L139)*

**Returns:** *[Plugin](#interfacespluginmd)*

___

###  StateFragment

##### ▸ **StateFragment**<**S**\>(`props`: object): *ReactElement*

*Defined in [UseStateLink.d.ts:116](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L116)*

**Type parameters:**

▪ **S**

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |

**Returns:** *ReactElement*

##### ▸ **StateFragment**<**S**, **E**, **R**\>(`props`: object): *ReactElement*

*Defined in [UseStateLink.d.ts:120](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L120)*

**Type parameters:**

▪ **S**

▪ **E**: *object*

▪ **R**

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`transform` | function |

**Returns:** *ReactElement*

##### ▸ **StateFragment**<**R**\>(`props`: object): *ReactElement*

*Defined in [UseStateLink.d.ts:125](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L125)*

**Type parameters:**

▪ **R**

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [WrappedStateLink](#interfaceswrappedstatelinkmd)‹R› |

**Returns:** *ReactElement*

##### ▸ **StateFragment**<**S**\>(`props`: object): *ReactElement*

*Defined in [UseStateLink.d.ts:129](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L129)*

**Type parameters:**

▪ **S**

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [InitialValueAtRoot](#initialvalueatroot)‹S› |

**Returns:** *ReactElement*

##### ▸ **StateFragment**<**S**, **R**\>(`props`: object): *ReactElement*

*Defined in [UseStateLink.d.ts:133](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L133)*

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **props**: *object*

Name | Type |
------ | ------ |
`children` | function |
`state` | [InitialValueAtRoot](#initialvalueatroot)‹S› |
`transform` | function |

**Returns:** *ReactElement*

___

###  StateMemo

##### ▸ **StateMemo**<**S**, **R**\>(`transform`: function, `equals?`: undefined | function): *function*

*Defined in [UseStateLink.d.ts:138](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L138)*

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

▪`Optional`  **equals**: *undefined | function*

**Returns:** *function*

##### ▸ (`link`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`link` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

___

###  createStateLink

##### ▸ **createStateLink**<**S**\>(`initial`: [InitialValueAtRoot](#initialvalueatroot)‹S›): *[DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:97](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L97)*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`initial` | [InitialValueAtRoot](#initialvalueatroot)‹S› |

**Returns:** *[DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›*

##### ▸ **createStateLink**<**S**, **R**\>(`initial`: [InitialValueAtRoot](#initialvalueatroot)‹S›, `transform`: function): *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*

*Defined in [UseStateLink.d.ts:98](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L98)*

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **initial**: *[InitialValueAtRoot](#initialvalueatroot)‹S›*

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

**Returns:** *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*

___

###  useStateLink

##### ▸ **useStateLink**<**S**\>(`source`: [StateLink](#interfacesstatelinkmd)‹S›): *[StateLink](#interfacesstatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:99](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L99)*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [StateLink](#interfacesstatelinkmd)‹S› |

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

##### ▸ **useStateLink**<**S**, **R**\>(`source`: [StateLink](#interfacesstatelinkmd)‹S›, `transform`: function): *R*

*Defined in [UseStateLink.d.ts:100](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L100)*

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **source**: *[StateLink](#interfacesstatelinkmd)‹S›*

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

**Returns:** *R*

##### ▸ **useStateLink**<**R**\>(`source`: [WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›): *R*

*Defined in [UseStateLink.d.ts:101](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L101)*

**Type parameters:**

▪ **R**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [WrappedStateLink](#interfaceswrappedstatelinkmd)‹R› |

**Returns:** *R*

##### ▸ **useStateLink**<**S**\>(`source`: [InitialValueAtRoot](#initialvalueatroot)‹S›): *[StateLink](#interfacesstatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:102](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L102)*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [InitialValueAtRoot](#initialvalueatroot)‹S› |

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

##### ▸ **useStateLink**<**S**, **R**\>(`source`: [InitialValueAtRoot](#initialvalueatroot)‹S›, `transform`: function): *R*

*Defined in [UseStateLink.d.ts:103](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L103)*

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **source**: *[InitialValueAtRoot](#initialvalueatroot)‹S›*

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

**Returns:** *R*

___

###  useStateLinkUnmounted

##### ▸ **useStateLinkUnmounted**<**S**\>(`source`: [DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›): *[StateLink](#interfacesstatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:107](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L107)*

**`deprecated`** use source directly instead

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S› |

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

##### ▸ **useStateLinkUnmounted**<**S**, **R**\>(`source`: [DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›, `transform`: function): *R*

*Defined in [UseStateLink.d.ts:111](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L111)*

**`deprecated`** use source.wrap(transform).access() instead

**Type parameters:**

▪ **S**

▪ **R**

**Parameters:**

▪ **source**: *[DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›*

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |

**Returns:** *R*

##### ▸ **useStateLinkUnmounted**<**R**\>(`source`: [DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›): *R*

*Defined in [UseStateLink.d.ts:115](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L115)*

**`deprecated`** use source.access() instead

**Type parameters:**

▪ **R**

**Parameters:**

Name | Type |
------ | ------ |
`source` | [DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R› |

**Returns:** *R*

# Interfaces


<a name="interfacesdestroyablestatelinkmd"/>


## Interface: DestroyableStateLink <**S**\>

### Type parameters

▪ **S**

### Hierarchy

* [StateLink](#interfacesstatelinkmd)‹S›

  ↳ **DestroyableStateLink**

### Index

#### Properties

* [error](#error)
* [keys](#keys)
* [nested](#nested)
* [path](#path)
* [promised](#promised)
* [value](#value)

#### Methods

* [access](#access)
* [batch](#batch)
* [denull](#denull)
* [destroy](#destroy)
* [get](#get)
* [merge](#merge)
* [set](#set)
* [with](#with)
* [wrap](#wrap)

### Properties

####  error

• **error**: *[ErrorValueAtPath](#errorvalueatpath) | undefined*

*Inherited from [StateLink](#interfacesstatelinkmd).[error](#error)*

*Defined in [UseStateLink.d.ts:26](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L26)*

**`warning`** experimental feature

___

####  keys

• **keys**: *[NestedInferredKeys](#nestedinferredkeys)‹S›*

*Inherited from [StateLink](#interfacesstatelinkmd).[keys](#keys)*

*Defined in [UseStateLink.d.ts:29](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L29)*

___

####  nested

• **nested**: *[NestedInferredLink](#nestedinferredlink)‹S›*

*Inherited from [StateLink](#interfacesstatelinkmd).[nested](#nested)*

*Defined in [UseStateLink.d.ts:28](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L28)*

___

####  path

• **path**: *[Path](#path)*

*Inherited from [StateLink](#interfacesstatelinkmd).[path](#path)*

*Defined in [UseStateLink.d.ts:27](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L27)*

___

####  promised

• **promised**: *boolean*

*Inherited from [StateLink](#interfacesstatelinkmd).[promised](#promised)*

*Defined in [UseStateLink.d.ts:24](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L24)*

**`warning`** experimental feature

___

####  value

• **value**: *S*

*Inherited from [StateLink](#interfacesstatelinkmd).[value](#value)*

*Defined in [UseStateLink.d.ts:22](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L22)*

### Methods

####  access

##### ▸ **access**(): *[StateLink](#interfacesstatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:42](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L42)*

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

___

####  batch

##### ▸ **batch**(`action`: function, `options?`: undefined | object): *void*

*Inherited from [StateLink](#interfacesstatelinkmd).[batch](#batch)*

*Defined in [UseStateLink.d.ts:33](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L33)*

**`warning`** experimental feature

**Parameters:**

▪ **action**: *function*

##### ▸ (`s`: [StateLink](#interfacesstatelinkmd)‹S›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [StateLink](#interfacesstatelinkmd)‹S› |

▪`Optional`  **options**: *undefined | object*

**Returns:** *void*

___

####  denull

##### ▸ **denull**(): *[StateLink](#interfacesstatelinkmd)‹NonNullable‹S›› | [OnlyNullable](#onlynullable)‹S›*

*Inherited from [StateLink](#interfacesstatelinkmd).[denull](#denull)*

*Defined in [UseStateLink.d.ts:31](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L31)*

**`warning`** experimental feature

**Returns:** *[StateLink](#interfacesstatelinkmd)‹NonNullable‹S›› | [OnlyNullable](#onlynullable)‹S›*

___

####  destroy

##### ▸ **destroy**(): *void*

*Defined in [UseStateLink.d.ts:44](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L44)*

**Returns:** *void*

___

####  get

##### ▸ **get**(): *S*

*Inherited from [StateLink](#interfacesstatelinkmd).[get](#get)*

*Defined in [UseStateLink.d.ts:19](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L19)*

**Returns:** *S*

___

####  merge

##### ▸ **merge**(`newValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *void*

*Inherited from [StateLink](#interfacesstatelinkmd).[merge](#merge)*

*Defined in [UseStateLink.d.ts:21](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L21)*

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetPartialStateAction](#setpartialstateaction)‹S› |

**Returns:** *void*

___

####  set

##### ▸ **set**(`newValue`: [SetStateAction](#setstateaction)‹S›): *void*

*Inherited from [StateLink](#interfacesstatelinkmd).[set](#set)*

*Defined in [UseStateLink.d.ts:20](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetStateAction](#setstateaction)‹S› |

**Returns:** *void*

___

####  with

##### ▸ **with**(`plugin`: function): *[StateLink](#interfacesstatelinkmd)‹S›*

*Inherited from [StateLink](#interfacesstatelinkmd).[with](#with)*

*Defined in [UseStateLink.d.ts:38](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L38)*

**Parameters:**

▪ **plugin**: *function*

##### ▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

##### ▸ **with**(`pluginId`: symbol): *[[StateLink](#interfacesstatelinkmd)‹S› & [StateLinkPlugable](#interfacesstatelinkplugablemd)‹S›, [PluginCallbacks](#interfacesplugincallbacksmd)]*

*Inherited from [StateLink](#interfacesstatelinkmd).[with](#with)*

*Defined in [UseStateLink.d.ts:39](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L39)*

**Parameters:**

Name | Type |
------ | ------ |
`pluginId` | symbol |

**Returns:** *[[StateLink](#interfacesstatelinkmd)‹S› & [StateLinkPlugable](#interfacesstatelinkplugablemd)‹S›, [PluginCallbacks](#interfacesplugincallbacksmd)]*

___

####  wrap

##### ▸ **wrap**<**R**\>(`transform`: function): *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*

*Overrides [StateLink](#interfacesstatelinkmd).[wrap](#wrap)*

*Defined in [UseStateLink.d.ts:43](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L43)*

**Type parameters:**

▪ **R**

**Parameters:**

▪ **transform**: *function*

##### ▸ (`state`: [DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [DestroyableStateLink](#interfacesdestroyablestatelinkmd)‹S› |
`prev` | R &#124; undefined |

**Returns:** *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*


<a name="interfacesdestroyablewrappedstatelinkmd"/>


## Interface: DestroyableWrappedStateLink <**R**\>

### Type parameters

▪ **R**

### Hierarchy

* [WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›

  ↳ **DestroyableWrappedStateLink**

### Index

#### Properties

* [__synteticTypeInferenceMarkerInf](#__syntetictypeinferencemarkerinf)

#### Methods

* [access](#access)
* [destroy](#destroy)
* [with](#with)
* [wrap](#wrap)

### Properties

####  __synteticTypeInferenceMarkerInf

• **__synteticTypeInferenceMarkerInf**: *symbol*

*Inherited from [WrappedStateLink](#interfaceswrappedstatelinkmd).[__synteticTypeInferenceMarkerInf](#__syntetictypeinferencemarkerinf)*

*Defined in [UseStateLink.d.ts:47](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L47)*

### Methods

####  access

##### ▸ **access**(): *R*

*Defined in [UseStateLink.d.ts:52](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L52)*

**Returns:** *R*

___

####  destroy

##### ▸ **destroy**(): *void*

*Defined in [UseStateLink.d.ts:55](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L55)*

**Returns:** *void*

___

####  with

##### ▸ **with**(`plugin`: function): *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*

*Overrides [WrappedStateLink](#interfaceswrappedstatelinkmd).[with](#with)*

*Defined in [UseStateLink.d.ts:53](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L53)*

**Parameters:**

▪ **plugin**: *function*

##### ▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R›*

___

####  wrap

##### ▸ **wrap**<**R2**\>(`transform`: function): *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R2›*

*Overrides [WrappedStateLink](#interfaceswrappedstatelinkmd).[wrap](#wrap)*

*Defined in [UseStateLink.d.ts:54](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L54)*

**Type parameters:**

▪ **R2**

**Parameters:**

▪ **transform**: *function*

##### ▸ (`state`: R, `prev`: R2 | undefined): *R2*

**Parameters:**

Name | Type |
------ | ------ |
`state` | R |
`prev` | R2 &#124; undefined |

**Returns:** *[DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)‹R2›*


<a name="interfacespluginmd"/>


## Interface: Plugin

### Hierarchy

* **Plugin**

### Index

#### Properties

* [create](#create)
* [id](#id)

### Properties

####  create

• **create**: *function*

*Defined in [UseStateLink.d.ts:95](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L95)*

##### Type declaration:

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹[StateValueAtRoot](#statevalueatroot)›): *[PluginCallbacks](#interfacesplugincallbacksmd)*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹[StateValueAtRoot](#statevalueatroot)› |

___

####  id

• **id**: *symbol*

*Defined in [UseStateLink.d.ts:94](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L94)*


<a name="interfacesplugincallbacksmd"/>


## Interface: PluginCallbacks

### Hierarchy

* **PluginCallbacks**

### Index

#### Properties

* [onBatchFinish](#optional-onbatchfinish)
* [onBatchStart](#optional-onbatchstart)
* [onDestroy](#optional-ondestroy)
* [onSet](#optional-onset)

### Properties

#### `Optional` onBatchFinish

• **onBatchFinish**? : *undefined | function*

*Defined in [UseStateLink.d.ts:91](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L91)*

___

#### `Optional` onBatchStart

• **onBatchStart**? : *undefined | function*

*Defined in [UseStateLink.d.ts:90](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L90)*

___

#### `Optional` onDestroy

• **onDestroy**? : *undefined | function*

*Defined in [UseStateLink.d.ts:89](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L89)*

___

#### `Optional` onSet

• **onSet**? : *undefined | function*

*Defined in [UseStateLink.d.ts:88](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L88)*


<a name="interfacesplugincallbacksonbatchargumentmd"/>


## Interface: PluginCallbacksOnBatchArgument

### Hierarchy

* **PluginCallbacksOnBatchArgument**

### Index

#### Properties

* [context](#optional-context)
* [path](#path)
* [state](#optional-state)

### Properties

#### `Optional` context

• **context**? : *[CustomContext](#customcontext)*

*Defined in [UseStateLink.d.ts:85](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L85)*

___

####  path

• **path**: *[Path](#path)*

*Defined in [UseStateLink.d.ts:83](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L83)*

___

#### `Optional` state

• **state**? : *[StateValueAtRoot](#statevalueatroot)*

*Defined in [UseStateLink.d.ts:84](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L84)*


<a name="interfacesplugincallbacksondestroyargumentmd"/>


## Interface: PluginCallbacksOnDestroyArgument

### Hierarchy

* **PluginCallbacksOnDestroyArgument**

### Index

#### Properties

* [state](#optional-state)

### Properties

#### `Optional` state

• **state**? : *[StateValueAtRoot](#statevalueatroot)*

*Defined in [UseStateLink.d.ts:80](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L80)*


<a name="interfacesplugincallbacksonsetargumentmd"/>


## Interface: PluginCallbacksOnSetArgument

### Hierarchy

* **PluginCallbacksOnSetArgument**

### Index

#### Properties

* [merged](#optional-merged)
* [path](#path)
* [previous](#optional-previous)
* [state](#optional-state)
* [value](#optional-value)

### Properties

#### `Optional` merged

• **merged**? : *[StateValueAtPath](#statevalueatpath)*

*Defined in [UseStateLink.d.ts:77](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L77)*

___

####  path

• **path**: *[Path](#path)*

*Defined in [UseStateLink.d.ts:73](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L73)*

___

#### `Optional` previous

• **previous**? : *[StateValueAtPath](#statevalueatpath)*

*Defined in [UseStateLink.d.ts:75](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L75)*

___

#### `Optional` state

• **state**? : *[StateValueAtRoot](#statevalueatroot)*

*Defined in [UseStateLink.d.ts:74](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L74)*

___

#### `Optional` value

• **value**? : *[StateValueAtPath](#statevalueatpath)*

*Defined in [UseStateLink.d.ts:76](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L76)*


<a name="interfacesstatelinkmd"/>


## Interface: StateLink <**S**\>

### Type parameters

▪ **S**

### Hierarchy

* **StateLink**

  ↳ [DestroyableStateLink](#interfacesdestroyablestatelinkmd)

### Index

#### Properties

* [error](#error)
* [keys](#keys)
* [nested](#nested)
* [path](#path)
* [promised](#promised)
* [value](#value)

#### Methods

* [batch](#batch)
* [denull](#denull)
* [get](#get)
* [merge](#merge)
* [set](#set)
* [with](#with)
* [wrap](#wrap)

### Properties

####  error

• **error**: *[ErrorValueAtPath](#errorvalueatpath) | undefined*

*Defined in [UseStateLink.d.ts:26](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L26)*

**`warning`** experimental feature

___

####  keys

• **keys**: *[NestedInferredKeys](#nestedinferredkeys)‹S›*

*Defined in [UseStateLink.d.ts:29](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L29)*

___

####  nested

• **nested**: *[NestedInferredLink](#nestedinferredlink)‹S›*

*Defined in [UseStateLink.d.ts:28](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L28)*

___

####  path

• **path**: *[Path](#path)*

*Defined in [UseStateLink.d.ts:27](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L27)*

___

####  promised

• **promised**: *boolean*

*Defined in [UseStateLink.d.ts:24](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L24)*

**`warning`** experimental feature

___

####  value

• **value**: *S*

*Defined in [UseStateLink.d.ts:22](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L22)*

### Methods

####  batch

##### ▸ **batch**(`action`: function, `options?`: undefined | object): *void*

*Defined in [UseStateLink.d.ts:33](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L33)*

**`warning`** experimental feature

**Parameters:**

▪ **action**: *function*

##### ▸ (`s`: [StateLink](#interfacesstatelinkmd)‹S›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`s` | [StateLink](#interfacesstatelinkmd)‹S› |

▪`Optional`  **options**: *undefined | object*

**Returns:** *void*

___

####  denull

##### ▸ **denull**(): *[StateLink](#interfacesstatelinkmd)‹NonNullable‹S›› | [OnlyNullable](#onlynullable)‹S›*

*Defined in [UseStateLink.d.ts:31](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L31)*

**`warning`** experimental feature

**Returns:** *[StateLink](#interfacesstatelinkmd)‹NonNullable‹S›› | [OnlyNullable](#onlynullable)‹S›*

___

####  get

##### ▸ **get**(): *S*

*Defined in [UseStateLink.d.ts:19](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L19)*

**Returns:** *S*

___

####  merge

##### ▸ **merge**(`newValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *void*

*Defined in [UseStateLink.d.ts:21](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L21)*

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetPartialStateAction](#setpartialstateaction)‹S› |

**Returns:** *void*

___

####  set

##### ▸ **set**(`newValue`: [SetStateAction](#setstateaction)‹S›): *void*

*Defined in [UseStateLink.d.ts:20](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetStateAction](#setstateaction)‹S› |

**Returns:** *void*

___

####  with

##### ▸ **with**(`plugin`: function): *[StateLink](#interfacesstatelinkmd)‹S›*

*Defined in [UseStateLink.d.ts:38](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L38)*

**Parameters:**

▪ **plugin**: *function*

##### ▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[StateLink](#interfacesstatelinkmd)‹S›*

##### ▸ **with**(`pluginId`: symbol): *[[StateLink](#interfacesstatelinkmd)‹S› & [StateLinkPlugable](#interfacesstatelinkplugablemd)‹S›, [PluginCallbacks](#interfacesplugincallbacksmd)]*

*Defined in [UseStateLink.d.ts:39](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L39)*

**Parameters:**

Name | Type |
------ | ------ |
`pluginId` | symbol |

**Returns:** *[[StateLink](#interfacesstatelinkmd)‹S› & [StateLinkPlugable](#interfacesstatelinkplugablemd)‹S›, [PluginCallbacks](#interfacesplugincallbacksmd)]*

___

####  wrap

##### ▸ **wrap**<**R**\>(`transform`: function): *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›*

*Defined in [UseStateLink.d.ts:37](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L37)*

**Type parameters:**

▪ **R**

**Parameters:**

▪ **transform**: *function*

##### ▸ (`state`: [StateLink](#interfacesstatelinkmd)‹S›, `prev`: R | undefined): *R*

**Parameters:**

Name | Type |
------ | ------ |
`state` | [StateLink](#interfacesstatelinkmd)‹S› |
`prev` | R &#124; undefined |

**Returns:** *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›*


<a name="interfacesstatelinkplugablemd"/>


## Interface: StateLinkPlugable <**S**\>

### Type parameters

▪ **S**

### Hierarchy

* **StateLinkPlugable**

### Index

#### Methods

* [getUntracked](#getuntracked)
* [mergeUntracked](#mergeuntracked)
* [setUntracked](#setuntracked)
* [update](#update)

### Methods

####  getUntracked

##### ▸ **getUntracked**(): *S*

*Defined in [UseStateLink.d.ts:58](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L58)*

**Returns:** *S*

___

####  mergeUntracked

##### ▸ **mergeUntracked**(`mergeValue`: [SetPartialStateAction](#setpartialstateaction)‹S›): *[Path](#path) | [Path](#path)[]*

*Defined in [UseStateLink.d.ts:60](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L60)*

**Parameters:**

Name | Type |
------ | ------ |
`mergeValue` | [SetPartialStateAction](#setpartialstateaction)‹S› |

**Returns:** *[Path](#path) | [Path](#path)[]*

___

####  setUntracked

##### ▸ **setUntracked**(`newValue`: [SetStateAction](#setstateaction)‹S›): *[Path](#path)*

*Defined in [UseStateLink.d.ts:59](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L59)*

**Parameters:**

Name | Type |
------ | ------ |
`newValue` | [SetStateAction](#setstateaction)‹S› |

**Returns:** *[Path](#path)*

___

####  update

##### ▸ **update**(`paths`: [Path](#path)[]): *void*

*Defined in [UseStateLink.d.ts:61](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`paths` | [Path](#path)[] |

**Returns:** *void*


<a name="interfaceswrappedstatelinkmd"/>


## Interface: WrappedStateLink <**R**\>

### Type parameters

▪ **R**

### Hierarchy

* **WrappedStateLink**

  ↳ [DestroyableWrappedStateLink](#interfacesdestroyablewrappedstatelinkmd)

### Index

#### Properties

* [__synteticTypeInferenceMarkerInf](#__syntetictypeinferencemarkerinf)

#### Methods

* [with](#with)
* [wrap](#wrap)

### Properties

####  __synteticTypeInferenceMarkerInf

• **__synteticTypeInferenceMarkerInf**: *symbol*

*Defined in [UseStateLink.d.ts:47](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L47)*

### Methods

####  with

##### ▸ **with**(`plugin`: function): *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›*

*Defined in [UseStateLink.d.ts:48](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L48)*

**Parameters:**

▪ **plugin**: *function*

##### ▸ (): *[Plugin](#interfacespluginmd)*

**Returns:** *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R›*

___

####  wrap

##### ▸ **wrap**<**R2**\>(`transform`: function): *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R2›*

*Defined in [UseStateLink.d.ts:49](https://github.com/avkonst/hookstate/blob/master/dist/UseStateLink.d.ts#L49)*

**Type parameters:**

▪ **R2**

**Parameters:**

▪ **transform**: *function*

##### ▸ (`state`: R, `prev`: R2 | undefined): *R2*

**Parameters:**

Name | Type |
------ | ------ |
`state` | R |
`prev` | R2 &#124; undefined |

**Returns:** *[WrappedStateLink](#interfaceswrappedstatelinkmd)‹R2›*
