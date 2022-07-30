import React from 'react';
import { useHookstate, State } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useHookstate(Array.from(Array(5000).keys()).map(i => `Field #${i + 1} value`));
    return <>
        <JsonDump state={state} />
        {state.map((taskState, taskIndex) =>
            <FieldEditor key={taskIndex} fieldState={taskState} />
        )}
    </>
}

function FieldEditor(props: { fieldState: State<string> }) {
    const scopedState = useHookstate(props.fieldState);
    return <p>
        Last render at: {(new Date()).toISOString()} <input
            value={scopedState.get()}
            onChange={e => scopedState.set(e.target.value)}
        />
    </p>
}

function JsonDump(props: { state: State<string[]> }) {
    const scopedState = useHookstate(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} (<b>JSON dump of the first 10 fields</b>)
        :<br />{JSON.stringify(scopedState.get().slice(0, 10), undefined, 4)}
    </p>
}
