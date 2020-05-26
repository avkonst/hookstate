import React from 'react';
import { createState, useState, self } from '@hookstate/core';

const globalState = createState(0).map(s => ({
    use: () => useState(s)[self].value,
    increment: () => s.set(p => p + 1)
}));

setInterval(() => globalState.increment(), 3000)

export const ExampleComponent = () => {
    const state = globalState.use();
    return <p>
        <span><b>Counter value: {state}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => globalState.increment()}>Increment</button>
    </p>
}
