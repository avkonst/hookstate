import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(1)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);
});

test('string: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink('str')
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual('str');

    act(() => {
        result.current.merge('str');
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual('strstr');
});

test('object: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ field1: p.field1 + 1}));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5', 'field6']);
});

test('object: should rerender used after merge insert', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ newField: 100 }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'newField']);
});

test('object: should rerender used after merge delete', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ field6: None }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5']);
});

test('object: should rerender used after merge complex', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);

    act(() => {
        result.current.merge({
            field8: 200, field6: None, field2: 3,
            field4: None, field5: 2, field3: None, field7: 100
        });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field5', 'field8', 'field7']);
    expect(result.current.value).toEqual({ field1: 1, field2: 3, field5: 2, field8: 200, field7: 100});
});

test('object: should not rerender unused after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<Record<string, number>>({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            field5: 5,
            field6: 6,
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ field2: 3 }));
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3', 'field4', 'field5', 'field6']);
});

test('array: should rerender used after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ 0: p[0] + 1}));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(2);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2', '3', '4', '5']);
});

test('array: should rerender used after merge insert', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6]);
    })
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ 7: 100 }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(result.current.value).toEqual([1, 2, 3, 4, 5, 6, undefined, 100]);
});

test('array: should rerender used after merge concat', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6]);
    })
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge([100, 200]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(result.current.value).toEqual([1, 2, 3, 4, 5, 6, 100, 200]);
});

test('array: should rerender used after merge delete', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ 3: None }));
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2', '3', '4']);
    expect(result.current.value).toEqual([1, 2, 3, 5, 6]);
});

test('array: should rerender used after merge complex', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge({ 7: 200, 5: None, 1: 3, 3: None, 4: 2, 2: None, 6: 100 });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2', '3', '4']);
    expect(result.current.value).toEqual([1, 3, 2, 100, 200]);
});

test('array: should not rerender unused after merge update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([1, 2, 3, 4, 5, 6])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);

    act(() => {
        result.current.merge(p => ({ 1: 3 }));
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested[0].get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['0', '1', '2', '3', '4', '5']);
});
