import React from 'react';
import { useStateLink } from '@hookstate/core';
import { Validation, ValidationSeverity } from '@hookstate/validation';

interface Task { name: string }

export const ExampleComponent = () => {
    const state = useStateLink([{ name: 'First Task' }, { name: 'Second Task' }] as Task[])
        // enable the plugin
        .with(Validation())
        // or can enable providing the rule directly for the root object in the state
        .with(Validation(tasks => tasks.length >= 3,
            'There should be at least 3 tasks in the list'))
        .with(Validation(tasks => tasks.length < 4,
            'There are too many tasks',
            ValidationSeverity.WARNING))

    return <>
        <p>
            Is this task list valid?: <u>{state.extended.valid.toString()}</u> <br/>
            Is this task list valid (ignoring nested errors)?: <u>{state.extended.validShallow.toString()}</u> <br/>
            What are the errors and warnings?: <u>{JSON.stringify(state.extended.errors())}</u> <br/>
            What is the first error or warning?: <u>{JSON.stringify(state.extended.firstError())}</u> <br/>
            What is the first error (ignoring warnings and nested errors)?: <u>{
                JSON.stringify(state.extended.firstError(
                    i => i.severity === ValidationSeverity.ERROR, 1))}</u> <br/>
        </p>
        {state.nested.map((taskState, taskIndex) => {
            // attaching validation to any element in the array applies it to every
            taskState.nested.name
                .with(Validation(taskName => taskName.length > 0, 'Task name should not be empty'))
            return <p key={taskIndex}>
                Is this task valid?: {taskState.extended.valid.toString()} <br/>
                Is the name of the task valid?: {taskState.nested.name.extended.valid.toString()} <br/>
                This task validation errors and warnings: {JSON.stringify(taskState.extended.errors())} <br/>
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
