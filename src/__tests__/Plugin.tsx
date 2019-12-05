import { useStateLink, createStateLink } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

const TestPlugin = Symbol('TestPlugin')
const TestPluginUnknown = Symbol('TestPluginUnknown')

test('plugin: common flow callbacks', async () => {
    let renderTimes = 0
    const messages: string[] = []
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useStateLink([{
            f1: 0,
            f2: 'str'
        }]).with(() => ({
            id: TestPlugin,
            instanceFactory: () => ({
                onInit() {
                    messages.push('onInit called')
                },
                onPreset: (path, state, newValue, prevValue, mergeValue) => {
                    messages.push(`onPreset called, [${path}]: ${JSON.stringify(state)}, ${JSON.stringify(prevValue)} => ${JSON.stringify(newValue)}, ${JSON.stringify(mergeValue)}`)
                },
                onSet: (path, state, newValue, prevValue, mergeValue) => {
                    messages.push(`onSet called, [${path}]: ${JSON.stringify(state)}, ${JSON.stringify(prevValue)} => ${JSON.stringify(newValue)}, ${JSON.stringify(mergeValue)}`)
                },
                onDestroy: (state) => {
                    messages.push(`onDestroy called, ${JSON.stringify(state)}`)
                },
                onExtension() {
                    messages.push('onExtension called')
                }
            })
        }))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onInit called'])
    expect(result.current.nested[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onInit called'])

    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onPreset called, [0,f1]: [{\"f1\":0,\"f2\":\"str\"}], 0 => 1, undefined', 'onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([])
    
    act(() => {
        result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(3)).toEqual(['onPreset called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}', 'onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(5)).toEqual([]);

    (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
    expect(messages.slice(5)).toEqual(['onExtension called']);

    expect(() => result.current.with(TestPluginUnknown))
    .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

    unmount()
    expect(messages.slice(6)).toEqual(['onDestroy called, [{\"f1\":2,\"f2\":\"str\"}]'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(messages.slice(7)).toEqual([])

    act(() => {
        expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
            'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
        );
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(7)).toEqual([])
});

const stateInf = createStateLink([{
    f1: 0,
    f2: 'str'
}], l => l)

test('plugin: common flow callbacks global state', async () => {
    const messages: string[] = []
    stateInf.with(() => ({
        id: TestPlugin,
        instanceFactory: (initial, instanceFactory) => ({
            onInit() {
                messages.push(`onInit called, initial: ${JSON.stringify(initial)}, value: ${JSON.stringify(instanceFactory().value)}`)
            },
            onPreset: (path, state, newValue, prevValue, mergeValue) => {
                messages.push(`onPreset called, [${path}]: ${JSON.stringify(state)}, ${JSON.stringify(prevValue)} => ${JSON.stringify(newValue)}, ${JSON.stringify(mergeValue)}`)
            },
            onSet: (path, state, newValue, prevValue, mergeValue) => {
                messages.push(`onSet called, [${path}]: ${JSON.stringify(state)}, ${JSON.stringify(prevValue)} => ${JSON.stringify(newValue)}, ${JSON.stringify(mergeValue)}`)
            },
            onDestroy: (state) => {
                messages.push(`onDestroy called, ${JSON.stringify(state)}`)
            },
            onExtension() {
                messages.push('onExtension called')
            }
        })
    }))
    
    let renderTimes = 0
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(stateInf)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}], value: [{\"f1\":0,\"f2\":\"str\"}]'])
    expect(result.current.nested[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}], value: [{\"f1\":0,\"f2\":\"str\"}]'])

    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onPreset called, [0,f1]: [{\"f1\":0,\"f2\":\"str\"}], 0 => 1, undefined', 'onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([])
    
    act(() => {
        result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(3)).toEqual(['onPreset called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}', 'onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(5)).toEqual([]);

    (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
    expect(messages.slice(5)).toEqual(['onExtension called']);

    expect(() => result.current.with(TestPluginUnknown))
    .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

    unmount()
    expect(messages.slice(6)).toEqual([])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(messages.slice(6)).toEqual([])

    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1)
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(6)).toEqual(['onPreset called, [0,f1]: [{\"f1\":2,\"f2\":\"str\"}], 2 => 3, undefined', 'onSet called, [0,f1]: [{\"f1\":3,\"f2\":\"str\"}], 2 => 3, undefined'])
    
    stateInf.destroy()
    expect(messages.slice(8)).toEqual(['onDestroy called, [{\"f1\":3,\"f2\":\"str\"}]'])

    act(() => {
        expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
            'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
        );
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(9)).toEqual([])
});
