import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';

export const ExampleComponent = () => {
    // we use local per component state,
    // but the same result would be for the global state
    // if it was created by createStateLink
    const state = useStateLink(Array.from(Array(5000).keys()).map(i => `Field #${i + 1} value`));
    return <>
        <JsonDump state={state} />
        {state.nested.map((taskState, taskIndex) =>
            <FieldEditor key={taskIndex} fieldState={taskState} />
        )}
    </>
}

function FieldEditor(props: { fieldState: StateLink<string> }) {
    const scopedState = useStateLink(props.fieldState);
    return <p>
        Last render at: {(new Date()).toISOString()} <input
            value={scopedState.get()}
            onChange={e => scopedState.set(e.target.value)}
        />
    </p>
}

function JsonDump(props: { state: StateLink<string[]> }) {
    const state = useStateLink(props.state);
    return <p>
        Last render at: {(new Date()).toISOString()} (<b>JSON dump of the first 10 fields</b>)
        : {JSON.stringify(state.get().slice(0, 10))}
    </p>
}
