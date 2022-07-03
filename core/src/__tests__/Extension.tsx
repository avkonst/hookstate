import { useState, createState, Plugin, DevToolsID, DevTools, DevToolsExtensions, PluginCallbacks, useHookstate, extend, StateValueAtPath, State, Extension, SetActionDescriptor, StateErrorAtRoot, StateValue, createHookstate } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

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

interface MyExtensionMethodsGlobal {
    extensionMethod(): number,
    extensionMethodWithArg(cb: (v: StateValue<this>) => number): number,
    extensionMethodSetValue(v: StateValue<this>): void,
    extensionProp: this,
    messages: string[],
}

function MyExtensionGlobal() {
    return new MyExtensionGlobalImpl([]) as Extension<MyExtensionMethodsGlobal>
}

class MyExtensionGlobalImpl implements Extension<MyExtensionMethods> {
    constructor(private messages: string[]) {}
    
    onInit: Extension<MyExtensionMethodsGlobal>['onInit'] = (sf) => {
        this.messages.push('onInit called')
        let messages = this.messages;
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
            },
            messages: (s) => {
                return messages
            }
        }
    };
    onSet?: Extension<{}>['onSet'] = (p, ad) => {
        this.messages.push(`onSet called, [${ad.path}]: ${JSON.stringify(p.get({ noproxy: true }))}, ${JSON.stringify(ad.actions)}`)
    };
    onDestroy?: Extension<{}>['onDestroy'] = (p) => {
        this.messages.push(`onDestroy called, ${JSON.stringify(p.get({ noproxy: true }))}`)
    };
}

const stateInf = createHookstate([{
    f1: 0,
    f2: 'str'
}], () => MyExtensionGlobal())

test('extension: common flow callbacks global state', async () => {
    let renderTimes = 0
    const { result, unmount } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(stateInf)
    });
    const messages: string[] = result.current.messages;

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
    expect(messages.slice(13)).toEqual([])

    stateInf.destroy()
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
