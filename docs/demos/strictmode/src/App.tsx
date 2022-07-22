import { createState, State, useHookstate } from '@hookstate/core';
import { useEffect } from 'react';
import './App.css';

const createId = () => {
  return Math.floor(Math.random() * 0xffffff).toString(16);
};

interface IItem {
  id: string;
  kind: string;
  type: string;
}

interface IAppState {
  items: Record<string, IItem>;
}

const appState = createState<IAppState>({
  items: {
    initial: {
      id: 'initial',
      kind: 'UNKNOWN',
      type: 'test',
    },
  },
});

function App() {
  const state = useHookstate(appState);

  useEffect(() => {
    console.log('Keys changed.');
  }, [state.items.keys]);

  return (
    <div>
      <div>
        <button
          onClick={() => {
            const id = createId();
            // state.items.merge({ [id]: { id, kind: 'UNKNOWN', type: 'test' } });
            state.items[id].set({ id, kind: 'UNKNOWN', type: 'test' });
          }}
        >
          Add
        </button>
      </div>
      <div>
        {state.items.keys.map((itemId) => (
          <Item key={itemId} state={state.items[itemId]} />
        ))}
      </div>
    </div>
  );
}

function Item(props: { state: State<IItem> }) {
  const state = useHookstate(props.state);

  return (
    <div
      style={{ padding: 10, backgroundColor: '#' + Math.floor(Math.random() * 0xffffff).toString(16) }}
      onClick={() => {
        state.type.set(Math.random().toString(16));
      }}
    >
      {JSON.stringify(state.value)}
    </div>
  );
}

export default App;
