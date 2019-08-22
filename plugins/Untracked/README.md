# @hookstate/untracked

[![license](https://img.shields.io/github/license/avkonst/hookstate)](https://img.shields.io/github/license/avkonst/hookstate) [![npm version](https://img.shields.io/npm/v/@hookstate/untracked.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/untracked)

Plugin for @hookstate/core to enable logging. See [demo](https://hookstate.netlify.com/plugin-untracked).

## API Documentation

```tsx
const state = useStateLink(...)
    .with(Untracked);
const stateValue = Untracked(state).get();
Untracked(state).set(...)
```

- `Untracked.get()` - the same as `get()`, but it does not 'mark' the data as *used*. It means a component will not rerender if the returned value is changed in the state. You should know what you are doing with it, use at your own risk.
- `Untracked.set(...)` or `Untracked.set((prevState) => ...)` - the same as `set(...)` or or `set((prevState) => ...)`, but it does not 'mark' the data as changed. It means components using the set part of the state will not rerender. You should know what you are doing with it, use at your own risk.
