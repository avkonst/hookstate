import React, { useEffect } from 'react';
import { useState, State, Downgraded, self } from '@hookstate/core';

const TableCell = (props: { cellState: State<number> }) => {
    const state = useState(props.cellState);
    return <>{state.value.toString(16)}</>;
}

const MatrixView = (props: {
    totalRows: number,
    totalColumns: number,
    interval: number,
    callsPerInterval: number
}) => {
    const totalRows = props.totalRows;
    const totalColumns = props.totalColumns;
    // we use local per component state,
    // but the same result would be for the global state
    // if it was created by createState
    const matrixState = useState(
        Array.from(Array(totalRows).keys())
            .map(i => Array.from(Array(totalColumns).keys()).map(j => 0)));
    // schedule interval updates
    useEffect(() => {
        const t = setInterval(() => {
            function randomInt(min: number, max: number) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }
            for (let i = 0; i < props.callsPerInterval; i += 1) {
                matrixState
                    [randomInt(0, totalRows)]
                    [randomInt(0, totalColumns)]
                    .set(p => p + randomInt(0, 5))
            }
        }, props.interval)
        return () => clearInterval(t);
    })

    return <div style={{ overflow: 'scroll' }}>
        <PerformanceMeter matrixState={matrixState} />
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
                {matrixState.map((rowState, rowIndex: number) =>
                    <tr key={rowIndex}>
                        {rowState.map((cellState, columnIndex) =>
                            <td key={columnIndex}>
                                <TableCell cellState={cellState}/>
                            </td>
                        )}
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}

export const ExampleComponent = () => {
    const settings = useState({
        totalRows: 50,
        totalColumns: 50,
        rate: 50,
        timer: 10
    })[self].map((s) => ({
        totalRows: s.totalRows.value,
        totalColumns: s.totalColumns.value,
        rate: s.rate.value,
        timer: s.timer.value,
        setRows: (f: (p: number) => number) => s.totalRows.set(f),
        setColumns: (f: (p: number) => number) => s.totalColumns.set(f),
        setRate: (f: (p: number) => number) => s.rate.set(f),
        setTimer: (f: (p: number) => number) => s.timer.set(f),
    }));

    return <>
        <div>
            <p><span>Total rows: {settings.totalRows} </span>
                <button onClick={() =>
                    settings.setRows(p => (p - 10) || 10)}>-10</button>
                <button onClick={() =>
                    settings.setRows(p => p + 10)}>+10</button></p>
            <p><span>Total columns: {settings.totalColumns} </span>
                <button onClick={() =>
                    settings.setColumns(p => (p - 10) || 10)}>-10</button>
                <button onClick={() =>
                    settings.setColumns(p => p + 10)}>+10</button></p>
            <p>Total cells: {settings.totalColumns * settings.totalRows}</p>
            <p><span>Cells to update per timer interval: {settings.rate} </span>
                <button onClick={() =>
                    settings.setRate(p => (p - 1) || 1)}>-1</button>
                <button onClick={() =>
                    settings.setRate(p => p + 1)}>+1</button>
                <button onClick={() =>
                    settings.setRate(p => p > 10 ? (p - 10) : 1)}>-10</button>
                <button onClick={() =>
                    settings.setRate(p => p + 10)}>+10</button>
                </p>
            <p><span>Timer interval in ms: {settings.timer} </span>
                <button onClick={() =>
                    settings.setTimer(p => p > 1 ? (p - 1) : 1)}>-1</button>
                <button onClick={() =>
                    settings.setTimer(p => p + 1)}>+1</button>
                <button onClick={() =>
                    settings.setTimer(p => p > 10 ? (p - 10) : 1)}>-10</button>
                <button onClick={() =>
                    settings.setTimer(p => p + 10)}>+10</button>
                </p>
        </div>
        <MatrixView
            key={Math.random()}
            totalRows={settings.totalRows}
            totalColumns={settings.totalColumns}
            interval={settings.timer}
            callsPerInterval={settings.rate}
        />
    </>;
}

const PerformanceViewPluginID = Symbol('PerformanceViewPlugin');
function PerformanceMeter(props: { matrixState: State<number[][]> }) {
    const stats = React.useRef({
        totalSum: 0,
        totalCalls: 0,
        startTime: (new Date()).getTime()
    })
    const elapsedMs = () => (new Date()).getTime() - stats.current.startTime;
    const elapsed = () => Math.floor(elapsedMs() / 1000);
    const rate = Math.floor(stats.current.totalCalls / elapsedMs() * 1000);
    const scopedState = useState(props.matrixState)
    scopedState[self].attach(() => ({
            id: PerformanceViewPluginID,
            init: () => ({
                onSet: (p) => {
                    if (p.path.length === 2) {
                        // new value can be only number in this example
                        // and path can contain only 2 elements: row and column indexes
                        stats.current.totalSum += p.value - p.previous;
                    }
                    stats.current.totalCalls += 1;
                }
            })
        }))
    // mark the value of the whole matrix as 'used' by this component
    scopedState[self].attach(Downgraded);
    scopedState[self].get();

    return <>
        <p><span>Elapsed: {elapsed()}s</span></p>
        <p><span>Total cells sum: {stats.current.totalSum}</span></p>
        <p><span>Total matrix state updates: {stats.current.totalCalls}</span></p>
        <p><span>Average update rate: {rate}cells/s</span></p>
    </>;
}
