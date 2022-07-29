import { useState, createHookstate, Plugin, DevToolsID, DevTools, DevToolsExtensions, PluginCallbacks, useHookstate, extend, StateValueAtPath, State, Extension, SetActionDescriptor, StateErrorAtRoot, StateValue, StateMethodsDestroy } from '../';

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
    
    onCreate: Extension<MyExtensionMethods>['onCreate'] = (sf, em) => {
        expect(em).toBeDefined()
        this.messages.push('onCreate called')
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
    onInit?: Extension<MyExtensionMethods>['onInit'] = (s) => {
        this.messages.push(`onInit called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}`)
    };
    onSet?: Extension<MyExtensionMethods>['onSet'] = (p, ad) => {
        this.messages.push(`onSet called, [${ad.path}]: ${JSON.stringify(p.get({ noproxy: true }))}, ${JSON.stringify(ad.actions)}`)
    };
    onPreset?: Extension<MyExtensionMethods>['onPreset'] = (s, v) => {
        this.messages.push(`onPreset called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}, ${JSON.stringify(v)}`)
    };
    onPremerge?: Extension<MyExtensionMethods>['onPremerge'] = (s, v) => {
        this.messages.push(`onPremerge called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}, ${JSON.stringify(v)}`)
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
        }], extend(() => MyExtension(messages)))
    });

    expect(DevTools(result.current).label('should not be labelled')).toBeUndefined();
    expect(DevTools(result.current).log('should not be logged')).toBeUndefined();

    expect(renderTimes).toStrictEqual(1);
    expect(messages).toEqual(['onCreate called', 'onInit called, []: [{\"f1\":0,\"f2\":\"str\"}]'])
    expect(result.current[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onCreate called', 'onInit called, []: [{\"f1\":0,\"f2\":\"str\"}]'])
    messages.splice(0, messages.length);

    act(() => {
        result.current.set([{ f1: 0, f2: 'str2' }]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages).toEqual([
        'onPreset called, []: [{\"f1\":0,\"f2\":\"str\"}], [{\"f1\":0,\"f2\":\"str2\"}]',
        'onSet called, []: [{"f1":0,"f2":"str2"}], undefined'])
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);

    act(() => {
        result.current[0].f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages).toEqual([
        'onPreset called, [0,f1]: 0, 1', 'onSet called, [0,f1]: [{"f1":1,"f2":"str2"}], undefined'])
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);

    act(() => {
        result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages).toEqual([
        'onPremerge called, [0]: {\"f1\":1,\"f2\":\"str2\"}, {\"f1\":2}',
        'onPreset called, [0]: {\"f1\":2,\"f2\":\"str2\"}, {\"f1\":2,\"f2\":\"str2\"}',
        'onSet called, [0]: [{"f1":2,"f2":"str2"}], {"f1":"U"}'])
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([]);
    messages.splice(0, messages.length);

    expect(result.current.extensionMethod()).toEqual(1)
    expect(messages).toEqual(['onExtension called: ']);
    messages.splice(0, messages.length);

    expect(result.current[0].f1.extensionMethod()).toEqual(1)
    expect(messages).toEqual(['onExtension called: 0/f1']);
    messages.splice(0, messages.length);

    expect(result.current[0].f2.extensionProp === result.current[0].f2).toBeTruthy()
    expect(messages).toEqual(['onExtensionProp called: 0/f2']);
    messages.splice(0, messages.length);

    expect(result.current[0].f1.extensionProp.value === result.current[0].f1.value).toBeTruthy()
    expect(messages).toEqual(['onExtensionProp called: 0/f1']);
    messages.splice(0, messages.length);

    expect(result.current.extensionMethodWithArg((v) => v[0].f1)).toEqual(2)
    expect(messages).toEqual(['onExtensionWithArg called: , cb: 2']);
    messages.splice(0, messages.length);

    expect(result.current[0].f1.extensionMethodWithArg(v => v)).toEqual(2)
    expect(messages).toEqual(['onExtensionWithArg called: 0/f1, cb: 2']);
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(renderTimes).toStrictEqual(4);
    act(() => {
        result.current.set([{ f1: 0, f2: 'str3' }])
    })
    expect(renderTimes).toStrictEqual(5);
    expect(messages).toEqual([
        'onPreset called, []: [{\"f1\":2,\"f2\":\"str2\"}], [{\"f1\":0,\"f2\":\"str3\"}]',
        'onSet called, []: [{"f1":0,"f2":"str3"}], undefined']);
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str3');
    expect(renderTimes).toStrictEqual(5);
    act(() => {
        result.current[0].f2.merge('str2')
    })
    expect(renderTimes).toStrictEqual(6);
    expect(messages).toEqual(
        [
            'onPremerge called, [0,f2]: \"str3\", \"str2\"',
            'onPreset called, [0,f2]: \"str3\", \"str3str2\"',
            'onSet called, [0,f2]: [{"f1":0,"f2":"str3str2"}], undefined']);
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        result.current[0].f2.extensionMethodSetValue("str5")
    })
    expect(renderTimes).toStrictEqual(7);
    expect(result.current.get()[0].f2).toStrictEqual('str5');
    expect(messages).toEqual([
        'onPreset called, [0,f2]: \"str3str2\", \"str5\"',
        'onSet called, [0,f2]: [{"f1":0,"f2":"str5"}], undefined'])
    messages.splice(0, messages.length);

    expect(renderTimes).toStrictEqual(7);
    expect(messages).toEqual([]);
    messages.splice(0, messages.length);

    unmount()
    expect(messages).toEqual(['onDestroy called, [{"f1":0,"f2":"str5"}]'])
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);

    act(() => {
        expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
            'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
        );
    });
    expect(renderTimes).toStrictEqual(7);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);
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
    
    onCreate: Extension<MyExtensionMethodsGlobal>['onCreate'] = (sf) => {
        this.messages.push('onCreate called')
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
    onInit?: Extension<MyExtensionMethods>['onInit'] = (s) => {
        this.messages.push(`onInit called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}`)
    };
    onSet?: Extension<{}>['onSet'] = (p, ad) => {
        this.messages.push(`onSet called, [${ad.path}]: ${JSON.stringify(p.get({ noproxy: true }))}, ${JSON.stringify(ad.actions)}`)
    };
    onPreset?: Extension<MyExtensionMethods>['onPreset'] = (s, v) => {
        this.messages.push(`onPreset called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}, ${JSON.stringify(v)}`)
    };
    onPremerge?: Extension<MyExtensionMethods>['onPremerge'] = (s, v) => {
        this.messages.push(`onPremerge called, [${s.path}]: ${JSON.stringify(s.get({ noproxy: true }))}, ${JSON.stringify(v)}`)
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
    expect(messages).toEqual(['onCreate called', 'onInit called, []: [{\"f1\":0,\"f2\":\"str\"}]'])
    expect(result.current[0].get().f1).toStrictEqual(0);
    expect(messages).toEqual(['onCreate called', 'onInit called, []: [{\"f1\":0,\"f2\":\"str\"}]'])
    messages.splice(0, messages.length)
    
    act(() => {
        result.current.set([{ f1: 0, f2: 'str2' }]);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(messages).toEqual([
        'onPreset called, []: [{\"f1\":0,\"f2\":\"str\"}], [{\"f1\":0,\"f2\":\"str2\"}]',
        'onSet called, []: [{"f1":0,"f2":"str2"}], undefined'])
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([])

    act(() => {
        result.current[0].f1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(messages).toEqual([
        'onPreset called, [0,f1]: 0, 1', 'onSet called, [0,f1]: [{"f1":1,"f2":"str2"}], undefined'])
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f1).toStrictEqual(1);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([])
    messages.splice(0, messages.length)

    act(() => {
        result.current[0].merge(p => ({ f1 : p.f1 + 1 }));
    });
    expect(renderTimes).toStrictEqual(4);
    expect(messages).toEqual([
        'onPremerge called, [0]: {\"f1\":1,\"f2\":\"str2\"}, {\"f1\":2}',
        'onPreset called, [0]: {\"f1\":2,\"f2\":\"str2\"}, {\"f1\":2,\"f2\":\"str2\"}',
        'onSet called, [0]: [{"f1":2,"f2":"str2"}], {"f1":"U"}'])
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(Object.keys(result.current[0])).toEqual(['f1', 'f2']);
    expect(Object.keys(result.current.get()[0])).toEqual(['f1', 'f2']);
    expect(messages).toEqual([]);
    messages.splice(0, messages.length)

    expect(result.current.extensionMethod()).toEqual(1)
    expect(messages).toEqual(['onExtension called: ']);
    messages.splice(0, messages.length)

    expect(result.current[0].f1.extensionMethod()).toEqual(1)
    expect(messages).toEqual(['onExtension called: 0/f1']);
    messages.splice(0, messages.length)

    expect(result.current[0].f2.extensionProp === result.current[0].f2).toBeTruthy()
    expect(messages).toEqual(['onExtensionProp called: 0/f2']);
    messages.splice(0, messages.length)

    expect(result.current[0].f1.extensionProp.value === result.current[0].f1.value).toBeTruthy()
    expect(messages).toEqual(['onExtensionProp called: 0/f1']);
    messages.splice(0, messages.length)

    expect(result.current.extensionMethodWithArg((v) => v[0].f1)).toEqual(2)
    expect(messages).toEqual(['onExtensionWithArg called: , cb: 2']);
    messages.splice(0, messages.length)

    expect(result.current[0].f1.extensionMethodWithArg(v => v)).toEqual(2)
    expect(messages).toEqual(['onExtensionWithArg called: 0/f1, cb: 2']);
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f1).toStrictEqual(2);
    expect(result.current.get()[0].f2).toStrictEqual('str2');
    expect(renderTimes).toStrictEqual(4);
    act(() => {
        result.current.set([{ f1: 0, f2: 'str3' }])
    })
    expect(renderTimes).toStrictEqual(5);
    expect(messages).toEqual([
        'onPreset called, []: [{\"f1\":2,\"f2\":\"str2\"}], [{\"f1\":0,\"f2\":\"str3\"}]',
        'onSet called, []: [{"f1":0,"f2":"str3"}], undefined']);
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(result.current.get()[0].f2).toStrictEqual('str3');
    expect(renderTimes).toStrictEqual(5);
    act(() => {
        result.current[0].f2.merge('str2')
    })
    expect(renderTimes).toStrictEqual(6);
    expect(messages).toEqual(
        [
            'onPremerge called, [0,f2]: \"str3\", \"str2\"',
            'onPreset called, [0,f2]: \"str3\", \"str3str2\"',
            'onSet called, [0,f2]: [{"f1":0,"f2":"str3str2"}], undefined']);
    messages.splice(0, messages.length)

    expect(result.current.get()[0].f2).toStrictEqual('str3str2');
    act(() => {
        result.current[0].f2.extensionMethodSetValue("str5")
    })
    expect(renderTimes).toStrictEqual(7);
    expect(result.current.get()[0].f2).toStrictEqual('str5');
    expect(messages).toEqual([
        'onPreset called, [0,f2]: \"str3str2\", \"str5\"',
        'onSet called, [0,f2]: [{"f1":0,"f2":"str5"}], undefined'])
    messages.splice(0, messages.length)

    expect(renderTimes).toStrictEqual(7);
    expect(messages).toEqual([]);
    messages.splice(0, messages.length)

    unmount()
    expect(messages).toEqual([]);
    messages.splice(0, messages.length);

    (stateInf as unknown as StateMethodsDestroy).destroy()
    expect(messages).toEqual(['onDestroy called, [{"f1":0,"f2":"str5"}]'])
    messages.splice(0, messages.length);

    expect(result.current.get()[0].f1).toStrictEqual(0);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);

    act(() => {
        expect(() => result.current[0].f1.set(p => p + 1)).toThrow(
            'Error: HOOKSTATE-106 [path: /0/f1]. See https://hookstate.js.org/docs/exceptions#hookstate-106'
        );
    });
    expect(renderTimes).toStrictEqual(7);
    expect(messages).toEqual([])
    messages.splice(0, messages.length);
});
