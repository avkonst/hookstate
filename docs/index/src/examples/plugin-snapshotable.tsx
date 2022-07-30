import React from 'react';
import { useHookstate, State, extend, StateExtension, __State, Extension } from '@hookstate/core';
import { clonable } from '@hookstate/clonable';
import { comparable } from '@hookstate/comparable';
import { initializable } from '@hookstate/initializable';
import { snapshotable } from '@hookstate/snapshotable';

// define hookstate extension which is composed of a number of other extensions
const extensions = extend(
    clonable(
        // basic cloning, you may use lodash deep clone, instead
        // or a custom cloner, if there a state holds
        // values of custom classes
        v => JSON.parse(JSON.stringify(v))),
    comparable(
        // basic comparison, you may use lodash comparison, instead
        // or a custom compare implementation, if there a state holds
        // values of custom classes
        (v1, v2) => JSON.stringify(v1).localeCompare(JSON.stringify(v2))),
    // if generic type is ommited, the snapshot key can be any string
    // otherwise, only those names which are provided
    snapshotable<'latest'>(),
    initializable((s) => {
        // optional one off initialization after a state is created
        s.snapshot('latest') // take the initial snapshot
    })
)

// inter type defintion of extension methods
type Extended = StateExtension<typeof extensions>

export const ExampleComponent = () => {
    const state = useHookstate(
        ['First Task', 'Second Task'],
        () => extensions()
    )
    return <>
        <ModifiedStatus state={state} />
        {state.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.merge(['Untitled'])}>
            Add task
        </button></p>
    </>
}

function TaskEditor(props: { taskState: State<string, Extended> }) {
    const taskState = useHookstate(props.taskState);
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is this task modified: {taskState.modified().toString()} <br/>
        <input
            value={taskState.get()}
            onChange={e => taskState.set(e.target.value)}
        />
    </p>
}

function ModifiedStatus(props: { state: State<string[], Extended> }) {
    const modified = useHookstate(props.state).modified()
        
    return <p>
        Last render at: {(new Date()).toISOString()} <br/>
        Is whole current state modified (vs the initial): {modified.toString()} <br/>
        The <b>initial</b> state: {JSON.stringify(props.state.get())}
    </p>;
}
