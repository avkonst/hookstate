import { useState, createState, None, self } from '../../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used on promise resolve', async () => {
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
    expect(() => result.current[self].map(() => false, (s) => s[self].keys, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    expect(() => result.current[self].set(200))
        .toThrow('StateLink is used incorrectly. Attempted \'write promised state\' at \'/\'')
        
    await act(async () => {
        await promise;
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(100);
});

test('primitive: should rerender used on promise resolve manual', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(None)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    act(() => {
        result.current[self].set(100);
    });

    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(100);
});

test('primitive: should rerender used on promise resolve second', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(new Promise<number>(resolve => setTimeout(() => {
            act(() => resolve(100))
        }, 500)))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    const promise = new Promise<number>(resolve => setTimeout(() => {
        act(() => resolve(200))
    }, 500))
    act(() => {
        result.current[self].set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await promise;
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(200);
});

test('primitive: should rerender used on promise resolved', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual(0);

    const promise = Promise.resolve(100)
    act(() => {
        result.current[self].set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await promise;
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(100);
});

test('primitive: should rerender used on promise reject', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual(0);

    const promise = new Promise<number>((resolve, reject) => setTimeout(() => {
        act(() => reject('some error promise'))
    }, 500))
    act(() => {
        result.current[self].set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    try {
        await act(async () => {
            await promise
            return undefined
        });
    } catch (err) {
        // ignore
    }
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual('some error promise');
    expect(() => result.current[self].get()).toThrow('some error promise');
});

test('primitive: should rerender used on promise rejected', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].get()).toStrictEqual(0);

    const promise = Promise.reject('some error rejected')
    act(() => {
        result.current[self].set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        try {
            await promise;
        } catch (err) {
            // ignore
        }
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual('some error rejected');
    expect(() => result.current[self].get()).toThrow('some error rejected');
});

test('primitive: should rerender used on promise resolve init', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(new Promise<number>(resolve => setTimeout(() => {
            act(() => resolve(100))
        }, 500)))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await new Promise(resolve => setTimeout(() => act(() => resolve()), 600));
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(100);
});

test('primitive: should rerender used on promise resolve init global', async () => {
    let renderTimes = 0

    const stateInf = createState(new Promise<number>(resolve => setTimeout(() => {
        act(() => resolve(100))
    }, 500)))

    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(stateInf)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await new Promise(resolve => setTimeout(() => act(() => resolve()), 600));
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual(false);
    expect(result.current[self].get()).toEqual(100);
});

test('primitive: should rerender used on promise reject init global', async () => {
    let renderTimes = 0

    const stateInf = createState(new Promise<number>((resolve, reject) => setTimeout(() => {
        act(() => reject('some error init global'))
    }, 500)))

    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(stateInf)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(true);
    expect(() => result.current[self].map(() => false, (s) => s[self].value, e => e))
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current[self].get())
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    try {
        await act(async () => {
            await new Promise(resolve => setTimeout(() => act(() => resolve()), 600));
        })
    } catch (err) {
        //
    }
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[self].map(() => false, () => true)).toStrictEqual(false);
    expect(result.current[self].map(() => false, (s) => s[self].value, e => e)).toEqual('some error init global');
    expect(() => result.current[self].get()).toThrow('some error init global');
});
