import React from 'react';
import { useStateLink } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useStateLink({ priority: 0, taskName: 'Untitled Task' });
    return <>
        <p>
            <span><b>Counter value: {state.value.priority}</b> </span>
            <button onClick={() => state.nested.priority.set(p => p + 1)}>Increase priority</button>
        </p>
        <p>
            <span><b>Task name: {state.value.taskName}</b> </span>
            <input value={state.value.taskName} onChange={v => state.nested.taskName.set(v.target.value)}/>
        </p>
    </>
}
