import React from 'react';
import { createStateLink, useStateLink, StateFragment } from '@hookstate/core';

const stateRef = createStateLink({ priority: 0, task: 'Untitled Task' });

export const ExampleComponent = () => {
    const state = useStateLink(stateRef)
    return <>
        <StateFragment state={state}>{scopedstate => {
            return <p>
                Last render at: {(new Date()).toISOString()} <br/>
                <span>Current state: {JSON.stringify(scopedstate.value)}</span>
            </p>
        }}</StateFragment>
        <StateFragment state={state.nested.task}>{scopedstate => {
            return <p>
                Last render at: {(new Date()).toISOString()} <br/>
                <span>Task name: {scopedstate.value} </span>
                <input value={scopedstate.value} onChange={e => scopedstate.set(e.target.value)}/>
            </p>
        }}</StateFragment>
        <StateFragment state={state.nested.priority}>{scopedstate => {
            return <p>
                Last render at: {(new Date()).toISOString()} <br/>
                <span>Task priority: {scopedstate.value} </span>
                <button onClick={() => scopedstate.set(p => p + 1)}>Increase priority</button>
            </p>
        }}</StateFragment>
    </>
}
