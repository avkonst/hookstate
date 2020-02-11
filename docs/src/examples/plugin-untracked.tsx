import React from 'react';
import { useStateLink } from '@hookstate/core';
import { Untracked } from '@hookstate/untracked';

export const ExampleComponent = () => {
    const state = useStateLink({ renders: 0, counter1: 0, counter2: 0 })
        .with(Untracked); // enable the plugin

    // this one will not trigger rerender,
    // so it is OK to call within the render
    Untracked(state.nested.renders).set(p => p + 1);

    return <>
        <p>
            {/* the following is tracked usage */}
            Rendered: {state.nested.renders.get()} times<br/>
            {/* the following is untracked usage */}
            Counter 1: {Untracked(state.nested.counter1).get()}<br/>
            {/* the following is tracked usage */}
            Counter 2: {state.nested.counter2.get()}
        </p>
        <p>
            <button
                // this will cause rerendering,
                // because renderCount and counter2 are used and tracked
                // and this update is tracked
                onClick={() => state.set(p => p)}
            >Force entire state update</button>
            <button
                // this will not cause rerendering, but will update the state:
                onClick={() => state.nested.counter1.set(p => p + 1)}
            >Update counter 1 (untracked get)</button>
            <button
                // this will not cause rerendering, but will update the state:
                onClick={() => Untracked(state.nested.counter2).set(p => p + 1)}
            >Update counter 2 (untracked set)</button>
        </p>
    </>
}
