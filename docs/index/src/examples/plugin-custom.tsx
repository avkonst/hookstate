import React from 'react';
import { State, ExtensionFactory, useHookstate, SetStateAction, InferStateValueType, hookstate, extend, __State, InferStateExtensionType } from '@hookstate/core';
import { Identifiable, identifiable } from '@hookstate/identifiable';

// An example of state extension method and property,
// which we will implement in the extension below
export interface Counted {
    // It holds a counter of how many times State.set method was called,
    // We make it as a State, so we can subscribe a React component to it elsewhere.
    // However, you most frequently would not need to have properties as State,
    // returning non State results is totally fine.
    counter: State<number>,
    // This is an alternative to State.set method,
    // which allows to pass a context variable
    setWithContext<S extends InferStateValueType<this>>(
        // when Counted interface is implemented by State<S> object,
        // I type is assignable to S. The definition of I
        // in this way allows to set new value to anything
        // what is assignable to S.
        newValue: SetStateAction<S>,
        context: {
            // set to true, if set call should not be counted
            skipCounting?: boolean
        }
    ): void
}

// This is our extension implementation of Counted interface.
// We implement all callbacks for the demonstration purposes,
// but you can omit any of the callbacks you do not need to watch for.
//
// `extends Identifiable` for generic parameter `E` is optional depending on an extension you write.
// It tells the Typescript that it can be
// used only together with the Identifiable extension.
//
// By analogy, adding `S extends WhatEverType`, will ensure
// that the extension can be added only to a State<S> where
// S implements WhatEverType constraint.
// In this example we allow an extension to be added to any state value type.
export function countedExtension<S, E extends Identifiable>(): ExtensionFactory<S, E, Counted> {
    const counter = hookstate(0)
    let lastContext: { skipCounting?: boolean } | undefined;
    return () => ({
        onCreate: (rootState, _extensionMethods) => {
            // If an application uses this extension with an asynchronous state,
            // we need to check if rootState.promise or rootState.error is defined
            // before accessing the rootState.value. We skip it here for simplicity.
            console.log('onCreate called:', JSON.stringify(rootState.value))
            return {
                counter: (s) => {
                    console.log('called counter for State at path:', s.path,
                        // an example of using the other extension we required by the
                        // `E extends Identifiable` above
                        s.identifier)
                    // an example of returning data managed by an extension
                    return counter
                },
                setWithContext: (s) => (newValue, context) => {
                    console.log('called setWithContext for State at path:', s.path, s.identifier)
                    lastContext = context
                    // an example of using State functions within an extension
                    s.set(newValue)
                }
            }
        },
        // the difference with onCreate is that the onInit callback
        // is invoked when extension methods from all extensions are added to the state 
        onInit: (rootState, extensionMethods) => {
            console.log('onInit called:', JSON.stringify(rootState.value),
                // so, at this point we can use the extension methods from the dependent extensions
                rootState.identifier)

            // an extension can inspect what other extension methods are added to the state
            // and opt-in to use it if necessary. For example,
            // `localstored` extension uses `serializable` extension if it is available
            // otherwise, it fallsback to JSON.stringify.
            console.log('onInit called: all extension methods are:', Object.keys(extensionMethods))
        },
        onPremerge: (state, value) => {
            console.log('onPremerge called at path:', state.path, JSON.stringify(state.value),
                // a value to be merged into the state value
                JSON.stringify(value))
        },
        onPreset: (state, value) => {
            console.log('onPreset called at path:', state.path, JSON.stringify(state.value),
                // a value to be set into the state value
                JSON.stringify(value))
        },
        onSet: (state, actionDescriptor) => {
            console.log('onSet called at path:', state.path, JSON.stringify(state.value),
                // an additional descriptor which is used to apply more
                // fine grained rerendering optimization.
                // you can use it too to find out what properties of an object
                // have been added, deleted or updated.
                JSON.stringify(actionDescriptor))

            // now implement the counting for our `counter` extension property
            if (!lastContext?.skipCounting) {
                counter.set(p => p + 1)
            }
            lastContext = undefined // reset context after set, so it does not affect next set call
        },
        onDestroy: (rootState) => {
            console.log('onDestroy called:', JSON.stringify(rootState.value), rootState.identifier)
        }
    })
}

// Now let's have a look how the extension can be used

export const ExampleComponent = () => {
    const state = useHookstate([{ name: 'First Task' }],
        // we prepend identifiable extension
        // as it is required by our countedExtension,
        // otherwise, it will be caught by Typescript as an error
        extend(identifiable('todolist'), countedExtension()));

    return <>
        <CounterView state={state} />
        {state.map((taskState, taskIndex) =>
            <TaskEditor key={taskIndex} taskState={taskState} />
        )}
        <button onClick={() => state.merge([{ name: 'Untitled' }])}>Add task</button>
    </>
}

type Task = { name: string }

// notice we require our component to have Counted extension on the property
function TaskEditor(props: { taskState: State<Task, Counted> }) {
    return <p><input
        value={props.taskState.name.get()}
        // here is an example of usage of our custom extension method
        onChange={e => props.taskState.name.setWithContext(
            () => e.target.value, { skipCounting: false })}
    /></p>
}

// notice we require our component to have Counted extension on the property
function CounterView(props: { state: State<Task[], Counted> }) {
    // and here were are retrieving the counter from the extension
    // and subscribe the component to rerender when it is changed
    let counterState = useHookstate(props.state.counter);
    return <p>Counter value: {counterState.value}</p>
}