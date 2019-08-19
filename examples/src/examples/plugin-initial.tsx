import React from 'react';
import { useStateLink, StateLink, StateMemo } from '@hookstate/core';
import { Initial, InitialExtensions } from '@hookstate/initial';

export const ExampleComponent = () => {
    const state = useStateLink(['First Task', 'Second Task'])
        .with(Initial); // enable the plugin
    return <>
        <ModifiedStatus state={state} />
        {state.nested.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.set(tasks => tasks.concat(['Untitled']))}>
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: StateLink<string, InitialExtensions> }) {
    const taskState = useStateLink(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is this task modified: {taskState.extended.modified.toString()} <br/>
        <input
            value={taskState.get()}
            onChange={e => taskState.set(e.target.value)}
        />
    </p>
}

function ModifiedStatus(props: { state: StateLink<string[], InitialExtensions> }) {
    const modified = useStateLink(props.state,
        // StateMemo is optional:
        // it skips rendering when modified status is not changed
        StateMemo((s) => s.extended.modified));
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is whole current state modified (vs the initial): {modified.toString()} <br/>
        The <b>initial</b> state: {JSON.stringify(props.state.extended.initial)}
    </p>
}
