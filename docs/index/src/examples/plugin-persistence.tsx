import React from 'react';
import { useState, self } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

export const ExampleComponent = () => {
    const state = useState([{ name: 'First Task' }])
    state[self].attach(Persistence('plugin-persisted-data-key'))
    return <>
        {state.map((taskState, taskIndex) => {
            return <p key={taskIndex}>
                <input
                    value={taskState.name.get()}
                    onChange={e => taskState.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state[self].merge([{ name: 'Untitled' }])}>
            Add task
        </button></p>
    </>
}
