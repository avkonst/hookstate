import { useState, none, self, State, postpone } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via nested batch update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(0);
    expect(result.current.field2[self].get()).toStrictEqual('str');

    act(() => {
        result.current[self].map(() => {
            result.current.field1[self].set(p => p + 1);
            result.current.field2[self].set(p => p + 'str');
        }, null)
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(result.current.field2[self].get()).toStrictEqual('strstr');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[self].get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch merge', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(0);
    expect(result.current.field2[self].get()).toStrictEqual('str');

    act(() => {
        result.current[self].map(() => {
            result.current[self].merge(p => ({
                field1: p.field1 + 1,
                field2: p.field2 + 'str',
            }))
        }, null)
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(result.current.field2[self].get()).toStrictEqual('strstr');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[self].get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch double', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.field1[self].get()).toStrictEqual(0);
    expect(result.current.field2[self].get()).toStrictEqual('str');

    act(() => {
        result.current[self].map(() => {
            // nested batch
            result.current.field2[self].set(p => p + '-before-')
            result.current[self].map((s) => {
                s[self].merge(p => ({
                    field1: p.field1 + 1,
                    field2: p.field2 + 'str',
                }))
            }, null)
            result.current.field2[self].set(p => p + '-after-')
        }, null)
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1[self].get()).toStrictEqual(1);
    expect(result.current.field2[self].get()).toStrictEqual('str-before-str-after-');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current[self].get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch promised', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual(0);

    const promise = new Promise<number>(resolve => setTimeout(() => {
        act(() => resolve(100))
    }, 500))
    act(() => {
        result.current[self].set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map((s) => false, (s: State<number>) => s[self].keys))
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');
    expect(() => result.current[self].get())
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');

    expect(() => result.current[self].set(200))
        .toThrow('Error: HOOKSTATE-104 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-104')

    let executed = false;
    act(() => {
        expect(() => result.current[self].map(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current[self].set(10000)
            expect(renderTimes).toStrictEqual(2);
        }, (s) => s[self].value)).toThrow(`Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103`)
    })
    expect(executed).toBeFalsy()

    act(() => {
        expect(() => result.current[self].map(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current[self].set(10000)
            expect(renderTimes).toStrictEqual(2);
        }, (s) => s[self].value)).toThrow(`Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103`)
    })
    expect(executed).toBeFalsy()

    executed = false;
    act(() => {
        expect(() => result.current[self].map(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current[self].set(10000)
        }, null)).toThrow(`Error: HOOKSTATE-104 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-104`)
    })
    expect(executed).toBeTruthy()

    executed = false;
    act(() => {
        result.current[self].map(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current[self].set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
            result.current[self].set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
        }, () => undefined);
    })
    expect(executed).toBeFalsy()

    executed = false;
    act(() => {
        result.current[self].map(() => {
            act(() => {
                executed = true
                expect(renderTimes).toStrictEqual(3);
                result.current[self].set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
                result.current[self].set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
            })
        }, () => postpone);
    })
    expect(executed).toBeFalsy()

    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    await act(async () => {
        await promise;
        expect(executed).toBeFalsy()
        expect(renderTimes).toStrictEqual(3);
        expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
        expect(result.current[self].map(() => undefined, () => undefined, () => true)).toEqual(undefined);
        expect(result.current[self].get()).toEqual(100);
    })

    expect(executed).toBeTruthy()
    expect(renderTimes).toStrictEqual(4);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => undefined, () => undefined, () => true)).toEqual(undefined);
    expect(result.current[self].get()).toEqual(300);
});

test('object: should rerender used via nested batch promised manual', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<number>(none)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => undefined, (s) => s[self].keys))
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');
    expect(() => result.current[self].get())
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');

    act(() => {
        result.current[self].map(() => {
            act(() => {
                expect(renderTimes).toStrictEqual(2);
                result.current[self].set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
                result.current[self].set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
            })
        }, () => postpone);
    })

    expect(renderTimes).toStrictEqual(1);
    act(() => {
        result.current[self].set(100)
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].get()).toEqual(100); // mark used

    await act(async () => new Promise(resolve => setTimeout(() => resolve(), 100)))

    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => undefined, () => undefined, () => true)).toEqual(undefined);
    expect(result.current[self].get()).toEqual(300);
});

test('object: should rerender used via scoped batched updates', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useState({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useState(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current[self].map(() => {
            child.result.current.fieldUsedByChild[self].set(p => p + 1);
            child.result.current.fieldUsedByChild[self].set(p => p + 1);
        }, 'batched')
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(102);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current[self].map(() => {
            child.result.current.fieldUsedByChild[self].set(p => p + 1);
            child.result.current.fieldUsedByChild[self].set(p => p + 1);
            child.result.current.fieldUsedByParent[self].set(p => p + 1);
            child.result.current.fieldUsedByParent[self].set(p => p + 1);
        }, 0)
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(2);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(104);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(2);
});
