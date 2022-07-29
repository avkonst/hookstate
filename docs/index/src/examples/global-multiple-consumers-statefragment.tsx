import React from 'react';
import { createHookstate, StateFragment } from '@hookstate/core';

const state = createHookstate(0);

export const ExampleComponent = () => <StateFragment state={state}>{s => <span>
        Current state: {s.value} <button onClick={() => s.set(p => p + 1)}>Increment</button>
    </span>
}</StateFragment>
