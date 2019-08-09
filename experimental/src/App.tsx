import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateLink, ValueLink, createStateLink, Plugin } from './lib/UseStateLink';

JSON.stringify({ x: 5, y: 6, toJSON() { return this.x + this.y; } });

const state = createStateLink<TaskItem[]>(Array.from(Array(2).keys()).map((i) => ({
    name: 'initial',
    priority: i,
    toJSON(): any { return this.name + this.priority; }
})));

interface TaskItem {
    name: string,
    priority?: number
}

const TaskView = (props: { link: ValueLink<TaskItem> }) => {
    // const locallink = props.link;
    const locallink = useStateLink(props.link);
    // const priorityLink = locallink.nested.priority;
    // const nameLink = locallink.nested.name;
    // return <p>
    //     {Math.random()} {nameLink.value}
    //     <input value={nameLink.value} onChange={v => nameLink.set(v.target.value)} />
    //     <input value={nameLink.value} onChange={v => priorityLink.set(pv => Number(pv) + 1)} />
    // </p>

    return <p>
        {Math.random()}
        {/* {locallink.nested.name.value} */}
        <input value={locallink.value.name} onChange={v => locallink.nested.name.set(v.target.value)} />
        <input value={locallink.value.name} onChange={v => locallink.nested.priority.set(pv => Number(pv) + 1)} />
        {/* <input value={'increment priority'} onChange={v => locallink.nested.priority.set(pv => Number(pv) + 1)} /> */}
    </p>
}

const TwiceTaskView = (props: { link: ValueLink<TaskItem> }) => {
    return <>
        <TaskView link={props.link} />
        <TaskView link={props.link} />
    </>;
}

const JsonDump = (props: {link: ValueLink<TaskItem[]>}) => {
    const locallink = useStateLink(props.link);
    return <>
        {JSON.stringify(locallink.value)}
    </>;
}

const App: React.FC = () => {
    // const vl = useStateLink<TaskItem[], { myext: () => void }>(Array.from(Array(2).keys()).map((i) => ({
    //     name: 'initial',
    //     priority: i
    // }))).with({
    //     onInit: () => ['myext'],
    //     ext: (s, v, p) => ({
    //         myext: () => {
    //             console.log('myext called', s, v, p);
    //         }
    //     })
    // });
    const vl = useStateLink(state).with({
        onInit: () => ['myext'],
        onSet: (s, v, p) => console.log('onSet', s, v, p),
        ext: (s, v, p) => ({
            myext: () => {
                console.log('myext called', s, v, p);
            }
        })
    })

    vl.extended.myext();

    return <>
        <JsonDump link={vl} />
        {
            vl.nested.map((i, ind) => <TwiceTaskView key={ind} link={i} />)
        }
        <button
            onClick={() => vl.inferred.push({
                name: 'new task',
                priority: 1
            })}
        >
            Add task
        </button>
    </>;
}

export default App;
