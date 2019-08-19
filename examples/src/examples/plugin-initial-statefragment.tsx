import React from 'react';
import { useStateLink, StateMemo, StateFragment } from '@hookstate/core';
import { Initial } from '@hookstate/initial';

export const ExampleComponent = () => {
    const state = useStateLink(['First Task', 'Second Task'])
        .with(Initial); // enable the plugin
    return <>
        <StateFragment
            state={state}
            transform={StateMemo((s) => s.extended.modified)}
        >{(modified: boolean) => {
            return <p>
                Last render at: {(new Date()).toISOString()} <br/>
                Is whole current state modified (vs the initial): {modified.toString()} <br/>
                The <b>initial</b> state: {JSON.stringify(state.extended.initial)}
            </p>
        }}
        </StateFragment>
        {state.nested.map((taskState, taskIndex) =>
            <StateFragment key={taskIndex} state={taskState}>{scopedTaskState => {
                return <p>
                    Last render at: {(new Date()).toISOString()} <br/>
                    Is this task modified: {scopedTaskState.extended.modified.toString()} <br/>
                    <input
                        value={scopedTaskState.get()}
                        onChange={e => scopedTaskState.set(e.target.value)}
                    />
                </p>
            }}
            </StateFragment>
        )}
        <p><button onClick={() => state.set(tasks => tasks.concat(['New Task']))}>
            Add task
        </button></p>
    </>
}
