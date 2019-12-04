import { useStateLink, createStateLink, useStateLinkUnmounted, None } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('error: should not allow set to another state value', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink({ prop2: [0, 0] })
    });

    expect(() => {
        state2.result.current.nested.prop2.set(
            p => state1.result.current.get().prop1);
    // tslint:disable-next-line: max-line-length
    }).toThrow(`StateLink is used incorrectly. Attempted 'set(state.get() at '/prop1')' at '/prop2'. Hint: did you mean to use state.set(lodash.cloneDeep(value)) instead of state.set(value)?`);
});

test('error: should not allow create state from another state value', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink(state1.result.current.get().prop1)
    })

    expect(state2.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/prop1')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)
});

test('error: should not allow create state from another state value (nested)', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    const state2 = renderHook(() => {
        return useStateLink(state1.result.current.nested)
    })

    expect(state2.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)

    const state3 = renderHook(() => {
        return useStateLink(state1.result.current.nested.prop1.nested)
    })

    expect(state3.result.error.message)
        // tslint:disable-next-line: max-line-length
        .toEqual(`StateLink is used incorrectly. Attempted 'create/useStateLink(state.get() at '/prop1')' at '/'. Hint: did you mean to use create/useStateLink(state) OR create/useStateLink(lodash.cloneDeep(state.get())) instead of create/useStateLink(state.get())?`)
});

test('error: should not allow serialization of statelink', async () => {
    const state1 = renderHook(() => {
        return useStateLink({ prop1: [0, 0] })
    });

    expect(() => JSON.stringify(state1))
    .toThrow('StateLink is used incorrectly. Attempted \'toJSON()\' at \'/\'. Hint: did you mean to use JSON.stringify(state.get()) instead of JSON.stringify(state)?')
});
