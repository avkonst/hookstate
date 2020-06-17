import { useState, createState, none, self } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('complex: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get().field1).toStrictEqual(0);

    act(() => {
        result.current[0].field1[self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0].field1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['field1', 'field2']);
});

test('complex: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].field1[self].get()).toStrictEqual(0);

    act(() => {
        result.current[0].field1[self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].field1[self].get()).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[0][self].get())).toEqual(['field1', 'field2']);
});

test('complex: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field: 1
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toEqual({ field: 1 });

    act(() => {
        result.current[self].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toEqual({ field: 1 });
    expect(Object.keys(result.current[0])).toEqual(['field']);
    expect(Object.keys(result.current[0][self].get())).toEqual(['field']);
});

test('complex: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current[0]['field3'][self].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2', 'field3']);
    expect(Object.keys(result.current[0][self].get())).toEqual(['field1', 'field2', 'field3']);
    expect(result.current[0][self].get().field1).toStrictEqual(0);
    expect(result.current[0][self].get().field2).toStrictEqual('str');
    // tslint:disable-next-line: no-string-literal
    expect(result.current[0][self].get()['field3']).toStrictEqual(1);
});

test('complex: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current[0].field1[self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get().field1).toStrictEqual(1);
});

test('complex: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str'
        }])
    });

    act(() => {
        result.current[0].field1[self].set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get().field1).toStrictEqual(2);
});

test('complex: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            field1: 0,
            field2: 'str',
            field3: true
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current[0].field1[self].set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toEqual({ field2: 'str', field3: true });
    expect(Object.keys(result.current[0][self].get())).toEqual(['field2', 'field3']);

    act(() => {
        // deleting non existing property
        result.current[0].field1[self].set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current[0].field1[self].set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[0][self].get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current[0].field2[self].set(none);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current[0][self].get()).toEqual({ field1: 1, field3: true });

    // deleting nested value
    act(() => {
        result.current[0][self].set(none)
    })
    expect(renderTimes).toStrictEqual(5);
    expect(result.current[self].get()).toEqual([]);
});

test('complex: should auto save latest state for unmounted', async () => {
    const state = createState([{
        field1: 0,
        field2: 'str'
    }])
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(state)
    });
    const unmountedLink = state[0]
    expect(unmountedLink.field1[self].get()).toStrictEqual(0);
    expect(result.current[0][self].get().field1).toStrictEqual(0);

    act(() => {
        result.current[0].field1[self].set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1[self].get()).toStrictEqual(2);
    expect(result.current[0][self].get().field1).toStrictEqual(2);
});