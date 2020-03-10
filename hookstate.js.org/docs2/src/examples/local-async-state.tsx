import React from 'react';
import { useStateLink } from '@hookstate/core';

export const ExampleComponent = () => {
    const fetchResource = () => fetch('https://hookstate.js.org/manifest.json')
        .then(r => r.text())
    const state = useStateLink(fetchResource);

    if (state.promised) {
        return <p>Loading https://hookstate.js.org/manifest.json</p>
    }
    if (state.error) {
        return <p>Failed to load https://hookstate.js.org/manifest.json<br />
            <code>{state.error.toString()}</code><br />
            <button onClick={() => state.set(fetchResource)}>Retry</button>
        </p>
    }
    return <p>Loaded https://hookstate.js.org/manifest.json<br />
        <code>{state.value}</code><br />
        <button onClick={() => state.set(fetchResource)}>Reload</button>
    </p>
}
