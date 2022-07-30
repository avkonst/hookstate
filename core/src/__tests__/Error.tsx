import { useHookstate } from '../';

import { renderHook } from '@testing-library/react-hooks';

test('error: should not allow set to another state value', async () => {
    const state1 = renderHook(() => {
        return useHookstate({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useHookstate({ prop2: [0, 0] })
    });

    expect(() => {
        state2.result.current.prop2.set(p => state1.result.current.get().prop1);
    // tslint:disable-next-line: max-line-length
    }).toThrow(`Error: HOOKSTATE-102 [path: /prop2]. See https://hookstate.js.org/docs/exceptions#hookstate-102`);
});

test('error: should not allow create state from another state value', async () => {
    const state1 = renderHook(() => {
        return useHookstate({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useHookstate(state1.result.current.get().prop1)
    })

    expect(state2.result.error?.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`Error: HOOKSTATE-101 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-101`)
});

test('error: should not allow create state from another state value (nested)', async () => {
    const state1 = renderHook(() => {
        return useHookstate({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useHookstate(state1.result.current)
    })

    const state3 = renderHook(() => {
        return useHookstate(state2.result.current.prop1.get())
    })

    expect(state3.result.error?.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`Error: HOOKSTATE-101 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-101`)
});

test('error: should not allow serialization of statelink', async () => {
    const state1 = renderHook(() => {
        return useHookstate({ prop1: [0, 0] })
    });
    
    expect(() => JSON.stringify(state1))
    .toThrow('Error: HOOKSTATE-109 [path: /]. See https://hookstate.js.org/docs/exceptions#hookstate-109')
});
