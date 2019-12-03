import { useStateLink, createStateLink, useStateLinkUnmounted, None, Downgraded } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('primitive: should rerender used on promise resolve', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    const promise = new Promise<number>(resolve => setTimeout(() => {
        resolve(100)
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
        
    await act(async () => {
        await promise;
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(100);
});

test('primitive: should rerender used on promise resolved', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    const promise = Promise.resolve(100)
    act(() => {
        result.current.set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
        
    await act(async () => {
        await promise;
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(100);
});

test('primitive: should rerender used on promise reject', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    const promise = new Promise<number>((resolve, reject) => setTimeout(() => {
        reject('some error')
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
    
    await act(async () => {
        try {
            await promise;
        } catch (err) {
            // ignore
        }
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual('some error');
    expect(() => result.current.value).toThrow('some error');
});

test('primitive: should rerender used on promise rejected', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toStrictEqual(0);

    const promise = Promise.reject('some error')
    act(() => {
        result.current.set(promise);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    
    await act(async () => {
        try {
            await promise;
        } catch (err) {
            // ignore
        }
    })
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual('some error');
    expect(() => result.current.value).toThrow('some error');
});

test('primitive: should rerender used on promise resolve init', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(new Promise<number>(resolve => setTimeout(() => {
            resolve(100)
        }, 500)))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500));
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(100);
});

test('primitive: should rerender used on promise reject init', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(new Promise<number>((resolve, reject) => setTimeout(() => {
            reject('some error')
        }, 500)))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.promised).toStrictEqual(true);
    expect(() => result.current.error)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');
    expect(() => result.current.value)
        .toThrow('StateLink is used incorrectly. Attempted \'read promised state\' at \'/\'');

    await act(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500));
    })
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.promised).toStrictEqual(false);
    expect(result.current.error).toEqual('some error');
    expect(() => result.current.value).toThrow('some error');
});