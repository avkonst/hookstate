import React from 'react';
import './App.css';

import { useStateLink, createStateLink, StateRef } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

interface Friend {
  name: string;
}
const state = createStateLink({ friends: [] as Friend[] })

export const achivementsState: StateRef<Friend[]> =
    createStateLink<Friend[]>([]).with(Persistence('achievements-state-dev'));

function App() {
  const s = useStateLink(state);
  return <p>{s.nested.friends.get().map(i => i.name).join(',')}</p>;
}

export default App;
