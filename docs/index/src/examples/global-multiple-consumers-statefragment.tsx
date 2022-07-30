import React from 'react';
import { hookstate, StateFragment } from '@hookstate/core';

const state = hookstate(0);

export const ExampleComponent = () => <StateFragment state={state}>{s => <span>
        Current state: {s.value} <button onClick={() => s.set(p => p + 1)}>Increment</button>
    </span>
}</StateFragment>
