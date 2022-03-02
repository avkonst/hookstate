import { useState, Downgraded } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

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
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        child.result.current.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
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
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(2);

    act(() => {
        parent.result.current.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
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
        }).attach(Downgraded)
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useState(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByChild.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByParent.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(3);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.fieldUsedByBoth.set(p => p + 1);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    expect(parentRenderTimes).toStrictEqual(4);
    // correct if parent is rerendered, child should not
    // as it is rerendered as a child of parent:
    expect(childRenderTimes).toStrictEqual(1);
});

test('object: should support late disabled tracking', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        let r = useState({ field: 0 });
        r.field.get(); // mark traced and used
        r.attach(Downgraded);
        return r;
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        // child creates a state from value from parent
        // without downgraded it should crash
        return useState(parent.result.current.get())
    });
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        parent.result.current.field.set(p => p + 1);
    });
    expect(parent.result.current.field.get()).toStrictEqual(1);
    expect(child.result.current.field.get()).toStrictEqual(1);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(1);

    // act(() => {
    //     parent.result.current.fieldUsedByParent.set(p => p + 1);
    // });
    // expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    // expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    // expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    // expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    // expect(parentRenderTimes).toStrictEqual(3);
    // expect(childRenderTimes).toStrictEqual(1);

    // act(() => {
    //     parent.result.current.fieldUsedByBoth.set(p => p + 1);
    // });
    // expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(1);
    // expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    // expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(101);
    // expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(201);
    // expect(parentRenderTimes).toStrictEqual(4);
    // // correct if parent is rerendered, child should not
    // // as it is rerendered as a child of parent:
    // expect(childRenderTimes).toStrictEqual(1);
});
