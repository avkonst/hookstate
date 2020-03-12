import React from 'react';
import './App.css';

import { useStateLink } from '@hookstate/core';

interface Friend {
  name: string;
}
const state = useStateLink({ friends: [] as Friend[] })

function App() {
  const s = useStateLink(state);
  return <p>{s.nested.friends.get().map(i => i.name).join(',')}</p>;
}

export default App;
