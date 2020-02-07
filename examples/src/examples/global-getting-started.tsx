import React from 'react';
import { createStateLink, useStateLink } from '@hookstate/core';

const stateLink = createStateLink(0);

setInterval(() => stateLink.access().set(p => p + 1), 3000)

export const ExampleComponent = () => {
    const state = useStateLink(stateLink);
    return <p>
        <span><b>Counter value: {state.value}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </p>
}
