import React from 'react';
import { useTasksState } from './TasksState';
import { useSettingsState } from './SettingsState';

export function TasksTotal() {
    // Use both global stores in the same component.
    // Note: in fact, it could be even one state object
    // with functions accessing different nested segments of the state data.
    // It would perform equally well.
    const tasksState = useTasksState();
    const settingsState = useSettingsState();
    
    // This is the trick to obtain different color on every run of this function
    var colors = ['#ff0000', '#00ff00', '#0000ff'];
    const color = React.useRef(0)
    color.current += 1
    var nextColor = colors[color.current % colors.length];
    
    return <div style={{
        display: 'flex',
        justifyContent: 'space-evenly',
        marginBottom: 30
    }}>
        {settingsState.isHighlightUpdateEnabled &&
            <div
                style={{
                    width: 10,
                    marginRight: 15,
                    backgroundColor: nextColor
                }}
            />
        }
        {tasksState.promised ?
            <></> :
            <div key="" style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                flexGrow: 2
            }}>
                <div>Total tasks: {tasksState.length}</div>
                <div>Done: {tasksState.filter(i => i.done.value).length}</div>
                <div>Remaining: {tasksState.filter(i => !i.done.value).length}</div>
            </div>
        }
    </div>
}