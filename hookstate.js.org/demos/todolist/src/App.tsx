import React from 'react';
import { TasksViewer } from './components/TasksViewer';
import { SettingsViewer } from './components/SettingsViewer';
import { TasksTotal } from './components/TasksTotal';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 2 }} />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 28,
        color: 'white',
      }}>
        <div style={{ minWidth: 400, maxWidth: 800, padding: 20 }}>
          <div style={{ marginBottom: 30 }}>
            This is a sample <a
              style={{ color: '#09d3ac' }}
              href="https://github.com/avkonst/hookstate"
              target="_blank"
              rel="noopener noreferrer"
            >Hookstate</a> application.
            <br/><span style={{ fontSize: '0.7em' }}>
              Source code is available on <a
                style={{ color: '#09d3ac' }}
                href="https://github.com/avkonst/hookstate/tree/master/hookstate.js.org/demos/todolist"
                target="_blank"
                rel="noopener noreferrer"
              >GitHub</a>. 
            </span>
          </div>
          <SettingsViewer />
          <TasksTotal />
          <TasksViewer />
        </div>
      </div>
      <div style={{ flexGrow: 2 }} />
    </div>
  );
}

export default App;
