import { useState, createState, State, StateMethods, useHookstate, extend } from '@hookstate/core';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import { clonable, comparable, snapshotable } from './snapshotable';

test('snapshotable: basic test', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate({ a: [0, 1], b: [2, 3] }, () => extend([
            clonable(v => JSON.parse(JSON.stringify(v))),
            comparable((v1, v2) => JSON.stringify(v1).localeCompare(JSON.stringify(v2))),
            snapshotable()
        ]))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        // result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
});