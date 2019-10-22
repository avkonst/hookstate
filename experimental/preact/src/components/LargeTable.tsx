import { Fragment, h } from 'preact';
import { useStateLink, StateLink, createStateLink, useStateLinkUnmounted, Downgraded } from '@hookstate/core';

const totalRows = 100;
const totalColumns = 100;
const rate = 50;
const timer = 1;

const createMatrix = (rows: number, cols: number) => Array.from(Array(rows).keys())
    .map(i => Array.from(Array(cols).keys()).map(j => 0))
const stateRef = createStateLink(createMatrix(totalRows, totalColumns))

setInterval(() => {
    function randomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < rate; i += 1) {
        useStateLinkUnmounted(stateRef)
            .nested[randomInt(0, totalRows)]
            .nested[randomInt(0, totalColumns)]
            .set((p:number) => p + randomInt(0, 5))
    }
}, timer)

const TableCell = (props: { cellState: StateLink<number> }) => {
    const state = useStateLink(props.cellState);
    return <Fragment>{state.value.toString(16)}</Fragment>
}

const MatrixView = (props: { totalRows: number, totalColumns: number, interval: number, callsPerInterval: number }) => {
    const totalRows = props.totalRows;
    const totalColumns = props.totalColumns;
    // we use global state,
    // but the same result would be for the local state
    const matrixState = useStateLink(stateRef)

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
    const settings = {
        totalRows,
        totalColumns,
        rate,
        timer
    };
    return <div>
        <div>
            <p><span>Total rows: {settings.totalRows} </span></p>
            <p><span>Total columns: {settings.totalColumns} </span></p>
            <p>Total cells: {settings.totalColumns * settings.totalRows}</p>
            <p><span>Cells to update per timer interval: {settings.rate} </span></p>
            <p><span>Timer interval in ms: {settings.timer} </span></p>
        </div>
        <div key={Math.random()}>
            <MatrixView
                // key={Math.random()}
                totalRows={settings.totalRows}
                totalColumns={settings.totalColumns}
                interval={settings.timer}
                callsPerInterval={settings.rate}
            />
        </div>
    </div>;
}

const PerformanceViewPluginID = Symbol('PerformanceViewPlugin');
function PerformanceMeter(props: { matrixState: StateLink<number[][]> }) {
    // const workaround = useStateLink(0);
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
                    onSet: (path, newMatrixState, newCellState) => {
                        // new value can be only number in this example
                        // and path can contain only 2 elements: row and column indexes
                        totalSum += newMatrixState[path[0]][path[1]] - newCellState;
                        totalCalls += 1;

                        // workaround.set(p => p + 1)
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
    scopedState.with(Downgraded);
    const valueExplicitlyUsed = scopedState.value;

    return <Fragment>
        <p><span>Elapsed: {scopedState.extended.elapsed()}s</span></p>
        <p><span>Total cells sum: {scopedState.extended.totalSum()}</span></p>
        <p><span>Total matrix state updates: {scopedState.extended.totalCalls()}</span></p>
        {/* <p><span>Total matrix state updates (workaround): {workaround.get()}</span></p> */}
        <p><span>Average update rate: {scopedState.extended.rate()}cells/s</span></p>
    </Fragment>;
}
