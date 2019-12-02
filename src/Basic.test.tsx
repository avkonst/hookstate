import { useStateLink, createStateLink, useStateLinkUnmounted, None } from './UseStateLink';

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

test('object: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(0);

    act(() => {
        result.current.nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
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
    expect(Object.keys(result.current.nested)).toEqual(['field']);
    expect(Object.keys(result.current.get())).toEqual(['field']);
});

test('object: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current.nested['field3'].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3']);
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
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current.nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(1);
});

test('object: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });

    act(() => {
        result.current.nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(2);
});

test('object: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str',
            field3: true
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current.nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });

    act(() => {
        // deleting non existing property
        result.current.nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current.nested.field1.set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current.nested.field2.set(None);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.get()).toEqual({ field1: 1, field3: true });

    // deleting root value
    expect(() => result.current.set(None)).toThrow(`StateLink is used incorrectly. Attempted 'delete state' at '/'. Hint: did you mean to use state.set(undefined) instead of state.set(None)?`);
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.get()).toEqual({ field1: 1, field3: true });
});

test('object: should auto save latest state for unmounted', async () => {
    const state = createStateLink({
        field1: 0,
        field2: 'str'
    })
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(state)
    });
    const unmountedLink = useStateLinkUnmounted(state).nested
    expect(unmountedLink.field1.get()).toStrictEqual(0);
    expect(result.current.get().field1).toStrictEqual(0);

    act(() => {
        result.current.nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1.get()).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(2);
});

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

test('null: should set to null', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<{} | null>({})
    });

    result.current.get()
    act(() => {
        result.current.set(p => null);
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(2);
});

test('error: should not allow set to another state value', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink({ prop2: [0, 0] })
    });

    expect(() => {
        state2.result.current.nested.prop2.set(
            p => state1.result.current.get().prop1);
    // tslint:disable-next-line: max-line-length
    }).toThrow(`StateLink is used incorrectly. Attempted 'set(state.get() at '/prop1')' at '/prop2'. Hint: did you mean to use state.set(lodash.cloneDeep(value)) instead of state.set(value)?`);
});

test('error: should not allow create state from another state value', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink(state1.result.current.get().prop1)
    })

    expect(state2.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/prop1')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)
});

test('error: should not allow create state from another state value (nested)', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink(state1.result.current.nested)
    })

    expect(state2.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)

    const state3 = renderHook(() => {
        return useStateLink(state1.result.current.nested.prop1.nested)
    })

    expect(state3.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/prop1')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)
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
        const result = useStateLink(0)
        React.useEffect(() => {
            // simulated subscription, long running process
            const timer = setInterval(() => {
                // intentionally use value coming from cache
                // which should be the latest
                // even if the effect is not rerun on rerender
                act(() => {
                    result.set(result.value + 1) // 1 + 1
                })
            }, 100)
            return () => clearInterval(timer)
        }, [])
        return result
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
        const result = useStateLink(0)
        React.useEffect(() => {
            act(() => {
                result.set(result.value + 1) // 0 + 1
                result.set(result.value + 1) // 1 + 1
            })
        }, [])
        return result
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toStrictEqual(2);

    act(() => {
        result.current.set(p => p + 1); // 2 + 1
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get()).toStrictEqual(3);
});
