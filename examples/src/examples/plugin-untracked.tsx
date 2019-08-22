import React from 'react';
import { useStateLink } from '@hookstate/core';
import { Untracked } from '@hookstate/untracked';

export const ExampleComponent = () => {
    const state = useStateLink({ renderCount: 0, updateCount: 0 })
        .with(Untracked); // enable the plugin
    // this one will not trigger rerender,
    // so it is OK to call within the render
    Untracked(state.nested.renderCount).set(p => p + 1);

    return <>
        <p>Rendered: {state.get().renderCount} times<br/>
        Updated: {state.get().updateCount} times</p>
        <p>
            <button // this will cause rerendering as the entire state is set
                onClick={() => state.set(p => p)}
            >Rerender view</button>
            <button // this will not cause rerendering, but will update the state:
                onClick={() => Untracked(state.nested.updateCount).set(p => p + 1)}
            >Update counter (untracked)</button>
        </p>
    </>
}
