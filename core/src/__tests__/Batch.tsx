import { useState, none, postpone } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

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
    expect(result.current.field1.get()).toStrictEqual(0);
    expect(result.current.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            result.current.field1.set(p => p + 1);
            result.current.field2.set(p => p + 'str');
        }, null)
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1.get()).toStrictEqual(1);
    expect(result.current.field2.get()).toStrictEqual('strstr');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
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
    expect(result.current.field1.get()).toStrictEqual(0);
    expect(result.current.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            result.current.merge(p => ({
                field1: p.field1 + 1,
                field2: p.field2 + 'str',
            }))
        }, null)
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1.get()).toStrictEqual(1);
    expect(result.current.field2.get()).toStrictEqual('strstr');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
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
    expect(result.current.field1.get()).toStrictEqual(0);
    expect(result.current.field2.get()).toStrictEqual('str');

    act(() => {
        result.current.batch(() => {
            // nested batch
            result.current.field2.set(p => p + '-before-')
            result.current.batch((s) => {
                s.merge(p => ({
                    field1: p.field1 + 1,
                    field2: p.field2 + 'str',
                }))
            })
            result.current.field2.set(p => p + '-after-')
        })
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.field1.get()).toStrictEqual(1);
    expect(result.current.field2.get()).toStrictEqual('str-before-str-after-');
    expect(Object.keys(result.current)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

test('object: should rerender used via nested batch promised', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(0)
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
    expect(() => result.current.keys)
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');
    expect(() => result.current.get())
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');

    expect(() => result.current.set(200))
        .toThrow('Error: HOOKSTATE-104 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-104')

    let executed = false;
    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            result.current.get()
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
            expect(renderTimes).toStrictEqual(2);
        })).toThrow(`Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103`)
    })
    expect(executed).toBeTruthy()

    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
            expect(renderTimes).toStrictEqual(2);
        })).toThrow(`Error: HOOKSTATE-104 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-104`)
    })
    expect(executed).toBeTruthy()

    executed = false;
    act(() => {
        expect(() => result.current.batch(() => {
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(10000)
        }, null)).toThrow(`Error: HOOKSTATE-104 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-104`)
    })
    expect(executed).toBeTruthy()

    executed = false;
    act(() => {
        result.current.batch((v) => {
            if (v.promised) {
                return;
            }
            executed = true;
            expect(renderTimes).toStrictEqual(2);
            result.current.set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
            result.current.set(p => p + 100)
            expect(renderTimes).toStrictEqual(2);
        });
    })
    expect(executed).toBeFalsy()

    executed = false;
    act(() => {
        result.current.batch((v) => {
            if (v.promised) {
                return postpone
            }
            return act(() => {
                executed = true
                expect(renderTimes).toStrictEqual(3);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(3);
            })
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
        expect(result.current.get()).toEqual(100);
    })

    expect(executed).toBeTruthy()
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.get()).toEqual(300);
});

test('object: should rerender used via nested batch promised manual', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState<number>(none)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.keys)
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');
    expect(() => result.current.get())
        .toThrow('Error: HOOKSTATE-103 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-103');

    act(() => {
        result.current.batch((v) => {
            if (v.promised) {
                return postpone
            }
            return act(() => {
                expect(renderTimes).toStrictEqual(2);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
                result.current.set(p => p + 100)
                expect(renderTimes).toStrictEqual(2);
            })
        });
    })

    expect(renderTimes).toStrictEqual(1);
    act(() => {
        result.current.set(100)
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual(100); // mark used

    await act(async () => new Promise(resolve => setTimeout(() => resolve(), 100)))

    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.get()).toEqual(300);
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
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.batch(() => {
            child.result.current.fieldUsedByChild.set(p => p + 1);
            child.result.current.fieldUsedByChild.set(p => p + 1);
        }, 'batched')
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(102);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.batch(() => {
            child.result.current.fieldUsedByChild.set(p => p + 1);
            child.result.current.fieldUsedByChild.set(p => p + 1);
            child.result.current.fieldUsedByParent.set(p => p + 1);
            child.result.current.fieldUsedByParent.set(p => p + 1);
        }, 0)
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(2);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(104);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(2);
});
