import React from 'react';
import { useStateLink } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useStateLink(0);
    return <p>
        <span><b>Counter value: {state.value}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </p>
}
