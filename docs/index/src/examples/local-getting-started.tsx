import React from 'react';
import { useState } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useState(0);
    return <>
        <b>Counter value: {state.get()} </b>
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </>
}
