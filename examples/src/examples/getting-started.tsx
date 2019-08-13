import React from 'react';
import { useStateLink, createStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink({ counter: 0 });

setInterval(() => useStateLinkUnmounted(store).nested.counter.set(p => p + 1), 5000)

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <p>
        <span><b>Counter: {state.value.counter}</b> (+1 every 5 seconds) </span>
        <button onClick={() => state.nested.counter.set(p => p + 1)}>Increment</button>
    </p>
}
