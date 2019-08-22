import React from 'react';
import { useStateLink } from '@hookstate/core';
import { Validation, ValidationSeverity } from '@hookstate/validation';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
        // enable the plugin
        .with(Validation)

    // configure rules
    Validation(state).validate(tasks => tasks.length >= 3,
            'There should be at least 3 tasks in the list');
    Validation(state).validate(tasks => tasks.length < 4,
            'There are too many tasks',
            'warning')

    return <>
        <p>
            Is this task list valid?: <u>{Validation(state).valid().toString()}</u> <br/>
            Is this task list valid (ignoring nested errors)?: <u>
                {Validation(state).validShallow().toString()}</u> <br/>
            What are the errors and warnings?: <u>{JSON.stringify(Validation(state).errors())}</u> <br/>
            What is the first error or warning?: <u>{JSON.stringify(Validation(state).firstError())}</u> <br/>
            What is the first error (ignoring warnings and nested errors)?: <u>{
                JSON.stringify(Validation(state).firstError(
                    i => i.severity === 'error', 1))}</u> <br/>
        </p>
        {state.nested.map((taskState, taskIndex) => {
            // attaching validation to any element in the array applies it to every
            Validation(taskState.nested.name).validate(
                taskName => taskName.length > 0, 'Task name should not be empty')
            return <p key={taskIndex}>
                Is this task valid?: {Validation(taskState).valid().toString()} <br/>
                Is the name of the task valid?: {Validation(taskState.nested.name).valid().toString()} <br/>
                This task validation errors and warnings: {JSON.stringify(Validation(taskState).errors())} <br/>
                <input
                    value={taskState.nested.name.get()}
                    onChange={e => taskState.nested.name.set(e.target.value)}
                />
            </p>
        })}
        <p><button onClick={() => state.set(tasks => tasks.concat([{ name: '' }]))}>
            Add task
        </button></p>
    </>
}
