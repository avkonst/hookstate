import React from 'react';
import { useHookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

export const ExampleComponent = () => {
    const state = useHookstate([{ name: 'First Task' }],
        () => localstored('state-key'))

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
