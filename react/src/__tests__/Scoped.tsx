import { useState, Downgraded, self } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via scoped updates by child', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useState({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useState(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.fieldUsedByChild[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.fieldUsedByParent[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.fieldUsedByBoth[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
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
        return useState({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useState(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByChild[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.fieldUsedByParent[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.fieldUsedByBoth[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
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
        return useState({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })[self].attach(Downgraded)
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useState(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByChild[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByParent[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(3);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByBoth[self].set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent[self].get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild[self].get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth[self].get()).toStrictEqual(201);
    expect(parentRenderTimes).toStrictEqual(4);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(1);
});
