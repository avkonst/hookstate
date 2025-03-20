import { useHookstate, hookstate, none } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

test('complex: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get().field1).toStrictEqual(0);

    act(() => {
        result.current[0].field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()[0].field1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['field1', 'field2']);
});

test('complex: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].field1.get()).toStrictEqual(0);

    act(() => {
        result.current[0].field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[0].get())).toEqual(['field1', 'field2']);
});

test('complex: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field: 1
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toEqual({ field: 1 });

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toEqual({ field: 1 });
    expect(Object.keys(result.current[0])).toEqual(['field']);
    expect(Object.keys(result.current[0].get())).toEqual(['field']);
});

test('complex: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current[0]['field3'].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current[0])).toEqual(['field1', 'field2', 'field3']);
    expect(Object.keys(result.current[0].get())).toEqual(['field1', 'field2', 'field3']);
    expect(result.current[0].get().field1).toStrictEqual(0);
    expect(result.current[0].get().field2).toStrictEqual('str');
    // tslint:disable-next-line: no-string-literal
    expect(result.current[0].get()['field3']).toStrictEqual(1);
});

test('complex: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str'
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current[0].field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get().field1).toStrictEqual(1);
});

test('complex: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str'
        }])
    });

    act(() => {
        result.current[0].field1.set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get().field1).toStrictEqual(2);
});

test('complex: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            field1: 0,
            field2: 'str',
            field3: true
        }])
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current[0].field1.set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toEqual({ field2: 'str', field3: true });
    expect(Object.keys(result.current[0].get())).toEqual(['field2', 'field3']);

    act(() => {
        // deleting non existing property
        result.current[0].field1.set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current[0].field1.set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[0].get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current[0].field2.set(none);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current[0].get()).toEqual({ field1: 1, field3: true });

    // deleting nested value
    act(() => {
        result.current[0].set(none)
    })
    expect(renderTimes).toStrictEqual(5);
    expect(result.current.get()).toEqual([]);
});

test('complex: should auto save latest state for unmounted', async () => {
    const state = hookstate([{
        field1: 0,
        field2: 'str'
    }])
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(state)
    });
    const unmountedLink = state[0]
    expect(unmountedLink.field1.get()).toStrictEqual(0);
    expect(result.current[0].get().field1).toStrictEqual(0);

    act(() => {
        result.current[0].field1.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1.get()).toStrictEqual(2);
    expect(result.current[0].get().field1).toStrictEqual(2);
});

test('scoped: should reinitialize when parent state changes', async () => {
    const initialStore = hookstate({ a: 0 });
    const newStore = hookstate({ a: 1 });

    let renderTimes = 0;
    const { result, rerender } = renderHook(({ source }) => {
        renderTimes += 1;
        return useHookstate(source).a;
    }, { initialProps: { source: initialStore } });

    expect(renderTimes).toBe(1);
    expect(result.current.get()).toBe(0);

    act(() => {
        result.current.set(p => p + 1);
    });

    expect(result.current.get()).toBe(1);
    expect(renderTimes).toBe(2);

    rerender({ source: newStore });

    expect(renderTimes).toBe(3);
    expect(result.current.get()).toBe(1); // Should reinitialize to new store's value

    // should be able to set state after reinitialization
    act(() => {
        result.current.set(p => p + 1);
    });

    expect(result.current.get()).toBe(2);
});

test('should synchronize unsubscription and reinitialization when source/store changes', async () => {
    const initialStore = hookstate(0);
    const newStore = hookstate(42);
    
    let renderTimes = 0;
    const { result, rerender } = renderHook(({ source }) => {
        renderTimes += 1;
        return useHookstate(source);
    }, { initialProps: { source: initialStore } });

    expect(renderTimes).toBe(1);
    expect(result.current.get()).toBe(0);

    act(() => {
        result.current.set(p => p + 1);
    });

    expect(result.current.get()).toBe(1);
    expect(renderTimes).toBe(2);

    rerender({ source: newStore });

    expect(renderTimes).toBe(3);
    expect(result.current.get()).toBe(42); // Should reinitialize to new store's value

    // should be able to set state after reinitialization
    act(() => {
        result.current.set(p => p + 1);
    });

    expect(result.current.get()).toBe(43);
});

test('local: should reinitialize when initial state changes', async () => {
    let renderTimes = 0;
    const { result, rerender } = renderHook(({ initialState }) => {
        renderTimes += 1;
        return useHookstate(initialState);
    }, { initialProps: { initialState: { a: 0 } } });

    expect(renderTimes).toBe(1);
    expect(result.current.a.get()).toBe(0);

    act(() => {
        result.current.a.set(p => p + 1);
    });

    expect(result.current.a.get()).toBe(1);
    expect(renderTimes).toBe(2);

    rerender({ initialState: { a: 1 } });

    expect(renderTimes).toBe(3);
    expect(result.current.a.get()).toBe(1); // Should reinitialize to new initial state

    // should be able to set state after reinitialization
    act(() => {
        result.current.a.set(p => p + 1);
    });

    expect(result.current.a.get()).toBe(2);
});