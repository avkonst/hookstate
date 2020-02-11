import React from 'react';
import { useStateLink, createStateLink } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

interface Task { name: string }

const stateLink = createStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
    .with(Persistence('plugin-persisted-data-key')); // localStorage key to load from / save to

export const ExampleComponent = () => {
    const state = useStateLink(stateLink)
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
