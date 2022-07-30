import React from 'react';
import { useHookstate } from '@hookstate/core';
import { broadcasted } from '@hookstate/broadcasted';

export const ExampleComponent = () => {
    const state = useHookstate([{ name: 'First Task' }],
        broadcasted({
            // topic is optional,
            // if it is not defined, the extension requires and
            // uses the identifier from the @hookstate/identifiable
            topic: 'my-sync-channel-topic',
            onLeader: () => { // optional
                window.console.log('This tab is a leader now')
                // attach persistence, remote synchronization plugins,
                // or any other actions which needs to be done with a state
                // only by one tab
            }
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
