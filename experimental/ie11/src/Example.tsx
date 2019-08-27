import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink({ name: 'text' });

useStateLinkUnmounted(store);

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <p>
        {JSON.stringify(state.get())}
        <input value={state.nested.name.get()} onChange={e => state.nested.name.set(e.target.value)} />
    </p>
}
