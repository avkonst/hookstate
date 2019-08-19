import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted, StateLink } from '@hookstate/core';

interface Task { name: string; priority?: number }

const initialValue: Task[] = [{ name: 'First Task' }];
const stateRef = createStateLink(initialValue);

setTimeout(() => useStateLinkUnmounted(stateRef)
    .set(tasks => tasks.concat([{ name: 'Second task by timeout', priority: 1 }]))
, 5000) // adds new task 5 seconds after website load

export const ExampleComponent = () => {
    const state: StateLink<Task[]> = useStateLink(stateRef);
    return <>
        {state.nested.map((taskState: StateLink<Task>, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button
            onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}
        >
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: StateLink<Task> }) {
    // optional for rerender optimization, could use props.taskState everywhere instead
    const taskState = useStateLink(props.taskState);
    return <p>
        Render time: {(new Date()).toISOString()} <br/>
        Task state: {JSON.stringify(taskState.get())}<br/>
        <input
            value={taskState.nested.name.get()}
            onChange={e => taskState.nested.name.set(e.target.value)}
        />
        <button onClick={() => taskState.nested.priority.set(p => (p || 0) + 1)} >
            Increase priority
        </button>
    </p>
}
