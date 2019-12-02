import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('complex: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get().field1).toStrictEqual(0);

    act(() => {
        result.current.nested[0].nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()[0].field1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['field1', 'field2']);
});

test('complex: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].nested.field1.get()).toStrictEqual(0);

    act(() => {
        result.current.nested[0].nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.nested[0].get())).toEqual(['field1', 'field2']);
});

test('complex: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field: 1
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toEqual({ field: 1 });

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toEqual({ field: 1 });
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field']);
    expect(Object.keys(result.current.nested[0].get())).toEqual(['field']);
});

test('complex: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current.nested[0].nested['field3'].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field1', 'field2', 'field3']);
    expect(Object.keys(result.current.nested[0].get())).toEqual(['field1', 'field2', 'field3']);
    expect(result.current.nested[0].get().field1).toStrictEqual(0);
    expect(result.current.nested[0].get().field2).toStrictEqual('str');
    // tslint:disable-next-line: no-string-literal
    expect(result.current.nested[0].get()['field3']).toStrictEqual(1);
});

test('complex: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current.nested[0].nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get().field1).toStrictEqual(1);
});

test('complex: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str'
        }])
    });

    act(() => {
        result.current.nested[0].nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get().field1).toStrictEqual(2);
});

test('complex: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            field1: 0,
            field2: 'str',
            field3: true
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current.nested[0].nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toEqual({ field2: 'str', field3: true });
    expect(Object.keys(result.current.nested[0].get())).toEqual(['field2', 'field3']);

    act(() => {
        // deleting non existing property
        result.current.nested[0].nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current.nested[0].nested.field1.set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.nested[0].get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current.nested[0].nested.field2.set(None);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.nested[0].get()).toEqual({ field1: 1, field3: true });

    // deleting nested value
    act(() => {
        result.current.nested[0].set(None)
    })
    expect(renderTimes).toStrictEqual(5);
    expect(result.current.get()).toEqual([]);
});

test('complex: should auto save latest state for unmounted', async () => {
    const state = createStateLink([{
        field1: 0,
        field2: 'str'
    }])
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(state)
    });
    const unmountedLink = useStateLinkUnmounted(state).nested[0].nested
    expect(unmountedLink.field1.get()).toStrictEqual(0);
    expect(result.current.nested[0].get().field1).toStrictEqual(0);

    act(() => {
        result.current.nested[0].nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1.get()).toStrictEqual(2);
    expect(result.current.nested[0].get().field1).toStrictEqual(2);
});