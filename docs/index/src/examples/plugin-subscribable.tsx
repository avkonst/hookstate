import React from 'react';
import { useHookstate } from '@hookstate/core';
import { subscribable } from '@hookstate/subscribable';

export const ExampleComponent = () => {
    const state = useHookstate({ a: 1, b: 1 }, subscribable())
    
    React.useEffect(() => state.subscribe(
        (v) => console.log('updated any counter', JSON.stringify(v))), [])
    React.useEffect(() => state.a.subscribe(
        (v) => console.log('updated counter A', JSON.stringify(v))), [])
    React.useEffect(() => state.b.subscribe(
        (v) => console.log('updated counter B', JSON.stringify(v))), [])
                
    return <>
        <p>Open console to see the subscription effect</p>
        <p>Counter A: {state.a.value}</p>
        <p>Counter B: {state.b.value}</p>
        <p><button onClick={() => state.a.set(p => p + 1)}>
            Increment Counter A
        </button></p>
        <p><button onClick={() => state.b.set(p => p + 1)}>
            Increment Counter B
        </button></p>
    </>
}

