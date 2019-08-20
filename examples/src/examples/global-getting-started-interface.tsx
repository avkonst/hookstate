import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted } from '@hookstate/core';

const stateRef = createStateLink(0, s => ({
    current: s.get(),
    increment: () => s.set(p => p + 1)
}));

setInterval(() => useStateLinkUnmounted(stateRef).increment(), 3000)

export const ExampleComponent = () => {
    const state = useStateLink(stateRef);
    return <p>
        <span><b>Counter value: {state.current}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.increment()}>Increment</button>
    </p>
}
