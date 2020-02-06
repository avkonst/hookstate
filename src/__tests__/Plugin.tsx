import { useStateLink, createStateLink, Plugin } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import { DevTools } from '../UseStateLink';

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
            create: () => {
                messages.push('onInit called')
                return {
                    onBatchStart: (p) => {
                        messages.push(`onBatchStart called, [${p.path}]: ${JSON.stringify(p.state)}, context: ${JSON.stringify(p.context)}`)
                    },
                    onBatchFinish: (p) => {
                        messages.push(`onBatchFinish called, [${p.path}]: ${JSON.stringify(p.state)}, context: ${JSON.stringify(p.context)}`)
                    },
                    onSet: (p) => {
                        messages.push(`onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                    },
                    onDestroy: (p) => {
                        messages.push(`onDestroy called, ${JSON.stringify(p.state)}`)
                    },
                    onExtension() {
                        messages.push('onExtension called')
                    }
                }
            }
        }))
    });
    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onInit called'])
    expect(result.current.nested[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onInit called'])

    act(() => {
        result.current.set([{ f1: 0, f2: 'str2' }]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, []: [{\"f1\":0,\"f2\":\"str2\"}], [{\"f1\":0,\"f2\":\"str\"}] => [{\"f1\":0,\"f2\":\"str2\"}], undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])
    
    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str2\"}], 0 => 1, undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([])
    
    act(() => {
        result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(3)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str2\"}], {\"f1\":2,\"f2\":\"str2\"} => {\"f1\":2,\"f2\":\"str2\"}, {\"f1\":2}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(4)).toEqual([]);

    (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
    expect(messages.slice(4)).toEqual(['onExtension called']);

    result.current.batch((s) => {
        messages.push(`batch executed, state: ${JSON.stringify(s.value)}`)
    }, {
        context: 'custom context'
    })
    expect(messages.slice(5)).toEqual(['onBatchStart called, []: [{\"f1\":2,\"f2\":\"str2\"}], context: \"custom context\"', 'batch executed, state: [{\"f1\":2,\"f2\":\"str2\"}]', 'onBatchFinish called, []: [{\"f1\":2,\"f2\":\"str2\"}], context: \"custom context\"'])
    
    expect(() => result.current.with(TestPluginUnknown))
    .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

    unmount()
    expect(messages.slice(8)).toEqual(['onDestroy called, [{\"f1\":2,\"f2\":\"str2\"}]'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(messages.slice(9)).toEqual([])

    act(() => {
        expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
            'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
        );
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(9)).toEqual([])
});

const stateInf = createStateLink([{
    f1: 0,
    f2: 'str'
}], l => l)

test('plugin: common flow callbacks global state', async () => {
    const messages: string[] = []
    stateInf.with(() => ({
        id: TestPlugin,
        create: (state) => {
            messages.push(`onInit called, initial: ${JSON.stringify(state.value)}`)
            return {
                onSet: (p) => {
                    messages.push(`onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                },
                onDestroy: (p) => {
                    messages.push(`onDestroy called, ${JSON.stringify(p.state)}`)
                },
                onExtension() {
                    messages.push('onExtension called')
                }
            }
        }
    }))
    
    let renderTimes = 0
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(stateInf)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])
    expect(result.current.nested[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])

    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])
    
    act(() => {
        result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([]);

    (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
    expect(messages.slice(3)).toEqual(['onExtension called']);

    expect(() => result.current.with(TestPluginUnknown))
    .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

    unmount()
    expect(messages.slice(4)).toEqual([])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(messages.slice(4)).toEqual([])

    act(() => {
        result.current.nested[0].nested.f1.set(p => p + 1)
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(4)).toEqual(['onSet called, [0,f1]: [{\"f1\":3,\"f2\":\"str\"}], 2 => 3, undefined'])
    
    stateInf.destroy()
    expect(messages.slice(5)).toEqual(['onDestroy called, [{\"f1\":3,\"f2\":\"str\"}]'])

    act(() => {
        expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
            'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
        );
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(6)).toEqual([])
});

test('plugin: common flow callbacks devtools', async () => {
    const messages: string[] = []
    useStateLink[DevTools] = () => ({
        id: TestPlugin,
        create: () => {
            messages.push('onInit called')
            return {
                onSet: (p) => {
                    messages.push(`onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                },
                onDestroy: (p) => {
                    messages.push(`onDestroy called, ${JSON.stringify(p.state)}`)
                },
                onExtension() {
                    messages.push('onExtension called')
                }
            }
        }
    } as Plugin)
    
    try {
        let renderTimes = 0
        const { result, unmount } = renderHook(() => {
            renderTimes += 1;
            return useStateLink([{
                f1: 0,
                f2: 'str'
            }])
        });
        expect(renderTimes).toStrictEqual(1);
        expect(messages).toEqual(['onInit called'])
        expect(result.current.nested[0].get().f1).toStrictEqual(0);
        expect(messages).toEqual(['onInit called'])

        act(() => {
            result.current.nested[0].nested.f1.set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

        expect(result.current.get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])
        
        act(() => {
            result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
        expect(messages.slice(3)).toEqual(['onExtension called']);

        expect(() => result.current.with(TestPluginUnknown))
        .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

        unmount()
        expect(messages.slice(4)).toEqual(['onDestroy called, [{\"f1\":2,\"f2\":\"str\"}]'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(messages.slice(5)).toEqual([])

        act(() => {
            expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
                'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
            );
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(5)).toEqual([])
    
    } finally {
        delete useStateLink[DevTools];
    }
});

test('plugin: common flow callbacks global state devtools', async () => {
    const messages: string[] = []
    createStateLink[DevTools] = () => ({
        id: TestPlugin,
        create: (state) => {
            messages.push(`onInit called, initial: ${JSON.stringify(state.value)}`)
            return {
                onSet: (p) => {
                    messages.push(`onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                },
                onDestroy: (p) => {
                    messages.push(`onDestroy called, ${JSON.stringify(p.state)}`)
                },
                onExtension() {
                    messages.push('onExtension called')
                }
            }
        }
    } as Plugin)
    
    try {
        const stateRef = createStateLink([{
            f1: 0,
            f2: 'str'
        }], l => l)
        
        let renderTimes = 0
        const { result, unmount } = renderHook(() => {
            renderTimes += 1;
            return useStateLink(stateRef)
        });
        expect(renderTimes).toStrictEqual(1);
        expect(messages).toEqual(
            ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])
        expect(result.current.nested[0].get().f1).toStrictEqual(0);
        expect(messages).toEqual(
            ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])

        act(() => {
            result.current.nested[0].nested.f1.set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

        expect(result.current.get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])
        
        act(() => {
            result.current.nested[0].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current.nested[0].nested)).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        (result.current.with(TestPlugin)[1] as { onExtension(): void; }).onExtension();
        expect(messages.slice(3)).toEqual(['onExtension called']);

        expect(() => result.current.with(TestPluginUnknown))
        .toThrow('Plugin \'TestPluginUnknown\' has not been attached to the StateInf or StateLink. Hint: you might need to register the required plugin using \'with\' method. See https://github.com/avkonst/hookstate#plugins for more details')

        unmount()
        expect(messages.slice(4)).toEqual([])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(messages.slice(4)).toEqual([])

        act(() => {
            result.current.nested[0].nested.f1.set(p => p + 1)
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(4)).toEqual(['onSet called, [0,f1]: [{\"f1\":3,\"f2\":\"str\"}], 2 => 3, undefined'])
        
        stateRef.destroy()
        expect(messages.slice(5)).toEqual(['onDestroy called, [{\"f1\":3,\"f2\":\"str\"}]'])

        act(() => {
            expect(() => result.current.nested[0].nested.f1.set(p => p + 1)).toThrow(
                'StateLink is used incorrectly. Attempted \'set state for the destroyed state\' at \'/0/f1\'. Hint: make sure all asynchronous operations are cancelled (unsubscribed) when the state is destroyed. Global state is explicitly destroyed at \'StateInf.destroy()\'. Local state is automatically destroyed when a component is unmounted.'
            );
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(6)).toEqual([])
    } finally {
        delete createStateLink[DevTools]
    }
});