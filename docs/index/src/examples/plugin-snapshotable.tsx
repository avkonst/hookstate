import React from 'react';
import { useHookstate, State, extend, InferStateExtensionType, __State, Extension } from '@hookstate/core';
import { Clonable, clonable } from '@hookstate/clonable';
import { Comparable, comparable } from '@hookstate/comparable';
import { Initializable, initializable } from '@hookstate/initializable';
import { Snapshotable, snapshotable } from '@hookstate/snapshotable';

// define hookstate extension which is composed of a number of standard extensions
function extensions<S, E>() {
    return extend<S, E, Clonable, Comparable, Snapshotable<'second', Clonable>, Initializable>(
        clonable(
            // basic cloning, you may use lodash deep clone, instead
            // or a custom cloner, if there a state holds
            // values of custom classes
            v => (v === undefined) ? undefined : JSON.parse(JSON.stringify(v))),
        comparable(
            // basic comparison, you may use lodash comparison, instead
            // or a custom compare implementation, if there a state holds
            // values of custom classes
            (v1, v2) => {
                // String is to handle v1 === undefined
                return String(JSON.stringify(v1)).localeCompare(JSON.stringify(v2))
            }),
        // if generic type is ommited, the snapshot key can be any string
        // otherwise, only those names which are provided
        snapshotable<'second'>({
            snapshotExtensions: () => ({
                // TODO replace by new logging extension
                onCreate: (s) => {
                    console.log('snapshot created:', JSON.stringify(s.get()))
                    return {}
                },
                onSet: (s) => {
                    console.log('snapshot updated at path:', s.path, JSON.stringify(s.get({ stealth: true })))
                }
            })
        }),
        initializable((s) => {
            // optional one off initialization after a state is created
            s.snapshot() // take the initial snapshot with default key
            s.snapshot('second') // take the initial snapshot with 'second' key
        })
    )
}

// inter type defintion of extension methods
type Extended = InferStateExtensionType<typeof extensions>

export const ExampleComponent = () => {
    const state = useHookstate(
        ['First Task', 'Second Task'],
        extensions()
    )
    
    return <>
        <ModifiedStatus state={state} />
        {state.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <p><button onClick={() => state.merge(['Untitled'])}>
            Add task
        </button>
        </p>
    </>
}

function TaskEditor(props: { taskState: State<string, Extended> }) {
    const state = useHookstate(props.taskState);
    
    // subscribe to snapshot updates, so modified() result is renrender when snapshot is changed
    const defaultSnapshot = useHookstate(state.snapshot(undefined, 'lookup')).get({ noproxy: true })
    const secondSnapshot = useHookstate(state.snapshot('second', 'lookup')).get({ noproxy: true })

    return <p>
        <input
            value={state.get()}
            onChange={e => state.set(e.target.value)}
        /><br/>
        Modified (vs the default snapshot)?: {state.modified().toString()} <br/>
        Modified (vs the second snapshot)?: {state.modified('second').toString()} <br/>
        Rollback to: 
        <button disabled={defaultSnapshot === undefined} onClick={() => state.rollback()}>
            the <b>default</b> snapshot
        </button>
        <button disabled={secondSnapshot === undefined} onClick={() => state.rollback('second')}>
            the <b>second</b> snapshot
        </button><br />
        Capture as: 
        <button onClick={() => state.snapshot()}>
            the <b>default</b> snapshot
        </button>
        <button onClick={() => state.snapshot('second')}>
            the <b>second</b> snapshot
        </button>
    </p>
}

function ModifiedStatus(props: { state: State<string[], Extended> }) {
    const state = useHookstate(props.state)
    
    // subscribe to snapshot updates, so modified() result is renrender when snapshot is changed
    useHookstate(state.snapshot(undefined, 'lookup')).get({ noproxy: true })
    useHookstate(state.snapshot('second', 'lookup')).get({ noproxy: true })
    
    return <p>
        Whole state modified (vs the default snapshot)?: {state.modified().toString()} <br/>
        Whole state modified (vs the second snapshot)?: {state.modified('second').toString()} <br />
        Rollback to: 
        <button onClick={() => state.rollback()}>
            the <b>default</b> snapshot
        </button>
        <button onClick={() => state.rollback('second')}>
            the <b>second</b> snapshot
        </button><br />
        Capture as: 
        <button onClick={() => state.snapshot()}>
            the <b>default</b> snapshot
        </button>
        <button onClick={() => state.snapshot('second')}>
            the <b>second</b> snapshot
        </button>
    </p>;
}
