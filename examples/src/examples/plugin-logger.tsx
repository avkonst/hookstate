import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';
import { Logger } from '@hookstate/logger';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
        .with(Logger); // enable the plugin
    state.extended.log()
    return <>
        <p>Open the development console to see the logging</p>
        {state.nested.map((taskState, taskIndex) => {
            taskState.extended.log()
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
