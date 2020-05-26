import React from 'react';
import { useSettingsState } from './SettingsState';

export function SettingsViewer() {
    const settingsState = useSettingsState();

    return <div style={{
        border: 'solid',
        borderWidth: 1,
        borderColor: '#09d3ac',
        marginBottom: 30,
        fontSize: '0.8em',
        display: 'flex'
    }}>
        <div style={{ flexGrow: 2, display: 'flex' }}>
            <div>
                <input
                    style={{ transform: 'scale(1.6)', marginLeft: 20 }}
                    type="checkbox"
                    checked={settingsState.isEditableInline}
                    onChange={() => settingsState.toogleEditableInline()}
                />
            </div>
            <div style={{ paddingLeft: 10, paddingBottom: 10 }}>
                edit inline
            </div>
        </div>
        <div style={{ flexGrow: 2, display: 'flex' }}>
            <div>
                <input
                    style={{ transform: 'scale(1.6)', marginLeft: 20 }}
                    type="checkbox"
                    checked={settingsState.isScopedUpdateEnabled}
                    onChange={() => settingsState.toogleScopedUpdate()}
                />
            </div>
            <div style={{ paddingLeft: 10, paddingBottom: 10}}>
                use scoped state
            </div>
        </div>
        <div style={{ flexGrow: 2, display: 'flex'}}>
            <div>
                <input
                    style={{ transform: 'scale(1.6)', marginLeft: 20 }}
                    type="checkbox"
                    checked={settingsState.isHighlightUpdateEnabled}
                    onChange={() => settingsState.toogleHighlightUpdate()}
                />
            </div>
            <div style={{ paddingLeft: 10, paddingBottom: 10, paddingRight: 10 }}>
                highlight updates
            </div>
        </div>
    </div>
}