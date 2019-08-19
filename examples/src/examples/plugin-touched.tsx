import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched, TouchedExtensions } from '@hookstate/touched';
import { EqualsPrerender } from '@hookstate/prerender';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
        .with(Initial)  // enable the plugin, Touched depends on, otherwise compiler error
        .with(Touched); // enable the plugin
    return <>
        <ModifiedStatus state={state} />
        {state.nested.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}>
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: StateLink<Task, TouchedExtensions> }) {
    const taskState = useStateLink(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is this task touched: {taskState.extended.touched.toString()} <br/>
        <input
            value={taskState.nested.name.get()}
            onChange={e => taskState.nested.name.set(e.target.value)}
        />
    </p>
}

function ModifiedStatus(props: { state: StateLink<Task[], TouchedExtensions> }) {
    const touched = useStateLink(props.state,
        // EqualsPrerender is optional:
        // it skips rendering when touched status is not changed
        EqualsPrerender((s) => s.extended.touched));
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is whole current state touched: {touched.toString()} <br/>
    </p>
}
