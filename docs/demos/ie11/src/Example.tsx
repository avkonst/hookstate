import React from 'react';
import { createState, useState, State } from '@hookstate/core';

interface Task { name: string; priority: number| undefined  }

const initialValue: Task[] = [{ name: 'First Task', priority: undefined }];
const globalState = createState(initialValue);

setTimeout(() => globalState.merge([{ name: 'Second task by timeout', priority: 1 }]),
    5000) // adds new task 5 seconds after website load

export const ExampleComponent = () => {
    const state: State<Task[]> = useState(globalState);
    return <>
        <JsonDump state={state} />
        {state.map((taskState: State<Task>, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.merge([{ name: 'Untitled', priority: undefined }])}>
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: State<Task> }) {
    // optional scoped state for performance, could use props.taskState everywhere instead
    const taskState = useState(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Task state: {JSON.stringify(taskState.get())}<br/>
        <input
            value={taskState.name.get()}
            onChange={e => taskState.name.set(e.target.value)}
        />
        <button onClick={() => taskState.priority.set(p => (p || 0) + 1)} >
            Increase priority
        </button>
    </p>
}

function JsonDump(props: { state: State<Task[]> }) {
    // optional scoped state for performance, could use props.state everywhere instead
    const state = useState(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Current state: {JSON.stringify(state.value)}
    </p>
}
