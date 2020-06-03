import React from 'react';
import { createState, useState, self, State } from '@hookstate/core';

// internal variables
const globalState = createState(0);
const wrapState = (s: State<number>) => ({
    get: () => s[self].value,
    increment: () => s[self].set(p => p + 1)
})

// The following 2 functions can be exported now:
export const accessGlobalState = () => globalState[self].map(wrapState)
export const useGlobalState = () => useState(globalState)[self].map(wrapState)

// And here is how it can be used outside of a component ...
setInterval(() => accessGlobalState().increment(), 3000)
// ... and inside of a component
export const ExampleComponent = () => {
    const state = useGlobalState();
    return <p>
        <span><b>Counter value: {state.get()}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.increment()}>Increment</button>
    </p>
}
