import { createState, useState } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

test('primitive: should rerender stable', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(0), useState(1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[0];
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
});

test('object: should rerender stable', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState({a: 0, b: 0}), useState({a: 1, b: 1})]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state1 and result.current[1] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a !== state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender stable nested update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState({a: 0, b: 0}), useState({a: 1, b: 1})]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].b.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state0 and result.current[0] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a === state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('primitive: should rerender stable (global)', async () => {
    let renderTimes = 0
    let gs0 = createState(0)
    let gs1 = createState(1)
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(gs0), useState(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[0];
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
});

test('object: should rerender stable (global)', async () => {
    let renderTimes = 0
    let gs0 = createState({a: 0, b: 0})
    let gs1 = createState({a: 1, b: 1})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(gs0), useState(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state1 and result.current[1] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a !== state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender stable nested update (global)', async () => {
    let renderTimes = 0
    let gs0 = createState({a: 0, b: 0})
    let gs1 = createState({a: 1, b: 1})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(gs0), useState(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].b.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state0 and result.current[0] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a === state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});