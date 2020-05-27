import React from 'react';
import { useState, State, self } from '@hookstate/core';
import { Labelled } from '@hookstate/labelled';

export const ExampleComponent = () => {
    const state = useState(['First Task', 'Second Task'])
    state[self].attach(Labelled('todo-editor')); // enable the plugin
    return <>
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
        State label: {Labelled(taskState)} <br/>
        <input
            value={taskState.get()}
            onChange={e => taskState.set(e.target.value)}
        />
    </p>
}
