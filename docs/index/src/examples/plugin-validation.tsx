import React from 'react';
import { State, useHookstate } from '@hookstate/core';
import { Validation, validation } from '@hookstate/validation';

interface Task { name: string }

export const ExampleComponent = () => {
    const state: State<Task[], Validation> = useHookstate([{ name: 'First Task' }, { name: 'Second Task' }], validation())
    
    // configure rules
    state.validate(tasks => tasks.length >= 3,
            'There should be at least 3 tasks in the list');
    state.validate(tasks => tasks.length < 4,
            'There are too many tasks',
            'warning')

    return <>
        <p>
            Is this task list valid?: <u>{state.valid().toString()}</u> <br/>
            Is this task list valid (ignoring nested errors)?: <u>
                {state.valid({ depth: 1 }).toString()}</u> <br/>
            What are the errors and warnings?: <u>{JSON.stringify(state.errors(), null, 4)}</u> <br/>
            What is the first error or warning?: <u>{JSON.stringify(state.firstError(), null, 4)}</u> <br/>
            What is the first error (ignoring warnings and nested errors)?: <u>{
                JSON.stringify(state.firstError(
                    i => i.severity === 'error', 1), null, 4)}</u> <br/>
        </p>
        {state.map((taskState, taskIndex) => {
            // attaching validation to any element in the array applies it to every
            taskState.name.validate(
                taskName => taskName.length > 0, 'Task name should not be empty')
            return <p key={taskIndex}>
                Is this task valid?: {taskState.valid().toString()} <br/>
                Is the name of the task valid?: {taskState.name.valid().toString()} <br/>
                This task validation errors and warnings: {JSON.stringify(taskState.errors())} <br/>
                <input
                    value={taskState.name.get()}
                    onChange={e => taskState.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state.merge([{ name: '' }])}>
            Add task
        </button></p>
    </>
}
