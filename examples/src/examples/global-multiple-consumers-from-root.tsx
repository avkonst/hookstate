import React from 'react';
import { createStateLink, useStateLink, StateLink } from '@hookstate/core';

const stateRef = createStateLink({ priority: 0, task: 'Untitled Task' });

const TaskView = (props: { state: StateLink<string> }) => {
    const state = useStateLink(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        <span>Task name: {state.value} </span>
        <input value={state.value} onChange={e => state.set(e.target.value)}/>
    </p>
}

const PriorityView = (props: { state: StateLink<number> }) => {
    const state = useStateLink(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        <span>Task priority: {state.value} </span>
        <button onClick={() => state.set(p => p + 1)}>Increase priority</button>
    </p>
}

const JsonDump = (props: { state: StateLink<{ priority: number, task: string }> }) => {
    const state = useStateLink(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        <span>Current state: {JSON.stringify(state.value)}</span>
    </p>
}

export const ExampleComponent = () => {
    const state = useStateLink(stateRef)
    return <>
        <JsonDump state={state} />
        <TaskView state={state.nested.task} />
        <PriorityView state={state.nested.priority} />
    </>
}
