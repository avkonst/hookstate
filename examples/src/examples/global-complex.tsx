import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink([{ counter: 0 }, { counter: 0 }, { counter: 0 }]);

setInterval(() => useStateLinkUnmounted(store)
    .nested[0] // get to the state of the first array element
    .nested.counter // get to the state of the element's counter
    .set(p => p + 1) // increment the counter...
, 3000) // ...every 3 seconds

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <>
        <p>Current state: {JSON.stringify(state.value)}</p>
        {state.nested.map((elementState, elementIndex) =>
            <p key={elementIndex}>
                <span><b>Counter #{elementIndex}: {elementState.value.counter}</b> </span>
                <button onClick={() => elementState.nested.counter.set(p => p + 1)}>Increment</button>
                {elementIndex === 0 && ' watch +1 every 3 seconds '}
            </p>
        )}
    </>
}
