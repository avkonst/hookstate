import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateLink, ValueLink } from './lib/UseStateLink';
import { link } from 'fs';

interface TaskItem {
    name: string,
    priority: number
}

const TaskView = (props: { link: ValueLink<TaskItem> }) => {
    const locallink = useStateLink(props.link);
    return <p>
        {Math.random()} {locallink.value.name}
        <input value={locallink.value.name} onChange={v => locallink.nested.name.set(v.target.value)} />
    </p>
}

const App: React.FC = () => {
    const vl = useStateLink<TaskItem[]>([]);
    return <>
        {
            vl.nested.map(i => <><TaskView link={i} /><TaskView link={i} /></>)
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
