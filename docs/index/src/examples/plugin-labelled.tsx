import React from 'react';
import { useState, State } from '@hookstate/core';
import { Labelled } from '@hookstate/labelled';

export const ExampleComponent = () => {
    const state = useState(['First Task', 'Second Task'])
    state.attach(Labelled('todo-editor'));
    return <>
        {state.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.merge(['Untitled'])}>
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
