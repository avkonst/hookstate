import { useStateLink, createStateLink, useStateLinkUnmounted, None, Downgraded } from '../UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via scoped updates by child', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current)
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.nested.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.nested.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(parentRenderTimes).toStrictEqual(3);
    expect(childRenderTimes).toStrictEqual(2);
});

test('object: should rerender used via scoped updates by parent', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current)
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.nested.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.nested.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(parentRenderTimes).toStrictEqual(3);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(2);
});

test('object: should rerender used via scoped updates by parent (disabled tracking)', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useStateLink({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        }).with(Downgraded)
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useStateLink(parent.result.current)
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(3);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.nested.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.nested.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.nested.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.nested.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(parentRenderTimes).toStrictEqual(4);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(1);
});
