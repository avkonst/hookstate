import React from 'react';
import { useState, createState } from '@hookstate/core';
import { Broadcasted } from '@hookstate/broadcasted';

const gstate = createState([{ name: 'First Task' }])
gstate.attach(Broadcasted('my-sync-channel-topic'))

export const ExampleComponent = () => {
    const state = useState(gstate)
    // state.attach(Broadcasted('my-sync-channel-topic'))
    return <>
        {state.map((taskState, taskIndex) => {
            return <p key={taskIndex}>
                <input
                    value={taskState.name.get()}
                    onChange={e => taskState.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state.merge([{ name: 'Untitled' }])}>
            Add task
        </button></p>
    </>
}
