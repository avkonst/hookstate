import React from 'react';
import { createState, useState, self, State } from '@hookstate/core';

const globalState = createState(0);

const wrapState = (s: State<number>) => ({
    get: () => s[self].value,
    increment: () => s[self].set(p => p + 1)
})

const accessGlobalState = () => globalState[self].map(wrapState)
const useGlobalState = () => useState(globalState)[self].map(wrapState)

setInterval(() => accessGlobalState().increment(), 3000)

export const ExampleComponent = () => {
    const state = useGlobalState();
    return <p>
        <span><b>Counter value: {state.get()}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.increment()}>Increment</button>
    </p>
}
