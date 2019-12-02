import { useStateLink, createStateLink, useStateLinkUnmounted, None, StateMemo } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via statememo', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200,
            fieldUsedByChildCompensate: 0
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current, StateMemo(
            l => l.value.fieldUsedByBoth + l.value.fieldUsedByChild + l.value.fieldUsedByChildCompensate))
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(300);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(301);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    // again
    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(3);

    // should not rerender when sum is not changed:
    act(() => {
        parent.result.current.merge(p => ({
            fieldUsedByChild: p.fieldUsedByChild + 1,
            fieldUsedByChildCompensate: p.fieldUsedByChildCompensate - 1
        }));
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(3);

    act(() => {
        parent.result.current.nested.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(3);

    act(() => {
        parent.result.current.nested.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(3);
    expect(childRenderTimes).toStrictEqual(3);
});

test('object: should not rerender used after unmount', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200,
            fieldUsedByChildCompensate: 0
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current, StateMemo(
            l => l.value.fieldUsedByBoth + l.value.fieldUsedByChild + l.value.fieldUsedByChildCompensate))
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(300);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(301);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    // again
    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(3);

    // should not rerender when sum is not changed:
    act(() => {
        parent.result.current.merge(p => ({
            fieldUsedByChild: p.fieldUsedByChild + 1,
            fieldUsedByChildCompensate: p.fieldUsedByChildCompensate - 1
        }));
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(302);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(3);
    
    // again
    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(303);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(4);
    
    child.unmount()
    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current).toStrictEqual(303);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(4);
});
