import React from 'react';
import { useState, State, self } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';

export const ExampleComponent = () => {
    const state = useState(['First Task', 'Second Task'])
    state[self].attach(Initial)  // enable the plugin, Touched depends on
    state[self].attach(Touched); // enable the plugin
    return <>
        <ModifiedStatus state={state} />
        {state.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state[self].merge(['Untitled'])}>
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: State<string> }) {
    const taskState = useState(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is this task touched: {Touched(taskState).touched().toString()} <br/>
        <input
            value={taskState.get()}
            onChange={e => taskState.set(e.target.value)}
        />
    </p>
}

function ModifiedStatus(props: { state: State<string[]> }) {
    const touched = useState(props.state)[self]
    .map((s) => Touched(s).touched());
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is whole current state touched: {touched.toString()} <br/>
    </p>
}
