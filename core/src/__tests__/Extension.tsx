import { useState, createState, Plugin, DevToolsID, DevTools, DevToolsExtensions, PluginCallbacks, useHookstate, extend, StateValueAtPath, State, Extension, SetActionDescriptor, StateErrorAtRoot, StateValue } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

const TestPlugin = Symbol('TestPlugin')
const TestPluginUnknown = Symbol('TestPluginUnknown')

interface MyExtensionMethods {
    extensionMethod(): number,
    extensionMethodWithArg(cb: (v: StateValue<this>) => number): number,
    extensionMethodSetValue(v: StateValue<this>): void,
    extensionProp: this
}

function MyExtension(messages: string[]) {
    return new MyExtensionImpl(messages) as Extension<MyExtensionMethods>
}


class MyExtensionImpl implements Extension<MyExtensionMethods> {
    constructor(private messages: string[]) {}
    
    onInit: Extension<MyExtensionMethods>['onInit'] = (sf) => {
        this.messages.push('onInit called')
        return {
            extensionMethod: (s) => {
                return () => this.messages.push(`onExtension called: ${s.path.join('/')}`)
            },
            extensionMethodWithArg: (s) => {
                return (cb) => {
                    let r = cb(s.value);
                    this.messages.push(`onExtensionWithArg called: ${s.path.join('/')}, cb: ${r}`)
                    return r;
                }
            },
            extensionMethodSetValue: (s) => {
                return (v) => s.set(v)
            },
            extensionProp: (s) => {
                this.messages.push(`onExtensionProp called: ${s.path.join('/')}`)
                return s as any
            }
        }
    };
    onSet?: Extension<MyExtensionMethods>['onSet'] = (p, ad) => {
        this.messages.push(`onSet called, [${ad.path}]: ${JSON.stringify(p.get({ noproxy: true }))}, ${JSON.stringify(ad.actions)}`)
    };
    onDestroy?: Extension<MyExtensionMethods>['onDestroy'] = (p) => {
        this.messages.push(`onDestroy called, ${JSON.stringify(p.get({ noproxy: true }))}`)
    };
}
    
test('extension: common flow callbacks', async () => {
    let renderTimes = 0
    const messages: string[] = []
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useHookstate([{
            f1: 0,
            f2: 'str'
        }], () => extend([MyExtension(messages)]))
    });

    expect(DevTools(result.current).label('should not be labelled')).toBeUndefined();
    expect(DevTools(result.current).log('should not be logged')).toBeUndefined();

    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onInit called'])
    expect(result.current[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onInit called'])

    act(() => {
        result.current.set([{ f1: 0, f2: 'str2' }]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, []: [{"f1":0,"f2":"str2"}], undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])

    act(() => {
        result.current[0].f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0,f1]: [{"f1":1,"f2":"str2"}], undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([])

    act(() => {
        result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages.slice(3)).toEqual(['onSet called, [0]: [{"f1":2,"f2":"str2"}], {"f1":"U"}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(4)).toEqual([]);

    expect(result.current.extensionMethod()).toEqual(5)
    expect(messages.slice(4)).toEqual(['onExtension called: ']);

    expect(result.current[0].f1.extensionMethod()).toEqual(6)
    expect(messages.slice(5)).toEqual(['onExtension called: 0/f1']);

    expect(result.current[0].f2.extensionProp === result.current[0].f2).toBeTruthy()
    expect(messages.slice(6)).toEqual(['onExtensionProp called: 0/f2']);

    expect(result.current[0].f1.extensionProp.value === result.current[0].f1.value).toBeTruthy()
    expect(messages.slice(7)).toEqual(['onExtensionProp called: 0/f1']);

    expect(result.current.extensionMethodWithArg((v) => v[0].f1)).toEqual(2)
    expect(messages.slice(8)).toEqual(['onExtensionWithArg called: , cb: 2']);

    expect(result.current[0].f1.extensionMethodWithArg(v => v)).toEqual(2)
    expect(messages.slice(9)).toEqual(['onExtensionWithArg called: 0/f1, cb: 2']);

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(renderTimes).toStrictEqual(4);
    act(() => {
        result.current.set([{ f1: 0, f2: 'str3' }])
    })
    expect(renderTimes).toStrictEqual(5);
    expect(messages.slice(10)).toEqual(['onSet called, []: [{"f1":0,"f2":"str3"}], undefined']);

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str3');
    expect(renderTimes).toStrictEqual(5);
    act(() => {
        result.current[0].f2.merge('str2')
    })
    expect(renderTimes).toStrictEqual(6);
    expect(messages.slice(11)).toEqual(
        ['onSet called, [0,f2]: [{"f1":0,"f2":"str3str2"}], undefined']);

    expect(result.current.get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        result.current[0].f2.extensionMethodSetValue("str5")
    })
    expect(renderTimes).toStrictEqual(7);
    expect(result.current.get()[0].f2).toStrictEqual('str5');
    expect(messages.slice(12)).toEqual(['onSet called, [0,f2]: [{"f1":0,"f2":"str5"}], undefined'])

    expect(renderTimes).toStrictEqual(7);
    expect(messages.slice(13)).toEqual([]);
    
    unmount()
    expect(messages.slice(13)).toEqual(['onDestroy called, [{"f1":0,"f2":"str5"}]'])

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(messages.slice(14)).toEqual([])

    act(() => {
        expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
            'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
        );
    });
    expect(renderTimes).toStrictEqual(7);
    expect(messages.slice(14)).toEqual([])
});

const stateInf = createState([{
    f1: 0,
    f2: 'str'
}])

test('plugin: common flow callbacks global state', async () => {
    const messages: string[] = []
    stateInf.attach(() => ({
        id: TestPlugin,
        init: (state) => {
            messages.push(`onInit called, initial: ${JSON.stringify(state.get())}`)
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
        ['onInit called, initial: [{"f1":0,"f2":"str"}]'])
    expect(result.current[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(
        ['onInit called, initial: [{"f1":0,"f2":"str"}]'])

    act(() => {
        result.current[0].f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{"f1":1,"f2":"str"}], 0 => 1, undefined'])

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(2)).toEqual([])

    act(() => {
        result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(2)).toEqual(['onSet called, [0]: [{"f1":2,"f2":"str"}], {"f1":2,"f2":"str"} => {"f1":2,"f2":"str"}, {"f1":2}'])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages.slice(3)).toEqual([]);

    (result.current.attach(TestPlugin)[0] as { onExtension(): void; }).onExtension();
    expect(messages.slice(3)).toEqual(['onExtension called']);

    expect(result.current.attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

    unmount()
    expect(messages.slice(4)).toEqual([])

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(messages.slice(4)).toEqual([])

    act(() => {
        result.current[0].f1.set(p => p + 1)
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages.slice(4)).toEqual(['onSet called, [0,f1]: [{"f1":3,"f2":"str"}], 2 => 3, undefined'])

    stateInf.destroy()
    expect(messages.slice(5)).toEqual(['onDestroy called, [{"f1":3,"f2":"str"}]'])

    act(() => {
        expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
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
        expect(result.current[0].get().f1).toStrictEqual(0);
        expect(messages).toEqual(['undefined onInit called'])
        
        act(() => {
            result.current[0].f1.set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['LABELLED onSet called, [0,f1]: [{"f1":1,"f2":"str"}], 0 => 1, undefined'])

        expect(result.current.get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])

        act(() => {
            result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['LABELLED onSet called, [0]: [{"f1":2,"f2":"str"}], {"f1":2,"f2":"str"} => {"f1":2,"f2":"str"}, {"f1":2}'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        DevTools(result.current).log('onExtension called');
        expect(messages.slice(3)).toEqual(['LABELLED onExtension called']);

        expect(result.current.attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

        unmount()
        expect(messages.slice(4)).toEqual(['LABELLED onDestroy called, [{"f1":2,"f2":"str"}]'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(messages.slice(5)).toEqual([])

        act(() => {
            expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
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
            messages.push(`${label} onInit called, initial: ${JSON.stringify(state.get())}`)
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
            ['undefined onInit called, initial: [{"f1":0,"f2":"str"}]'])
        expect(result.current[0].get().f1).toStrictEqual(0);
        expect(messages).toEqual(
            ['undefined onInit called, initial: [{"f1":0,"f2":"str"}]'])

        act(() => {
            result.current[0].f1.set(p => p + 1);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(messages.slice(1)).toEqual(['onSet called, [0,f1]: [{"f1":1,"f2":"str"}], 0 => 1, undefined'])

        expect(result.current.get()[0].f1).toStrictEqual(1);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(2)).toEqual([])

        act(() => {
            result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(2)).toEqual(['onSet called, [0]: [{"f1":2,"f2":"str"}], {"f1":2,"f2":"str"} => {"f1":2,"f2":"str"}, {"f1":2}'])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
        expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
        expect(messages.slice(3)).toEqual([]);

        DevTools(result.current).log('onExtension called');
        expect(messages.slice(3)).toEqual(['undefined onExtension called']);

        DevTools(result.current).label('LABELLED2')
        DevTools(result.current).log('onExtension called');
        expect(messages.slice(4)).toEqual(['LABELLED2 onExtension called']);

        expect(result.current.attach(TestPluginUnknown)[0] instanceof Error).toEqual(true)

        unmount()
        expect(messages.slice(5)).toEqual([])

        expect(result.current.get()[0].f1).toStrictEqual(2);
        expect(messages.slice(5)).toEqual([])

        act(() => {
            result.current[0].f1.set(p => p + 1)
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(5)).toEqual(['onSet called, [0,f1]: [{"f1":3,"f2":"str"}], 2 => 3, undefined'])

        stateRef.destroy()
        expect(messages.slice(6)).toEqual(['onDestroy called, [{"f1":3,"f2":"str"}]'])

        act(() => {
            expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
                'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
            );
        });
        expect(renderTimes).toStrictEqual(3);
        expect(messages.slice(7)).toEqual([])
    } finally {
        delete createState[DevToolsID]
    }
});
