import React from 'react';
import { createStateLink, useStateLink } from '@hookstate/core';

const stateRef = createStateLink({ priority: 0, task: 'Untitled Task' });

const TaskView = () => {
    const state = useStateLink(stateRef);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        <span>Task name: {state.value.task} </span>
        <input value={state.value.task} onChange={e => state.nested.task.set(e.target.value)}/>
    </p>
}

const PriorityView = () => {
    const state = useStateLink(stateRef);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        <span>Task priority: {state.value.priority} </span>
        <button onClick={() => state.nested.priority.set(p => p + 1)}>Increase priority</button>
    </p>
}

const JsonDump = () => {
    const state = useStateLink(stateRef);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Current state: {JSON.stringify(state.value)}
    </p>
}

export const ExampleComponent = () => {
    return <>
        <JsonDump />
        <TaskView />
        <PriorityView />
    </>
}
