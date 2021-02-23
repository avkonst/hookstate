import React from 'react';
import { useState, createState } from '@hookstate/core';
import { Broadcasted } from '@hookstate/broadcasted';

export const ExampleComponent = () => {
    const state = useState([{ name: 'First Task' }])
    state.attach(Broadcasted('my-sync-channel-topic', () => {
        window.console.log('This tab is a leader now')
        // attach persistence, remote synchronization plugins,
        // or any other actions which needs to be done with a state
        // only by one tab
    }))
    
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
