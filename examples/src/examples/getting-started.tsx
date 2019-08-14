import React from 'react';
import { useStateLink, createStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink({ counter: 0 });

setInterval(() => useStateLinkUnmounted(store).nested.counter.set(p => p + 1), 3000)

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <p>
        <span><b>Counter value: {state.value.counter}</b> (watch +1 every 3 seconds) </span>
        <button onClick={() => state.nested.counter.set(p => p + 1)}>Increment</button>
    </p>
}
