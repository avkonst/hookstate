import React from 'react';
import { useState, State, self } from '@hookstate/core';

interface Task { name: string; priority?: number }

export const ExampleComponent = () => {
    const state: State<Task[]> = useState([{ name: 'First Task' }] as Task[]);
    return <>
        {state.map((taskState: State<Task>, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <button onClick={() => state[self].merge([{ name: 'Untitled' }])}>Add task</button>
    </>
}

function TaskEditor(props: { taskState: State<Task> }) {
    const taskState = props.taskState;
    return <p><input
        value={taskState.name.get()}
        onChange={e => taskState.name.set(e.target.value)}
    /></p>
}
