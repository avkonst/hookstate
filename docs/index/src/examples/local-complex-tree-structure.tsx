import React from 'react';
import { useHookstate, State } from '@hookstate/core';

interface Node { name: string; children?: Node[] }

export const ExampleComponent = () => {
    const state = useHookstate<Node[] | undefined>([
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

function NodeNameEditor(props: { nameState: State<string> }) {
    // scoped state is optional for performance
    // could have used props.nameState everywhere instead
    const state = useHookstate(props.nameState);
    return <>
        <p>
            <input
                value={state.get()}
                onChange={e => state.set(e.target.value)}
            /> Last render at: {(new Date()).toISOString()}
        </p>
    </>
}

function NodeListEditor(props: { nodes: State<Node[] | undefined> }) {
    // scoped state is optional for performance
    // could have used props.nodes everywhere instead
    const state = useHookstate(props.nodes);
    return <div style={{ paddingLeft: 20 }}>
        {state.ornull && state.ornull.map((nodeState: State<Node>, i) =>
            <div key={i}>
                <NodeNameEditor nameState={nodeState.name} />
                <NodeListEditor nodes={nodeState.children} />
            </div>
        )}
        <p><button onClick={() => state.set(nodes => (nodes || []).concat([{ name: 'Untitled' }]))}>
            Add Node
        </button></p>
    </div>
}

function JsonDump(props: { state: State<Node[] | undefined> }) {
    // scoped state is optional for performance
    // could have used props.state everywhere instead
    const state = useHookstate(props.state);
    return <p>
        Current state: {JSON.stringify(state.value)} <br/>
        Last render at: {(new Date()).toISOString()} 
    </p>
}
