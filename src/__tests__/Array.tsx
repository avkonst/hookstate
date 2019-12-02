import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('array: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });
    expect(result.current.get()[0]).toStrictEqual(0);

    act(() => {
        result.current.nested[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()[0]).toStrictEqual(1);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should not rerender used length unchanged', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });

    expect(result.current.get().length).toStrictEqual(2);
    act(() => {
        result.current.nested[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()[0]).toStrictEqual(1);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should rerender used length changed', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });

    expect(result.current.get().length).toStrictEqual(2);
    act(() => {
        result.current.nested[2].set(p => 2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()[0]).toStrictEqual(0);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.get()[2]).toStrictEqual(2);
    expect(result.current.nested.length).toEqual(3);
    expect(result.current.get().length).toEqual(3);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1', '2']);
});

test('array: should not rerender used undefined properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });

    expect(result.current.get().length).toStrictEqual(2);
    // tslint:disable-next-line: no-string-literal
    expect(result.current.nested['field']).toEqual(undefined)
    // tslint:disable-next-line: no-string-literal
    expect(result.current.value['field']).toEqual(undefined)
    expect(result.current.value[2]).toEqual(undefined)
    
    act(() => {
        result.current.nested[0].set(1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()[0]).toStrictEqual(1);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.get()[2]).toEqual(undefined);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

// tslint:disable-next-line: no-any
const TestSymbol = Symbol('TestSymbol') as any;
test('array: should not rerender used symbol properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });

    expect('length' in result.current.get()).toStrictEqual(true);
    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current.nested).toEqual(false)

    expect(result.current.get().length).toStrictEqual(2);
    expect(result.current.get()[TestSymbol]).toEqual(undefined)
    expect(result.current.nested[TestSymbol]).toEqual(undefined)
    
    result.current.get()[TestSymbol] = 100

    expect(() => { result.current.get()[0] = 100 })
    .toThrow('StateLink is used incorrectly. Attempted \'set\' at \'/\'. Hint: did you mean to use \'state.nested[0].set(value)\' instead of \'state[0] = value\'?')

    expect(renderTimes).toStrictEqual(1);
    expect('length' in result.current.get()).toStrictEqual(true);
    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current.nested).toEqual(false)
    expect(result.current.get()[0]).toStrictEqual(0);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.get()[2]).toEqual(undefined);
    expect(result.current.get()[TestSymbol]).toEqual(100);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 0])
    });
    expect(result.current.nested[0].get()).toStrictEqual(0);

    act(() => {
        result.current.nested[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(result.current.nested[1].get()).toStrictEqual(0);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });
    expect(result.current.get()).toEqual([0, 5]);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual([0, 5]);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 5])
    });

    act(() => {
        result.current.nested[2].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()[0]).toStrictEqual(0);
    expect(result.current.get()[1]).toStrictEqual(5);
    expect(result.current.get()[2]).toStrictEqual(1);
    expect(result.current.nested.length).toStrictEqual(3);
    expect(result.current.get().length).toStrictEqual(3);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1', '2']);
});

test('array: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 0])
    });
    expect(result.current.get()[1]).toStrictEqual(0);

    act(() => {
        result.current.nested[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()[0]).toStrictEqual(1);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});

test('array: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([0, 0])
    });

    act(() => {
        result.current.nested[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()[0]).toStrictEqual(1);
    expect(result.current.nested.length).toEqual(2);
    expect(result.current.get().length).toEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1']);
    expect(Object.keys(result.current.get())).toEqual(['0', '1']);
});