import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateLink, StateLink, createStateLink, Plugin, Path, useStateWatch } from './lib/UseStateLink';

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

const TaskView = (props: { link: StateLink<TaskItem> }) => {
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

const TwiceTaskView = (props: { link: StateLink<TaskItem> }) => {
    return <>
        <TaskView link={props.link} />
        <TaskView link={props.link} />
    </>;
}

const JsonDump = (props: {link: StateLink<TaskItem[]>}) => {
    const locallink = useStateLink(props.link);
    return <p>
        {Math.random()} {JSON.stringify(locallink.value)}
    </p>;
}

const ModifiedStatus = (props: {link: StateLink<TaskItem[], { modified: () => boolean }>}) => {
    const modified = useStateWatch(props.link, (l) => {
        return l.extended.modified();
    });
    return <p>
        {Math.random()} Modified: {modified.toString()}
    </p>;
}

type ModifiedPluginExtensions = {
    modified: () => boolean;
    unmodified: () => boolean;
}

function ModifiedPlugin<S>(): Plugin<S, ModifiedPluginExtensions> {
    let initial: TaskItem[] | undefined = undefined;
    const getInitial = (path: Path) => {
        let result = initial;
        path.forEach(p => {
            result = result && result[p];
        });
        return result;
    }
    function defaultEqualityOperator<S>(a: S, b: S | undefined) {
        if (typeof b === 'object') {
            // check reference equality first for speed
            if (a === b) {
                return true;
            }
            return JSON.stringify(a) === JSON.stringify(b);
        }
        return a === b;
    }
    const modified = (v: StateLink<any, {}>, path: Path) => {
        return !defaultEqualityOperator(v.value, getInitial(path))
    }
    return {
        defines: ['modified'],
        onInit: (i) => {
            initial = JSON.parse(JSON.stringify(i)) as TaskItem[];
            return undefined;
        },
        // onSet: (p, v) => console.log('onSet', p, v),
        extensions: (l) => ({
            modified: () => modified(l, l.path),
            unmodified: () => !modified(l, l.path),
        })
    }
};

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
    const vl = useStateLink(state).with(ModifiedPlugin)

    return <>
        <ModifiedStatus link={vl} />
        <JsonDump link={vl} />
        {
            vl.$.map((i, ind) => <TwiceTaskView key={ind} link={i} />)
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
