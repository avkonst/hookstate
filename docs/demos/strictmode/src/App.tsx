import React, { useEffect } from 'react';
import { useHookstate, State } from '@hookstate/core';

const TableCell = (props: { cell: State<number> }) => {
  const scopedState = useHookstate(props.cell);
  return <>{scopedState.value.toString(16)}</>;
}

type StatsExtension = {
  stats: {
    totalSum: number;
    totalCalls: number;
    startTime: number;
  };
}

const MatrixView = (props: {
  totalRows: number,
  totalColumns: number,
  interval: number,
  callsPerInterval: number
}) => {
  const matrix = useHookstate(
    () => Array.from(Array(props.totalRows).keys())
      .map(i => Array.from(Array(props.totalColumns).keys()).map(j => 0)),
    () => {
      const stats = {
        totalSum: 0,
        totalCalls: 0,
        startTime: (new Date()).getTime()
      };

      let previous = 0;
      return {
        onCreate: () => ({
          stats: () => stats
        }),
        onPreset: (s) => {
          if (s.path.length === 2) {
            previous = s.get({ stealth: true });
          }
        },
        onSet: (s) => {
          if (s.path.length === 2) {
            // new value can be only number in this example
            // and path can contain only 2 elements: row and column indexes
            stats.totalSum += s.value - previous;
          }
          stats.totalCalls += 1;
        }
      }
    }
  );
  // schedule interval updates
  useEffect(() => {
    const t = setInterval(() => {
      function randomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      }
      for (let i = 0; i < props.callsPerInterval; i += 1) {
        matrix
        [randomInt(0, props.totalRows)]
        [randomInt(0, props.totalColumns)]
          .set(p => p + randomInt(0, 5))
      }
    }, props.interval)
    return () => clearInterval(t);
  }, [props.interval, props.callsPerInterval, props.totalRows, props.totalColumns])

  return <div style={{ overflow: 'scroll' }}>
    <PerformanceMeter matrix={matrix} />
    <table
      style={{
        border: 'solid',
        borderWidth: 1,
        borderColor: 'grey',
        color: '#00FF00',
        backgroundColor: 'black'
      }}
    >
      <tbody>
        {matrix.map((rowState, rowIndex: number) =>
          <tr key={rowIndex}>
            {rowState.map((cellState, columnIndex) =>
              <td key={columnIndex}>
                <TableCell cell={cellState} />
              </td>
            )}
          </tr>
        )}
      </tbody>
    </table>
  </div>
}

export const ExampleComponent = () => {
  const settings = useHookstate({
    rows: 50,
    columns: 50,
    rate: 50,
    timer: 10
  })
  return <>
    <div>
      <p><span>Total rows: {settings.rows.value} </span>
        <button onClick={() =>
          settings.rows.set(p => (p - 10) || 10)}>-10</button>
        <button onClick={() =>
          settings.rows.set(p => p + 10)}>+10</button></p>
      <p><span>Total columns: {settings.columns.value} </span>
        <button onClick={() =>
          settings.columns.set(p => (p - 10) || 10)}>-10</button>
        <button onClick={() =>
          settings.columns.set(p => p + 10)}>+10</button></p>
      <p>Total cells: {settings.columns.value * settings.rows.value}</p>
      <p><span>Cells to update per timer interval: {settings.rate.value} </span>
        <button onClick={() =>
          settings.rate.set(p => (p - 1) || 1)}>-1</button>
        <button onClick={() =>
          settings.rate.set(p => p + 1)}>+1</button>
        <button onClick={() =>
          settings.rate.set(p => p > 10 ? (p - 10) : 1)}>-10</button>
        <button onClick={() =>
          settings.rate.set(p => p + 10)}>+10</button>
      </p>
      <p><span>Timer interval in ms: {settings.timer.value} </span>
        <button onClick={() =>
          settings.timer.set(p => p > 1 ? (p - 1) : 1)}>-1</button>
        <button onClick={() =>
          settings.timer.set(p => p + 1)}>+1</button>
        <button onClick={() =>
          settings.timer.set(p => p > 10 ? (p - 10) : 1)}>-10</button>
        <button onClick={() =>
          settings.timer.set(p => p + 10)}>+10</button>
      </p>
    </div>
    <MatrixView
      key={Math.random()}
      totalRows={settings.rows.value}
      totalColumns={settings.columns.value}
      interval={settings.timer.value}
      callsPerInterval={settings.rate.value}
    />
  </>;
}

function PerformanceMeter(props: { matrix: State<number[][], StatsExtension> }) {
  let stats = props.matrix.stats;
  const elapsedMs = () => (new Date()).getTime() - stats.startTime;
  const elapsed = () => Math.floor(elapsedMs() / 1000);
  const rate = Math.floor(stats.totalCalls / elapsedMs() * 1000);

  // this makes rerendering this component every 200ms
  let forceRerender = useHookstate(1);
  useEffect(() => {
    const interval = setInterval(() => {
      forceRerender.set(p => p + 1)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return <>
    <p><span>Elapsed: {elapsed()}s</span></p>
    <p><span>Total cells sum: {stats.totalSum}</span></p>
    <p><span>Total matrix state updates: {stats.totalCalls}</span></p>
    <p><span>Average update rate: {rate}cells/s</span></p>
  </>;
}

export const App = ExampleComponent