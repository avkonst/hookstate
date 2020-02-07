import React from 'react';
import { useStateLink, StateLink } from '@hookstate/core';

interface Node { name: string; children?: Node[] }

export const ExampleComponent = () => {
    const state = useStateLink<Node[] | undefined>([
        {
            name: 'Node 1',
            children: [
                { name: 'Node 1.1' },
                { name: 'Node 1.2' }
            ]
        },
        {
            name: 'Node 2'
        }
    ]);
    return <>
        <JsonDump state={state} />
        <NodeListEditor nodes={state} />
    </>
}

function NodeNameEditor(props: { nameState: StateLink<string> }) {
    // useStateLink is optinal for performance
    // could use props.nameState everywhere instead
    const state = useStateLink(props.nameState);
    return <>
        <p>
            <input
                value={state.get()}
                onChange={e => state.set(e.target.value)}
            /> Last render at: {(new Date()).toISOString()}
        </p>
    </>
}

function NodeListEditor(props: { nodes: StateLink<Node[] | undefined> }) {
    // useStateLink is optinal for performance
    // could use props.nodes everywhere instead
    const state = useStateLink(props.nodes);
    return <div style={{ paddingLeft: 20 }}>
        {state.nested && state.nested.map((nodeState: StateLink<Node>) =>
            <>
                <NodeNameEditor nameState={nodeState.nested.name} />
                <NodeListEditor nodes={nodeState.nested.children} />
            </>
        )}
        <p><button onClick={() => state.set(nodes => (nodes || []).concat([{ name: 'Untitled' }]))}>
            Add Node
        </button></p>
    </div>
}

function JsonDump(props: { state: StateLink<Node[] | undefined> }) {
    // useStateLink is optinal for performance
    // could use props.state everywhere instead
    const state = useStateLink(props.state);
    return <p>
        Current state: {JSON.stringify(state.value)} <br/>
        Last render at: {(new Date()).toISOString()} 
    </p>
}
