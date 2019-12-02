import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../UseStateLink';

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
            field1: 0,
            field2: 'str'
        }]).with(() => ({
            id: TestPlugin,
            instanceFactory: () => ({
                onInit() {
                    messages.push('onInit called')
                },
                onPreset() {
                    messages.push('onPreset called')
                },
                onSet() {
                    messages.push('onSet called')
                },
                onDestroy() {
                    messages.push('onDestroy called')
                },
                onExtension() {
                    messages.push('onExtension called')
                }
            })
        }))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onInit called'])
    expect(result.current.nested[0].get().field1).toStrictEqual(0);
    expect(messages).toEqual(['onInit called'])

    act(() => {
        result.current.nested[0].nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onPreset called', 'onSet called'])

    expect(result.current.get()[0].field1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['field1', 'field2']);
    expect(messages.slice(3)).toEqual([])
    
    act(() => {
        result.current.nested[0].merge(p => ({ field1 : p.field1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(3)).toEqual(['onPreset called', 'onSet called'])

    expect(result.current.get()[0].field1).toStrictEqual(2);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['field1', 'field2']);
    expect(messages.slice(5)).toEqual([]);

    (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
    expect(messages.slice(5)).toEqual(['onExtension called']);

    expect(() => result.current.with(TestPluginUnknown))
    .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateRef or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

    unmount()
    expect(messages.slice(6)).toEqual(['onDestroy called'])

    expect(result.current.get()[0].field1).toStrictEqual(2);
    expect(messages.slice(7)).toEqual([])

    // TODO setting the state after destroy should not be allowed
    act(() => {
        result.current.nested[0].nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(7)).toEqual(['onPreset called', 'onSet called'])
});
