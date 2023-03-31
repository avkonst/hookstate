import { none, useHookstate } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

test('object: should rerender used via scoped updates by child', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useHookstate({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
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
        return useHookstate({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
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
        let r = useHookstate({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
        r.get({ noproxy: true })
        return r;
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
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
        let r = useHookstate({ field: 0 });
        r.field.get(); // mark traced and used
        r.get({ noproxy: true });
        return r;
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        // child creates a state from value from parent
        // without downgraded it should crash
        return useHookstate(parent.result.current.get({ noproxy: true }))
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
});

test('object: should allow set to none via child', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useHookstate({
            fieldUsedByParent: 0,
            fieldUsedByChild: 100,
            fieldUsedByBoth: 200
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.fieldUsedByChild.set(none);
    });
    expect(parent.result.current.fieldUsedByParent.get()).toStrictEqual(0);
    expect(parent.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(undefined);
    expect(child.result.current.fieldUsedByBoth.get()).toStrictEqual(200);
    expect(parentRenderTimes).toStrictEqual(2);
    expect(childRenderTimes).toStrictEqual(1);
});

test('object: should allow set to none via child without parent', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useHookstate({
            fieldUsedByChild: 100,
        })
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
    });
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(100);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(1);

    act(() => {
        child.result.current.fieldUsedByChild.set(none);
    });
    expect(child.result.current.fieldUsedByChild.get()).toStrictEqual(undefined);
    expect(parentRenderTimes).toStrictEqual(1);
    expect(childRenderTimes).toStrictEqual(2);
});

test('object: should rerender used via scoped updates by child', async () => {
    let parentRenderTimes = 0
    let childRenderTimes = 0
    const parent = renderHook(() => {
        parentRenderTimes += 1;
        return useHookstate([1, 2, 3])
    });
    const child = renderHook(() => {
        childRenderTimes += 1;
        return useHookstate(parent.result.current)
    });
    
    act(() => {
        // ensure no double wrap on type system
        // fix for https://github.com/avkonst/hookstate/discussions/365#discussioncomment-4478119
        child.result.current.set(p => { p[0] = 1; return p });
    });
});
