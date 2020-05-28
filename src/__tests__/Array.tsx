import { useState, self } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('array: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });
    expect(result.current[self].get()[0]).toStrictEqual(0);

    act(() => {
        result.current[0][self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender used (length)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });
    expect(result.current.length).toStrictEqual(2);

    act(() => {
        result.current[self].set([1, 5]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender used (iterated)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });
    expect(result.current.find(i => false)).toStrictEqual(undefined);

    act(() => {
        result.current[0][self].set(2);
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        result.current[2][self].set(4);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0]).toStrictEqual(2);
    expect(result.current[self].get()[2]).toStrictEqual(4);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current.length).toEqual(3);
    expect(result.current[self].get().length).toEqual(3);
});

test('array: should not rerender used length unchanged', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });

    expect(result.current[self].get().length).toStrictEqual(2);
    act(() => {
        result.current[0][self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender used length changed', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });

    expect(result.current[self].get().length).toStrictEqual(2);
    act(() => {
        result.current[2][self].set(p => 2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0]).toStrictEqual(0);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current[self].get()[2]).toStrictEqual(2);
    expect(result.current.length).toEqual(3);
    expect(result.current[self].get().length).toEqual(3);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1', '2']);
});

test('array: should rerender when keys used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        const value = [0, 1];
        // tslint:disable-next-line: no-string-literal
        value['poluted'] = 1;
        return useState<number[]>([0, 1])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].keys).toEqual([0, 1]);

    act(() => {
        result.current[0][self].set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].keys).toEqual([0, 1]);

    act(() => {
        result.current[3][self].set(3);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].keys).toEqual([0, 1, 3]);
});

test('array: should not rerender used undefined properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });

    expect(result.current[self].get().length).toStrictEqual(2);
    // tslint:disable-next-line: no-string-literal
    expect(result.current['field']).toEqual(undefined)
    // tslint:disable-next-line: no-string-literal
    expect(result.current[self].get()['field']).toEqual(undefined)
    expect(result.current[self].get()[2]).toEqual(undefined)
    
    act(() => {
        result.current[0][self].set(1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current[self].get()[2]).toEqual(undefined);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

// tslint:disable-next-line: no-any
const TestSymbol = Symbol('TestSymbol') as any;
test('array: should not rerender used symbol properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });

    expect('length' in result.current[self].get()).toStrictEqual(true);
    expect(TestSymbol in result.current[self].get()).toEqual(false)
    expect(TestSymbol in result.current).toEqual(false)

    expect(result.current[self].get().length).toStrictEqual(2);
    expect(result.current[self].get()[TestSymbol]).toEqual(undefined)
    expect(result.current[TestSymbol]).toEqual(undefined)
    
    result.current[self].get()[TestSymbol] = 100

    expect(() => { result.current[self].get()[0] = 100 })
    .toThrow('Error: HOOKSTATE-202 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-202')

    expect(renderTimes).toStrictEqual(1);
    expect('length' in result.current[self].get()).toStrictEqual(true);
    expect(TestSymbol in result.current[self].get()).toEqual(false)
    expect(TestSymbol in result.current).toEqual(false)
    expect(result.current[self].get()[0]).toStrictEqual(0);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current[self].get()[2]).toEqual(undefined);
    expect(result.current[self].get()[TestSymbol]).toEqual(100);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 0])
    });
    expect(result.current[0][self].get()).toStrictEqual(0);

    act(() => {
        result.current[0][self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(result.current[1][self].get()).toStrictEqual(0);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });
    expect(result.current[self].get()).toEqual([0, 5]);

    act(() => {
        result.current[self].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()).toEqual([0, 5]);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 5])
    });

    act(() => {
        result.current[2][self].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()[0]).toStrictEqual(0);
    expect(result.current[self].get()[1]).toStrictEqual(5);
    expect(result.current[self].get()[2]).toStrictEqual(1);
    expect(result.current.length).toStrictEqual(3);
    expect(result.current[self].get().length).toStrictEqual(3);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1', '2']);
});

test('array: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 0])
    });
    expect(result.current[self].get()[1]).toStrictEqual(0);

    act(() => {
        result.current[0][self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});

test('array: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([0, 0])
    });

    act(() => {
        result.current[0][self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()[0]).toStrictEqual(1);
    expect(result.current.length).toEqual(2);
    expect(result.current[self].get().length).toEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1']);
    expect(Object.keys(result.current[self].get())).toEqual(['0', '1']);
});