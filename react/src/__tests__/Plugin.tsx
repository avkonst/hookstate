import { useState, createState, Plugin, self,
    DevToolsID, DevTools, DevToolsExtensions, PluginCallbacks } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

const TestPlugin = Symbol('TestPlugin')
const TestPluginUnknown = Symbol('TestPluginUnknown')

test('plugin: common flow callbacks', async () => {
    let renderTimes = 0
    const messages: string[] = []
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useState([{
            f1: 0,
            f2: 'str'
        }])[self].attach(() => ({
            id: TestPlugin,
            init: () => {
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

    expect(DevTools(result.current).label('should not be labelled')).toBeUndefined();
    expect(DevTools(result.current).log('should not be logged')).toBeUndefined();

    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onInit called'])
    expect(result.current[0][self].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onInit called'])

    act(() => {
        result.current[self].set([{ f1: 0, f2: 'str2' }]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, []: [{\"f1\":0,\"f2\":\"str2\"}], [{\"f1\":0,\"f2\":\"str\"}] => [{\"f1\":0,\"f2\":\"str2\"}], undefined'])

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str2');
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])

    act(() => {
        result.current[0].f1[self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str2\"}], 0 => 1, undefined'])

    expect(result.current[self].get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([])

    act(() => {
        result.current[0][self].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(3)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str2\"}], {\"f1\":2,\"f2\":\"str2\"} => {\"f1\":2,\"f2\":\"str2\"}, {\"f1\":2}'])

    expect(result.current[self].get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(4)).toEqual([]);

    (result.current[self].attach(TestPlugin)[0] as { onExtension(): void; }).onExtension();
    expect(messages.slice(4)).toEqual(['onExtension called']);

    result.current[self].map((s) => {
        messages.push(`batch executed, state: ${JSON.stringify(s[self].get())}`)
    }, 'custom context')
    expect(messages.slice(5)).toEqual(['onBatchStart called, []: [{\"f1\":2,\"f2\":\"str2\"}], context: \"custom context\"', 'batch executed, state: [{\"f1\":2,\"f2\":\"str2\"}]', 'onBatchFinish called, []: [{\"f1\":2,\"f2\":\"str2\"}], context: \"custom context\"'])
    expect(result.current[self].attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

    expect(result.current[self].get()[0].f1).toStrictEqual(2);
    expect(result.current[self].get()[0].f2).toStrictEqual('str2');
    const controls = result.current[self].attach(TestPlugin)[1];
    expect(renderTimes).toStrictEqual(4);
    act(() => {
        controls.setUntracked([{ f1: 0, f2: 'str3' }])
    })
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(8)).toEqual(['onSet called, []: [{\"f1\":0,\"f2\":\"str3\"}], [{\"f1\":2,\"f2\":\"str2\"}] => [{\"f1\":0,\"f2\":\"str3\"}], undefined']);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3');
    expect(renderTimes).toStrictEqual(4);
    const controlsNested = result.current[0].f2[self].attach(TestPlugin)[1];
    act(() => {
        controlsNested.mergeUntracked('str2')
    })
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(9)).toEqual(
        ['onSet called, [0,f2]: [{"f1":0,"f2":"str3str2"}], "str3" => "str3str2", "str2"']);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        controlsNested.rerender([[0, 'f1'], [0, 'f2']])
    })
    expect(renderTimes).toStrictEqual(5);
    expect(messages.slice(10)).toEqual([]);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        controlsNested.rerender([[0, 'unknown'], [0, 'f2']])
    })
    expect(renderTimes).toStrictEqual(6);
    expect(messages.slice(10)).toEqual([]);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        controlsNested.rerender([[0, 'unknown'], [1]])
    })
    expect(renderTimes).toStrictEqual(7);
    expect(messages.slice(10)).toEqual([]);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        controlsNested.rerender([[0, 'unknown']])
    })
    expect(renderTimes).toStrictEqual(7);
    expect(messages.slice(10)).toEqual([]);

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(result.current[self].get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        controlsNested.rerender([[0]])
    })
    expect(renderTimes).toStrictEqual(8);
    expect(messages.slice(10)).toEqual([]);

    unmount()
    expect(messages.slice(10)).toEqual(['onDestroy called, [{\"f1\":0,\"f2\":\"str3str2\"}]'])

    expect(result.current[self].get()[0].f1).toStrictEqual(0);
    expect(messages.slice(11)).toEqual([])

    act(() => {
        expect(() => result.current[0].f1[self].set(p => p + 1)).toThrow(
            'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
        );
    });
    expect(renderTimes).toStrictEqual(8);
    expect(messages.slice(11)).toEqual([])
});

const stateInf = createState([{
    f1: 0,
    f2: 'str'
}])

test('plugin: common flow callbacks global state', async () => {
    const messages: string[] = []
    stateInf[self].attach(() => ({
        id: TestPlugin,
        init: (state) => {
            messages.push(`onInit called, initial: ${JSON.stringify(state[self].get())}`)
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
        return useState(stateInf)
    });

    expect(DevTools(result.current).label('should not be labelled')).toBeUndefined();
    expect(DevTools(result.current).log('should not be logged')).toBeUndefined();

    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])
    expect(result.current[0][self].get().f1).toStrictEqual(0);
    expect(messages).toEqual(
        ['onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])

    act(() => {
        result.current[0].f1[self].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

    expect(result.current[self].get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])

    act(() => {
        result.current[0][self].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

    expect(result.current[self].get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([]);

    (result.current[self].attach(TestPlugin)[0] as { onExtension(): void; }).onExtension();
    expect(messages.slice(3)).toEqual(['onExtension called']);

    expect(result.current[self].attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

    unmount()
    expect(messages.slice(4)).toEqual([])

    expect(result.current[self].get()[0].f1).toStrictEqual(2);
    expect(messages.slice(4)).toEqual([])

    act(() => {
        result.current[0].f1[self].set(p => p + 1)
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(4)).toEqual(['onSet called, [0,f1]: [{\"f1\":3,\"f2\":\"str\"}], 2 => 3, undefined'])

    stateInf[self].destroy()
    expect(messages.slice(5)).toEqual(['onDestroy called, [{\"f1\":3,\"f2\":\"str\"}]'])

    act(() => {
        expect(() => result.current[0].f1[self].set(p => p + 1)).toThrow(
            'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
        );
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(6)).toEqual([])
});

test('plugin: common flow callbacks devtools', async () => {
    const messages: string[] = []
    useState[DevToolsID] = () => ({
        id: DevToolsID,
        init: (l) => {
            let label: string | undefined = undefined;
            messages.push(`${label} onInit called`)
            return {
                label: (name) => {
                    label = name
                },
                log: (str, data) => {
                    messages.push(`${label} ${str}`)
                },
                onSet: (p) => {
                    messages.push(`${label} onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                },
                onDestroy: (p) => {
                    messages.push(`${label} onDestroy called, ${JSON.stringify(p.state)}`)
                }
            } as (PluginCallbacks & DevToolsExtensions);
        }
    } as Plugin)

    try {
        let renderTimes = 0
        const { result, unmount } = renderHook(() => {
            renderTimes += 1;
            return useState([{
                f1: 0,
                f2: 'str'
            }])
        });
        DevTools(result.current).label('LABELLED')
        
        expect(renderTimes).toStrictEqual(1);
        expect(messages).toEqual(['undefined onInit called'])
        expect(result.current[0][self].get().f1).toStrictEqual(0);
        expect(messages).toEqual(['undefined onInit called'])
        
        act(() => {
            result.current[0].f1[self].set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['LABELLED onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

        expect(result.current[self].get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])

        act(() => {
            result.current[0][self].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['LABELLED onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

        expect(result.current[self].get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        DevTools(result.current).log('onExtension called');
        expect(messages.slice(3)).toEqual(['LABELLED onExtension called']);

        expect(result.current[self].attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

        unmount()
        expect(messages.slice(4)).toEqual(['LABELLED onDestroy called, [{\"f1\":2,\"f2\":\"str\"}]'])

        expect(result.current[self].get()[0].f1).toStrictEqual(2);
        expect(messages.slice(5)).toEqual([])

        act(() => {
            expect(() => result.current[0].f1[self].set(p => p + 1)).toThrow(
                'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
            );
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(5)).toEqual([])

    } finally {
        delete useState[DevToolsID];
    }
});

test('plugin: common flow callbacks global state devtools', async () => {
    const messages: string[] = []
    createState[DevToolsID] = () => ({
        id: DevToolsID,
        init: (state) => {
            let label: string | undefined = undefined;
            messages.push(`${label} onInit called, initial: ${JSON.stringify(state[self].get())}`)
            return {
                log: (m, d) => {
                    messages.push(`${label} ${m}`)
                },
                label: (l) => {
                    label = l;
                },
                onSet: (p) => {
                    messages.push(`onSet called, [${p.path}]: ${JSON.stringify(p.state)}, ${JSON.stringify(p.previous)} => ${JSON.stringify(p.value)}, ${JSON.stringify(p.merged)}`)
                },
                onDestroy: (p) => {
                    messages.push(`onDestroy called, ${JSON.stringify(p.state)}`)
                }
            } as PluginCallbacks & DevToolsExtensions;
        }
    } as Plugin)

    try {
        const stateRef = createState([{
            f1: 0,
            f2: 'str'
        }])

        let renderTimes = 0
        const { result, unmount } = renderHook(() => {
            renderTimes += 1;
            return useState(stateRef)
        });
        expect(renderTimes).toStrictEqual(1);
        expect(messages).toEqual(
            ['undefined onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])
        expect(result.current[0][self].get().f1).toStrictEqual(0);
        expect(messages).toEqual(
            ['undefined onInit called, initial: [{\"f1\":0,\"f2\":\"str\"}]'])

        act(() => {
            result.current[0].f1[self].set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{\"f1\":1,\"f2\":\"str\"}], 0 => 1, undefined'])

        expect(result.current[self].get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])

        act(() => {
            result.current[0][self].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['onSet called, [0]: [{\"f1\":2,\"f2\":\"str\"}], {\"f1\":2,\"f2\":\"str\"} => {\"f1\":2,\"f2\":\"str\"}, {\"f1\":2}'])

        expect(result.current[self].get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current[self].get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        DevTools(result.current).log('onExtension called');
        expect(messages.slice(3)).toEqual(['undefined onExtension called']);

        DevTools(result.current).label('LABELLED2')
        DevTools(result.current).log('onExtension called');
        expect(messages.slice(4)).toEqual(['LABELLED2 onExtension called']);

        expect(result.current[self].attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

        unmount()
        expect(messages.slice(5)).toEqual([])

        expect(result.current[self].get()[0].f1).toStrictEqual(2);
        expect(messages.slice(5)).toEqual([])

        act(() => {
            result.current[0].f1[self].set(p => p + 1)
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(5)).toEqual(['onSet called, [0,f1]: [{\"f1\":3,\"f2\":\"str\"}], 2 => 3, undefined'])

        stateRef[self].destroy()
        expect(messages.slice(6)).toEqual(['onDestroy called, [{\"f1\":3,\"f2\":\"str\"}]'])

        act(() => {
            expect(() => result.current[0].f1[self].set(p => p + 1)).toThrow(
                'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
            );
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(7)).toEqual([])
    } finally {
        delete createState[DevToolsID]
    }
});
