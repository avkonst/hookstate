import React from 'react';
import { useStateLink } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useStateLink(0);
    return <p>
        <span><b>Counter value: {state.value}</b> </span>
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </p>
}
