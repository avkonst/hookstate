import React from "react";
import { useHookstate, hookstate } from "@hookstate/core";

export function App() {
  const component = useHookstate(true);
  const count = useHookstate(instanceCounter);
  return (
    <div className="App">
      <button onClick={() => component.set((c) => !c)}>Click</button>
      {component.get() ? <h1>Component 1</h1> : <Component />}
      Number of Hookstate instances for `state`: {count.get()}
    </div>
  );
}

function Component() {
  const state = useHookstate(2, countInstanceExtension);
  
  return <h1>Component {state.get()}</h1>;
}

const countInstanceExtension = () => ({
  onCreate: () => {
    // setTimeout is to avoid setting counter while rendering.
    setTimeout(() => instanceCounter.set((x) => x + 1));
    return {}
  },
  onDestroy: () => {
    setTimeout(() => instanceCounter.set((x) => x - 1));
  },
});

let instanceCounter = hookstate(0);
