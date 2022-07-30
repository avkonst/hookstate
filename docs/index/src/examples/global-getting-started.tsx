import React from 'react';
import { createHookstate, useHookstate } from '@hookstate/core';

const globalState = createHookstate(0);

setInterval(() => globalState.set(p => p + 1), 3000)

export const ExampleComponent = () => {
    const state = useHookstate(globalState);
    return <>
        <b>Counter value: {state.get()}</b> (watch +1 every 3 seconds) {' '}
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </>
}