import { useHookstate, hookstate, State } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
});

test('primitive: should not rerender used if set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let r: State<number> = useHookstate(0)
        return r
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);
});

test('primitive: should not rerender used if set to the same (null)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(null)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(null);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(null);
});

test('primitive: should not rerender used if set to the same (undefined)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(undefined)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(undefined);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(undefined);
});

test('primitive: should rerender used (boolean)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(true)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(true);

    act(() => {
        result.current.set(p => !p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(false);
});

test('primitive: should rerender used (null)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate<number | null>(null)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(null);

    act(() => {
        result.current.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);
});

test('primitive: should rerender used (undefined)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate<number | undefined>(undefined)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(undefined);

    act(() => {
        result.current.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);
});

test('primitive: should rerender used (global null)', async () => {
    let renderTimes = 0
    const state = hookstate<number | null>(null)
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(state)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(null);

    act(() => {
        result.current.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);
});

test('primitive: should rerender used (global undefined)', async () => {
    let renderTimes = 0
    const state = hookstate<number | undefined>(undefined)
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(state)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(undefined);

    act(() => {
        result.current.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);
});

test('primitive: should not rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        return useHookstate(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);
});

test('primitive: should rerender when keys used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate('value')
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.keys).toEqual(undefined);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.keys).toEqual(undefined);
});

test('primitive: should not rerender unused', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(0)
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(1);
    expect(result.current['non-existing']).toBeUndefined();
    expect(result.current[0]).toBeUndefined();
});

test('primitive: global state', async () => {
    const stateInf = hookstate(0)
    
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(stateInf)
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
    let errorMessage = ""
    const { result } = renderHook(() => {
        try {
            const state = hookstate(0)
            renderTimes += 1;
            return useHookstate(state)
        } catch (e) {
            errorMessage = `${e}`
            return undefined
        }
    });

    expect(errorMessage).toStrictEqual("")
    expect(result.current!.get()).toStrictEqual(0);
    act(() => {
        result.current!.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(errorMessage).toStrictEqual("")
});

test('primitive: stale state should auto refresh', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        const r = useHookstate(0)
        React.useEffect(() => {
            // simulated subscription, long running process
            const timer = setInterval(() => {
                // intentionally use value coming from cache
                // which should be the latest
                // even if the effect is not rerun on rerender
                act(() => {
                    r.set(r.get() + 1) // 1 + 1
                })
            }, 100)
            return () => clearInterval(timer)
        }, [])
        return r
    });

    act(() => {
        // this also marks it as used,
        // although it was not used during rendering
        result.current.set(result.current.get() + 1); // 0 + 1
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
    
    await new Promise(resolve => setTimeout(() => resolve(0), 110));
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
        const r = useHookstate(0)
        React.useEffect(() => {
            act(() => {
                r.set(r.get() + 1) // 0 + 1
                r.set(r.get() + 1) // 1 + 1
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
