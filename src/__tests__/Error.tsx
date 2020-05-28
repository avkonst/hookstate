import { useState, self } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('error: should not allow set to another state value', async () => {
    const state1 = renderHook(() => {
        return useState({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useState({ prop2: [0, 0] })
    });

    expect(() => {
        state2.result.current.prop2[self].set(p => state1.result.current[self].get().prop1);
    // tslint:disable-next-line: max-line-length
    }).toThrow(`Error: HOOKSTATE-102 [path: /prop2]. See https://hookstate.js.org/docs/exceptions#hookstate-102`);
});

test('error: should not allow create state from another state value', async () => {
    const state1 = renderHook(() => {
        return useState({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useState(state1.result.current[self].get().prop1)
    })

    expect(state2.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`Error: HOOKSTATE-101 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-101`)
});

test('error: should not allow create state from another state value (nested)', async () => {
    const state1 = renderHook(() => {
        return useState({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useState(state1.result.current)
    })

    const state3 = renderHook(() => {
        return useState(state2.result.current.prop1[self].get())
    })

    expect(state3.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`Error: HOOKSTATE-101 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-101`)
});

test('error: should not allow serialization of statelink', async () => {
    const state1 = renderHook(() => {
        return useState({ prop1: [0, 0] })
    });
    
    expect(() => JSON.stringify(state1))
    .toThrow('Error: HOOKSTATE-109 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-109')
});
