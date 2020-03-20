import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';

interface Task { name: string; priority?: number }

export const ExampleComponent = () => {
    const state: StateLink<Task[]> = useStateLink([{ name: 'First Task' }] as Task[]);
    return <>
        {state.nested.map((taskState: StateLink<Task>, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <button onClick={() => state.merge([{ name: 'Untitled' }])}>Add task</button>
    </>
}

function TaskEditor(props: { taskState: StateLink<Task> }) {
    const taskState = props.taskState;
    return <p><input
        value={taskState.nested.name.get()}
        onChange={e => taskState.nested.name.set(e.target.value)}
    /></p>
}
