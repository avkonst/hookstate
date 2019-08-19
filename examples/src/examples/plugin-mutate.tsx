import React from 'react';
import { useStateLink } from '@hookstate/core';
import { Mutate } from '@hookstate/mutate';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
    return <>
        {state.nested.map((taskState, taskIndex) => {
            return <p key={taskIndex}>
                <input
                    value={taskState.nested.name.get()}
                    onChange={e => taskState.nested.name.set(e.target.value)}
                />
                <button onClick={() => Mutate(state).remove(taskIndex)}>Remove task</button>
                <button
                    disabled={taskIndex === 0}
                    onClick={() => Mutate(state).swap(taskIndex - 1, taskIndex)}
                >Move up</button>
                <button
                    disabled={taskIndex === state.nested.length - 1}
                    onClick={() => Mutate(state).swap(taskIndex + 1, taskIndex)}
                >Move down</button>
            </p>
        })}
        <p><button onClick={() => Mutate(state).push({ name: 'Untitled' })}>
            Add task
        </button></p>
    </>
}
