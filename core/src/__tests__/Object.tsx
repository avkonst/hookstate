import { useState, createState, none } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

test('object: should rerender used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(0);

    act(() => {
        result.current.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used null', async () => {
    let renderTimes = 0
    
    const state = createState<{ field: string } | null>(null)
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(state)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.value?.field).toStrictEqual(undefined);

    act(() => {
        state.set({ field: 'a' });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()?.field).toStrictEqual('a');
    expect(Object.keys(result.current)).toEqual(['field']);
});

test('object: should rerender used property-hiphen', async () => {
    let renderTimes = 0
    
    const state = createState<{ 'hiphen-property': string }>({ 'hiphen-property': 'value' })
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(state)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.value['hiphen-property']).toStrictEqual('value');

    act(() => {
        state['hiphen-property'].set('updated');
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current['hiphen-property'].get()).toStrictEqual('updated');
    expect(Object.keys(result.current)).toEqual(['hiphen-property']);
});

test('object: should rerender used (boolean-direct)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: true,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(true);

    act(() => {
        result.current.field1.set(p => !p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(false);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1.get()).toStrictEqual(0);

    act(() => {
        result.current.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested global', async () => {
    let renderTimes = 0
    let state = createState({
        field1: 0,
        field2: 'str'
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(state.field1)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);

    act(() => {
        state.field2.set("updated");
    });
    // should not rerender as field2 is not used by the hook
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(1);
    expect(state.field2.get()).toStrictEqual("updated");
});

test('object: should rerender used via nested function', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({} as { field1?: number })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested("field1").value).toStrictEqual(undefined);

    act(() => {
        result.current.merge({ field1: 1 });
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested("field1").value).toStrictEqual(1);
    expect(Object.keys(result.current)).toEqual(['field1']);
    expect(Object.keys(result.current.get())).toEqual(['field1']);
});

// tslint:disable-next-line: no-any
const TestSymbol = Symbol('TestSymbol') as any;
test('object: should not rerender used symbol properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });

    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current).toEqual(false)
    expect(result.current.get()[TestSymbol]).toEqual(undefined)
    expect(result.current[TestSymbol]).toEqual(undefined)
    
    expect(() => { result.current.get().field1 = 100 })
    .toThrow('Error: HOOKSTATE-202 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-202')
    
    result.current.get()[TestSymbol] = 100

    expect(renderTimes).toStrictEqual(1);
    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current).toEqual(false)
    expect(result.current.get()[TestSymbol]).toEqual(100);
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
    expect(result.current.get().field1).toEqual(0);
});

test('object: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field: 1
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toEqual({ field: 1 });

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field: 1 });
    expect(Object.keys(result.current)).toEqual(['field']);
    expect(Object.keys(result.current.get())).toEqual(['field']);
});

test('object: should rerender when keys used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<{field: number, optional?: number} | null>({
            field: 1
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.keys).toEqual(['field']);

    act(() => {
        result.current.ornull!.field.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.keys).toEqual(['field']);

    act(() => {
        result.current.ornull!.optional.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.keys).toEqual(['field', 'optional']);

    act(() => {
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.keys).toEqual(undefined);
});

test('object: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current['field3'].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current)).toEqual(['field1', 'field2', 'field3']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2', 'field3']);
    expect(result.current.get().field1).toStrictEqual(0);
    expect(result.current.get().field2).toStrictEqual('str');
    // tslint:disable-next-line: no-string-literal
    expect(result.current.get()['field3']).toStrictEqual(1);
});

test('object: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(1);
});

test('object: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });

    act(() => {
        result.current.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(2);
});

test('object: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str',
            field3: true
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current.field1.set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });

    act(() => {
        // deleting non existing property
        result.current.field1.set(none);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current.field1.set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current.field2.set(none);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.get()).toEqual({ field1: 1, field3: true });

    // deleting root value makes it promised
    act(() => {
        result.current.set(none)
    })
    expect(result.current.promised).toEqual(true)
    expect(renderTimes).toStrictEqual(5);
});

test('object: should auto save latest state for unmounted', async () => {
    const state = createState({
        field1: 0,
        field2: 'str'
    })
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(state)
    });
    const unmountedLink = state
    expect(unmountedLink.field1.get()).toStrictEqual(0);
    expect(result.current.get().field1).toStrictEqual(0);

    act(() => {
        result.current.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1.get()).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(2);
});

test('object: should set to null', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<{} | null>({})
    });

    const _unused = result.current.get()
    act(() => {
        result.current.set(p => null);
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(2);
});

test('object: should denull', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<{} | null>({})
    });

    const state = result.current.ornull
    expect(state ? state.get() : null).toEqual({})
    act(() => {
        result.current.set(p => null);
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.ornull).toEqual(null)
});

test('object: should return nested state with conflict name', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<{ value: number }>({ value: 0 })
    });

    expect(result.current.nested('value').value).toEqual(0)
    expect(result.current.value.value).toEqual(0)
    act(() => {
        result.current.nested('value').set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested('value').value).toEqual(1)
    expect(result.current.value.value).toEqual(1)
});
