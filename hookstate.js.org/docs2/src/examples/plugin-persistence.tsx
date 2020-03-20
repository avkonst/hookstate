import React from 'react';
import { useStateLink, createStateLink } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }])
        .with(Persistence('plugin-persisted-data-key'))
    return <>
        {state.nested.map((taskState, taskIndex) => {
            return <p key={taskIndex}>
                <input
                    value={taskState.nested.name.get()}
                    onChange={e => taskState.nested.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}>
            Add task
        </button></p>
    </>
}
