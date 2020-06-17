import { useState, none, self } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(1)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()).toStrictEqual(2);
});

test('string: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState('str')
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual('str');

    act(() => {
        result.current[self].merge('str');
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()).toStrictEqual('strstr');
});

test('object: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ field1: p.field1 + 1}));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(2);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5', 'field6']);
});

test('object: should rerender used after merge insert', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ newField: 100 }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(
        ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'newField']);
});

test('object: should rerender used after merge delete', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ field6: none }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5']);
});

test('object: should rerender used after merge complex', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge({
            field8: 200, field6: none, field2: 3,
            field4: none, field5: 2, field3: none, field7: 100
        });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2', 'field5', 'field8', 'field7']);
    expect(result.current[self].get()).toEqual({ field1: 1, field2: 3, field5: 2, field8: 200, field7: 100});
});

test('object: should not rerender unused after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ field2: 3 }));
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5', 'field6']);
});

test('array: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ 0: p[0] + 1}));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(2);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2', '3', '4', '5']);
});

test('array: should rerender used after merge insert', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6]);
    })
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ 7: 100 }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(result.current[self].get()).toEqual([1, 2, 3, 4, 5, 6, undefined, 100]);
});

test('array: should rerender used after merge concat', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6]);
    })
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge([100, 200]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(result.current[self].get()).toEqual([1, 2, 3, 4, 5, 6, 100, 200]);
});

test('array: should rerender used after merge concat (scoped)', async () => {
    let renderTimes = 0
    let renderTimesNested = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6]);
    })
    const nested = renderHook(() => {
        renderTimesNested += 1;
        return useState(result.current);
    })
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].keys).toStrictEqual([0, 1, 2, 3, 4, 5]);
    expect(nested.result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge([100, 200]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(result.current[self].get()).toEqual([1, 2, 3, 4, 5, 6, 100, 200]);
});

test('array: should rerender used after merge delete', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ 3: none }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2', '3', '4']);
    expect(result.current[self].get()).toEqual([1, 2, 3, 5, 6]);
});

test('array: should rerender used after merge complex', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge({ 7: 200, 5: none, 1: 3, 3: none, 4: 2, 2: none, 6: 100 });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2', '3', '4']);
    expect(result.current[self].get()).toEqual([1, 3, 2, 100, 200]);
});

test('array: should not rerender unused after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);

    act(() => {
        result.current[self].merge(p => ({ 1: 3 }));
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0][self].get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['0', '1', '2', '3', '4', '5']);
});
