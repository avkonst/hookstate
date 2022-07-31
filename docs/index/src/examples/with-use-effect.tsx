import React from 'react';
import { useHookstate } from '@hookstate/core';

export const ExampleComponent = () => {
    const state = useHookstate<{ field1: boolean, field2: boolean, field3?: {} }>({
        field1: false,
        field2: false,
        field3: undefined
    });
    React.useEffect(() => {
        console.log('#1 effect called')
        if (state.field1.value && state.field3.value) {
            console.log('#1 effect called: if => true')
        }
    }, [state.field1, state.field3])

    React.useEffect(() => {
        console.log('#2 effect called')
        if (state.field2.value && state.field3.value) {
            console.log('#2 effect called: if => true')
        }
    }, [state.field2, state.field3])

    let hide = { stealth: true }
    console.log(`rendered: field1: ${state.field1.get(hide)}, field2: ${state.field2.get(hide)}, field3: ${state.field3.get(hide)}`)
    
    return <>
        <p>Checkout console logs when the effect callback runs</p>
        <button onClick={() => state.field1.set(p => !p)}>Invert field1</button><br />    
        <button onClick={() => state.field2.set(p => !p)}>Invert field2</button><br />
        <button onClick={() => state.field3.set(p => p ? undefined : {})}>Invert field3</button>    
    </>
}