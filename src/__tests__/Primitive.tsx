import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
});

test('primitive: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(0);
});

test('primitive: should not rerender unused', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(1);
    expect(result.current.nested).toEqual(undefined);
});

test('object: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(0);

    act(() => {
        result.current.nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('primitive: global state', async () => {
    const stateRef = createStateLink(0)

    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(stateRef)
    });

    expect(result.current.get()).toStrictEqual(0);
    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
});

test('primitive: global state created locally', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        const stateRef = createStateLink(0)
        renderTimes += 1;
        return useStateLink(stateRef)
    });

    expect(result.current.get()).toStrictEqual(0);
    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
});

test('primitive: stale state should auto refresh', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        const r = useStateLink(0)
        React.useEffect(() => {
            // simulated subscription, long running process
            const timer = setInterval(() => {
                // intentionally use value coming from cache
                // which should be the latest
                // even if the effect is not rerun on rerender
                act(() => {
                    r.set(r.value + 1) // 1 + 1
                })
            }, 100)
            return () => clearInterval(timer)
        }, [])
        return r
    });

    act(() => {
        // this also marks it as used,
        // although it was not used during rendering
        result.current.set(result.current.value + 1); // 0 + 1
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);

    await new Promise(resolve => setTimeout(() => resolve(), 110));
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get()).toStrictEqual(2);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.get()).toStrictEqual(3);
});

test('primitive: state value should be the latest', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        const r = useStateLink(0)
        React.useEffect(() => {
            act(() => {
                r.set(r.value + 1) // 0 + 1
                r.set(r.value + 1) // 1 + 1
            })
        }, [])
        return r
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);

    act(() => {
        result.current.set(p => p + 1); // 2 + 1
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get()).toStrictEqual(3);
});
