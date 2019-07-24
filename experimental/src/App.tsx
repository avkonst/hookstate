import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateLink, ValueLink } from './lib/UseStateLink';

interface TaskItem {
    name: string,
    priority?: number
}

const TaskView = (props: { link: ValueLink<TaskItem> }) => {
    const locallink = useStateLink(props.link);
    const a = locallink.nested.priority;
    return <p>
        {Math.random()} {locallink.nested.name.value}
        <input value={locallink.value.name} onChange={v => locallink.nested.name.set(v.target.value)} />
    </p>
}

const TwiceTaskView = (props: { link: ValueLink<TaskItem> }) => {
    return <><TaskView link={props.link} /><TaskView link={props.link} /></>;
}

const App: React.FC = () => {
    const vl = useStateLink<TaskItem[]>([{
        name: 'initial',
        priority: 0
    }]);
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
