import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink({ counter: 0 });

setInterval(() => useStateLinkUnmounted(store) // get to the state of the store
    .nested.counter // get to the state of the counter property
    .set(p => p + 1) // increment the counter...
, 3000) // ...every 3 seconds

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <p>
        <p>Current state: {JSON.stringify(state.value)}</p>
        <span><b>Counter value: {state.value.counter}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.nested.counter.set(p => p + 1)}>Increment</button>
    </p>
}
