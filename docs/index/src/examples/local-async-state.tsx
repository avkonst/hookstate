import React from 'react';
import { useHookstate } from '@hookstate/core';

export const ExampleComponent = () => {
    const resourcePath = 'https://raw.githubusercontent.com/avkonst/hookstate/master/CNAME';
    const fetchResource = () => fetch(resourcePath)
        .then(r => r.text())
    const state = useHookstate(fetchResource);
    
    if (state.promised) {
        return <p>Loading {resourcePath}</p>;
    }
    
    if (state.error) {
        return <p>Failed to load {resourcePath}<br />
            <code style={{ color: 'red' }}>{state.error.toString()}</code><br />
            <button onClick={() => state.set(fetchResource)}>Retry</button>
        </p>
    }

    return <p key="">Loaded {resourcePath}<br />
        <code style={{ color: 'green' }}>{state.value}</code><br />
        <button onClick={() => state.set(fetchResource)}>Reload</button>
    </p>
}
