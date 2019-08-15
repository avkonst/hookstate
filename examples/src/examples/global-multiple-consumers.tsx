import React from 'react';
import { createStateLink, useStateLink } from '@hookstate/core';

const store = createStateLink({ priority: 0, task: 'Untitled Task' });

const TaskView = () => {
    const state = useStateLink(store);
    return <p>
        <span>{(new Date()).toISOString()} </span>
        <span>Task name: {state.value.task} </span>
        <input value={state.value.task} onChange={e => state.nested.task.set(e.target.value)}/>
    </p>
}

const PriorityView = () => {
    const state = useStateLink(store);
    return <p>
        <span>{(new Date()).toISOString()} </span>
        <span>Task priority: {state.value.priority} </span>
        <button onClick={() => state.nested.priority.set(p => p + 1)}>Increase priority</button>
    </p>
}

const JsonDump = () => {
    const state = useStateLink(store);
    return <p>
        <span>{(new Date()).toISOString()} </span>
        <span>Current state: {JSON.stringify(state.value)}</span>
    </p>
}

export const ExampleComponent = () => {
    return <>
        <JsonDump />
        <TaskView />
        <PriorityView />
    </>
}
