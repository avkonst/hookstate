import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';

interface Task { name: string; priority?: number }

export const ExampleComponent = () => {
    const state: StateLink<Task[]> = useStateLink([{ name: 'First Task' } as Task]);
    return <>
        <JsonDump state={state} />
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
    // optional scoped state for performance, could use props.taskState everywhere instead
    const taskState = useStateLink(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
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

function JsonDump(props: { state: StateLink<Task[]> }) {
    // optional scoped state for performance, could use props.state everywhere instead
    const state = useStateLink(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Current state: {JSON.stringify(state.value)}
    </p>
}
