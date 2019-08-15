import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';

const TaskView = (props: { state: StateLink<string> }) => {
    const state = useStateLink(props.state);
    return <div>
        <span>{(new Date()).toISOString()} </span>
        <span>Task name: {state.value} </span>
        <input value={state.value} onChange={e => state.set(e.target.value)}/>
    </div>
}

const PriorityView = (props: { state: StateLink<number> }) => {
    const state = useStateLink(props.state);
    return <div>
        <span>{(new Date()).toISOString()} </span>
        <span>Task priority: {state.value} </span>
        <button onClick={() => state.set(p => p + 1)}>Increase priority</button>
    </div>
}

const JsonDump = (props: { state: StateLink<{ priority: number, task: string }> }) => {
    const state = useStateLink(props.state);
    return <div>
        <span>{(new Date()).toISOString()} </span>
        <span>Current state: {JSON.stringify(state.value)}</span>
    </div>
}

export const ExampleComponent = () => {
    const state = useStateLink({ priority: 0, task: 'Untitled Task' })
    return <>
        <JsonDump state={state} />
        <TaskView state={state.nested.task} />
        <PriorityView state={state.nested.priority} />
    </>
}
