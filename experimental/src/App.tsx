import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateLink, ValueLink, createStateLink } from './lib/UseStateLink';

const state = createStateLink<TaskItem[]>(Array.from(Array(1000).keys()).map((i) => ({
    name: 'initial',
    priority: i
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
        <input value={locallink.nested.name.value} onChange={v => locallink.nested.name.set(v.target.value)} />
        <input value={locallink.nested.name.value} onChange={v => locallink.nested.priority.set(pv => Number(pv) + 1)} />
    </p>
}

const TwiceTaskView = (props: { link: ValueLink<TaskItem> }) => {
    return <>
        <TaskView link={props.link} />
        <TaskView link={props.link} />
    </>;
}

const App: React.FC = () => {
    // const vl = useStateLink<TaskItem[]>(Array.from(Array(1000).keys()).map((i) => ({
    //     name: 'initial',
    //     priority: i
    // })));
    const vl = useStateLink(state);
    return <>
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
