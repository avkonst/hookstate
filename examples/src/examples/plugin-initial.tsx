import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';
import { Initial, InitialExtensions } from '@hookstate/initial';
import { EqualsPrerender } from '@hookstate/prerender';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
        .with(Initial); // enable the plugin
    return <>
        <ModifiedStatus state={state} />
        {state.nested.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button
            onClick={() => state.set(tasks => tasks.concat([{ name: 'Untitled' }]))}
        >
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: StateLink<Task, InitialExtensions> }) {
    const taskState = useStateLink(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is this task modified: {taskState.extended.modified.toString()} <br/>
        <input
            value={taskState.nested.name.get()}
            onChange={e => taskState.nested.name.set(e.target.value)}
        />
    </p>
}

function ModifiedStatus(props: { state: StateLink<Task[], InitialExtensions> }) {
    const modified = useStateLink(props.state,
        // EqualsPrerender is optional:
        // it skips rendering when modified status is not changed
        EqualsPrerender((s) => s.extended.modified));
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is whole current state modified (vs the initial): {modified.toString()} <br/>
        The <b>initial</b> state: {JSON.stringify(props.state.extended.initial)}
    </p>
}
