import { useStateLink, None } from '../../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via nested batch update', async () => {
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
    expect(result.current.nested.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            result.current.nested.field1.set(p => p + 1);
            result.current.nested.field2.set(p => p + 'str');
        })
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(result.current.nested.field2.get()).toStrictEqual('strstr');
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch merge', async () => {
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
    expect(result.current.nested.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            result.current.merge(p => ({
                field1: p.field1 + 1,
                field2: p.field2 + 'str',
            }))
        })
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(result.current.nested.field2.get()).toStrictEqual('strstr');
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch double', async () => {
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
    expect(result.current.nested.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            // nested batch
            result.current.nested.field2.set(p => p + '-before-')
            result.current.batch(() => {
                result.current.merge(p => ({
                    field1: p.field1 + 1,
                    field2: p.field2 + 'str',
                }))
            })
            result.current.nested.field2.set(p => p + '-after-')
        })
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(result.current.nested.field2.get()).toStrictEqual('str-before-str-after-');
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch promised', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    const promise = new Promise<number>(resolve => setTimeout(() => {
        act(() => resolve(100))
    }, 500))
    act(() => {
        result.current.set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    expect(() => result.current.set(200))
        .toThrow('StateLink is used incorrectly. Attempted \'write promised state\' at \'/\'')

    let executed = false;
    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
            expect(renderTimes).toStrictEqual(2);
        })).toThrow(`StateLink is used incorrectly. Attempted 'read promised state' at '/'`)
    })
    expect(executed).toBeFalsy()

    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
            expect(renderTimes).toStrictEqual(2);
        }, {
            ifPromised: 'reject'
        })).toThrow(`StateLink is used incorrectly. Attempted 'read promised state' at '/'`)
    })
    expect(executed).toBeFalsy()

    executed = false;
    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
        }, {
            ifPromised: 'execute'
        })).toThrow(`StateLink is used incorrectly. Attempted 'write promised state' at '/'`)
    })
    expect(executed).toBeTruthy()

    executed = false;
    act(() => {
        result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
            result.current.set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
        }, {
            ifPromised: 'discard'
        });
    })
    expect(executed).toBeFalsy()

    executed = false;
    act(() => {
        result.current.batch(() => {
            act(() => {
                executed = true
                expect(renderTimes).toStrictEqual(3);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
            })
        }, {
            ifPromised: 'postpone'
        });
    })
    expect(executed).toBeFalsy()

    expect(result.current.promised).toStrictEqual(true);
    await act(async () => {
        await promise;
        expect(executed).toBeFalsy()
        expect(renderTimes).toStrictEqual(3);
        expect(result.current.promised).toStrictEqual(false);
        expect(result.current.error).toEqual(undefined);
        expect(result.current.value).toEqual(100);
    })

    expect(executed).toBeTruthy()
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(300);
});

test('object: should rerender used via nested batch promised manual', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<number>(None)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    act(() => {
        result.current.batch(() => {
            act(() => {
                expect(renderTimes).toStrictEqual(2);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
            })
        }, {
            ifPromised: 'postpone'
        });
    })

    expect(renderTimes).toStrictEqual(1);
    act(() => {
        result.current.set(100)
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.value).toEqual(100); // mark used

    await act(async () => new Promise(resolve => setTimeout(() => resolve(), 100)))

    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(300);
});

test('object: should rerender used via scoped batched updates', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current)
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.batch(() => {
            child.result.current.nested.fieldUsedByChild.set(p => p + 1);
            child.result.current.nested.fieldUsedByChild.set(p => p + 1);
        })
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(102);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.batch(() => {
            child.result.current.nested.fieldUsedByChild.set(p => p + 1);
            child.result.current.nested.fieldUsedByChild.set(p => p + 1);
            child.result.current.nested.fieldUsedByParent.set(p => p + 1);
            child.result.current.nested.fieldUsedByParent.set(p => p + 1);
        })
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(2);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(104);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(2);
});
