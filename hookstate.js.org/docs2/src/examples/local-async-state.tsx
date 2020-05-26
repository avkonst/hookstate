import React from 'react';
import { useState, self } from '@hookstate/core';

export const ExampleComponent = () => {
    const resourcePath = 'https://raw.githubusercontent.com/avkonst/hookstate/master/CNAME';
    const fetchResource = () => fetch(resourcePath)
        .then(r => r.text())
    const state = useState(fetchResource);
    
    const [loading, error, value] = state[self].map();
    
    if (loading) {
        return <p>Loading {resourcePath}</p>;
    }
    
    if (error) {
        return <p>Failed to load {resourcePath}<br />
            <code style={{ color: 'red' }}>{error.toString()}</code><br />
            <button onClick={() => state.set(fetchResource)}>Retry</button>
        </p>
    }

    return <p key="">Loaded {resourcePath}<br />
        <code style={{ color: 'green' }}>{value}</code><br />
        <button onClick={() => state.set(fetchResource)}>Reload</button>
    </p>
}
