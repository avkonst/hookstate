# 1.4.0

### New `StateLink<S>.merge()` method
It does partial state set for objects, and concatenation for arrays and strings.

### New `StateLink<S>.error` and `StateLink<S>.promised` properties
It is experimental feature for asynchronously loaded states.
Documetation is coming as soon as the feature is settled.

### `StateLink<S>.set` can accept `Promise<S>`
It is experimental feature for asynchronously loaded states.
Documetation is coming as soon as the feature is settled.

### New `StateLink<S>.batch()` method
It is experimental feature for batched updates.
Documetation is coming as soon as the feature is settled.

### `StateRef<S>` is deprecated
It has been displaced by `StateInf<StateLink<S>>`. `StateRef` is type aliased to this.
`createStateLink` always returns `StateInf` now. The API change is backward compatible.

### `useStateLinkUnmounted` is deprecated
It has been displaced by `StateInf.access()` method.
It fixes react rules of hooks ESLint warnings and simplifies the API.



