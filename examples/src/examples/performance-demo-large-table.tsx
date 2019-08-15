import React, { useEffect } from 'react';
import { useStateLink, StateLink, DisabledTracking } from '@hookstate/core';

const TableCell = (props: { cellState: StateLink<number> }) => {
    const state = useStateLink(props.cellState);
    return <>{state.value.toString(16)}</>;
}

const MatrixView = (props: { totalRows: number, totalColumns: number, interval: number, callsPerInterval: number }) => {
    const totalRows = props.totalRows;
    const totalColumns = props.totalColumns;
    // we use local per component state,
    // but the same would be for the global state
    // if it was created by createStateLink
    const matrixState = useStateLink(
        Array.from(Array(totalRows).keys())
            .map(i => Array.from(Array(totalColumns).keys()).map(i => 0)));
    // schedule interval updates
    useEffect(() => {
        const t = setInterval(() => {
            function randomInt(min: number, max: number) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }
            for (let i = 0; i < props.callsPerInterval; i += 1) {
                matrixState.nested[randomInt(0, totalRows)].nested[randomInt(0, totalColumns)].set(p => p + 1)
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
                {matrixState.nested.map((rowState, rowIndex: number) =>
                    <tr key={rowIndex}>
                        {rowState.nested.map((cellState, columnIndex) =>
                            <td key={columnIndex}><TableCell cellState={cellState}/></td>
                        )}
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}

export const ExampleComponent = () => {
    const settings = useStateLink({
        totalRows: 50,
        totalColumns: 50,
        rate: 50,
        timer: 10
    }, (s) => ({
        totalRows: s.value.totalRows,
        totalColumns: s.value.totalColumns,
        rate: s.value.rate,
        timer: s.value.timer,
        setRows: (f: (p: number) => number) => s.nested.totalRows.set(f),
        setColumns: (f: (p: number) => number) => s.nested.totalColumns.set(f),
        setRate: (f: (p: number) => number) => s.nested.rate.set(f),
        setTimer: (f: (p: number) => number) => s.nested.timer.set(f),
    }));

    return <>
        <div>
            <p><span>Total rows: {settings.totalRows} </span>
                <button onClick={() => settings.setRows(p => (p - 10) || 10)}>-10</button>
                <button onClick={() => settings.setRows(p => p + 10)}>+10</button></p>
            <p><span>Total columns: {settings.totalColumns} </span>
                <button onClick={() => settings.setColumns(p => (p - 10) || 10)}>-10</button>
                <button onClick={() => settings.setColumns(p => p + 10)}>+10</button></p>
            <p>Total cells: {settings.totalColumns * settings.totalRows}</p>
            <p><span>Cells to update per timer interval: {settings.rate} </span>
                <button onClick={() => settings.setRate(p => (p - 1) || 1)}>-1</button>
                <button onClick={() => settings.setRate(p => p + 1)}>+1</button>
                <button onClick={() => settings.setRate(p => p > 10 ? (p - 10) : 1)}>-10</button>
                <button onClick={() => settings.setRate(p => p + 10)}>+10</button>
                </p>
            <p><span>Timer interval in ms: {settings.timer} </span>
                <button onClick={() => settings.setTimer(p => p > 1 ? (p - 1) : 1)}>-1</button>
                <button onClick={() => settings.setTimer(p => p + 1)}>+1</button>
                <button onClick={() => settings.setTimer(p => p > 10 ? (p - 10) : 1)}>-10</button>
                <button onClick={() => settings.setTimer(p => p + 10)}>+10</button>
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
const PerformanceMeter = (props: { matrixState: StateLink<number[][]> }) => {
    const scopedState = useStateLink(props.matrixState)
        .with(() => {
            // this is custom Hookstate plugin which counts statistics
            let totalSum = 0;
            let totalCalls = 0;
            let startTime = (new Date()).getTime();
            const elapsed = () => (new Date()).getTime() - startTime;
            return {
                id: PerformanceViewPluginID,
                instanceFactory: () => ({
                    onSet: (path, newMatrixState) => {
                        // new value can be only number in this example
                        // and path can contain only 2 elements: row and column indexes
                        totalSum += newMatrixState[path[0]][path[1]];
                        totalCalls += 1;
                    },
                    extensions: ['totalSum', 'totalCalls', 'elapsed', 'rate'],
                    extensionsFactory: () => ({
                        totalSum: () => totalSum,
                        totalCalls: () => totalCalls,
                        elapsed: () => Math.floor(elapsed() / 1000),
                        rate: () => Math.floor(totalCalls / elapsed() * 1000)
                    })
                })
            }
        })
    // mark the value of the whole matrix as 'used' by this component
    scopedState.with(DisabledTracking);
    const valueExplicitlyUsed = scopedState.value;

    return <>
        <p><span>Elapsed: {scopedState.extended.elapsed()}s</span></p>
        <p><span>Total cells sum: {scopedState.extended.totalSum()}</span></p>
        <p><span>Total matrix state updates: {scopedState.extended.totalCalls()}</span></p>
        <p><span>Average update rate: {scopedState.extended.rate()}cells/s</span></p>
    </>;
}
