import React from 'react';

import {
    createStateLink,
    useStateLink,
    useStateLinkUnmounted,
    StateLink,
    Plugin,
    PluginTypeMarker
} from '@hookstate/core';
import { Initial, InitialExtensions } from '@hookstate/initial';
import { Logger } from '@hookstate/logger';
import { Touched, TouchedExtensions } from '@hookstate/touched';
import { Persistence } from '@hookstate/persistence';
import { Mutate } from '@hookstate/mutate';
import { Validation, ValidationForEach, ValidationSeverity, ValidationExtensions } from '@hookstate/validation';

import isEqual from 'lodash.isequal';
import { EqualsPrerender } from '@hookstate/prerender';

JSON.stringify({ x: 5, y: 6, toJSON() { return this.x + this.y; } });

const state = createStateLink<TaskItem[]>(Array.from(Array(2).keys()).map((i) => ({
    name: 'initial',
    priority: i,
})))//.with(Persistence('somekey2'));

setInterval(() => {
    // useStateLinkUnmounted(state).nested[0].nested.priority.set(p => (p || 0) + 1)
}, 10);

interface TaskItem {
    name: string,
    priority?: number
}

const TaskView = (props: { link: StateLink<TaskItem> }) => {
    const pl = props.link
        .with(Validation(
            v => v.name.length < 5 ? (v.priority === undefined || v.priority < 3) : true,
            'Task with short name should not have high priority.',
            ValidationSeverity.WARNING))
    const locallink = useStateLink(pl);
    locallink.nested.name.with(Validation(v => v.length !== 0, 'Task name should not be empty'));

    return <p>
        {new Date().toISOString()} <span />
        Modified: {locallink.with(Initial).with(Touched).nested.name.extended.modified.toString()} <span />
        Touched: {locallink.with(Initial).with(Touched).nested.name.extended.touched.toString()} <span />
        Valid per task: {JSON.stringify(locallink.extended.errors())} <span />
        Valid per name: {JSON.stringify(locallink.nested.name.extended.errors())} <span />
        Valid per priority: {JSON.stringify(locallink.nested.priority.extended.errors())} <span />
        <input value={locallink.value.name} onChange={v => locallink.nested.name.set(v.target.value)} />
        <button onClick={v => locallink.nested.priority.set(pv => Number(pv) + 1)} children={'increment'} />
        {/* <input value={'increment priority'} onChange={v => locallink.nested.priority.set(pv => Number(pv) + 1)} /> */}
    </p>
}

const TwiceTaskView = (props: { link: StateLink<TaskItem>, ind: number }) => {
    return <>
        Task number {props.ind} two times:
        <TaskView link={props.link} />
        <TaskView link={props.link} />
    </>;
}

const JsonDump = (props: {link: StateLink<TaskItem[]>}) => {
    const locallink = useStateLink(props.link);
    return <p>
        {new Date().toISOString()} JSON dump for the first 2: {JSON.stringify(locallink.value.slice(0, 2))}
    </p>;
}

const ModifiedStatus = (props: {link: StateLink<TaskItem[], InitialExtensions>}) => {
    const modified = useStateLink(props.link, EqualsPrerender((l) => l.extended.modified));
    return <p>
        {new Date().toISOString()} Modified: {modified.toString()}
    </p>;
}

const TouchedStatus = (props: {link: StateLink<TaskItem[], InitialExtensions & TouchedExtensions>}) => {
    const touched = useStateLink(props.link, EqualsPrerender((l) => l.extended.touched));
    return <p>
        {new Date().toISOString()} Touched: {touched.toString()}
    </p>;
}

const ValidStatus = (props: {link: StateLink<TaskItem[], ValidationExtensions>}) => {
    const errors = useStateLink(props.link, EqualsPrerender(l => l.extended.errors()));
    return <p>
        {new Date().toISOString()} Valid: {JSON.stringify(errors)}
    </p>;
}

const s = Symbol('Dup');
export function Dup<S, E extends {}>(unused: PluginTypeMarker<S, E>): Plugin<E, { log: () => void }> {
    return {
        id: s,
        instanceFactory: () => ({
            extensions: ['log'],
            extensionsFactory: () => ({
                log: () => console.log('')
            })
        })
    }
}

const App = () => {
    const [value, setValue] = React.useState('');
    // const vl = useStateLink<TaskItem[]>(Array.from(Array(2).keys()).map((i) => ({
    //     name: 'initial',
    //     priority: i
    // })))
    const vl = useStateLink(state
        // .with(Persistence('somekey2'))
        )
        .with(Initial)
        .with(Touched)
        // .with(Dup)
        .with(Logger)
        .with(Validation(v => v.length < 4, 'It should not be more than 3 tasks'))
        .with(ValidationForEach(v => v.name.length < 2,
            'Each task should have short name',
            ValidationSeverity.ERROR))

    return <>
        <p>{new Date().toISOString()} Other App local
        state: <input value={value} onChange={e => setValue(e.target.value)} /></p>
        <ModifiedStatus link={vl} />
        <TouchedStatus link={vl} />
        {/* {value} */}
        <JsonDump link={vl} />
        {
            vl.nested.map((i, ind) => <TwiceTaskView key={ind} ind={ind} link={i} />)
        }
        <button
            onClick={() => Mutate(vl).push({
                name: 'new task',
                priority: 1
            })}
        >
            Add task
        </button>
        <ValidStatus link={vl} />
    </>;
}

export default App;
