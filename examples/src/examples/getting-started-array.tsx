import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted, StateLink } from '@hookstate/core';

const store = createStateLink([0, 0, 0]);

setInterval(() => useStateLinkUnmounted(store).nested[0].set(p => p + 1), 3000)

export const ExampleComponent = () => {
    // type annotations are only to demonstrate how 'nested'
    // types are unfolder when the state tree is traversed
    const state: StateLink<number[]> = useStateLink(store);
    return <>{
        state.nested.map((elementState: StateLink<number>, elementIndex: number) =>
            <p key={elementIndex}>
                <span>
                    <b>Counter #{elementIndex} value: {elementState.value}</b>
                    {elementIndex === 0 && ' watch +1 every 3 seconds '}
                </span>
                <button onClick={() => elementState.set(p => p + 1)}>Increment</button>
            </p>
        )
    }</>
}
