import { createState, Downgraded, useState } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import { useEffect } from 'react';

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

test('object: should rerender stable with deep mutation (global)', async () => {
    let renderTimes = 0
    let gs0 = createState({a: {b: {c: 0}, d: {}}})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useState(gs0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.a.get().b.c).toStrictEqual(0);

    let state0 = result.current;
    let state0a = result.current.a; 
    let state0ab = result.current.a.b;
    let state0abc = result.current.a.b.c;
    let state0ad = result.current.a.d;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.a.b === state0ab).toBeTruthy();
    expect(state0.a.b.c === state0abc).toBeTruthy();
    expect(state0.a.d === state0ad).toBeTruthy();
    act(() => {
        result.current.a.b.c.set(42);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current !== state0).toBeTruthy();
    expect(result.current.a !== state0a).toBeTruthy();
    expect(result.current.a.b !== state0ab).toBeTruthy();
    expect(result.current.a.b.c !== state0abc).toBeTruthy();
    expect(result.current.a.b.c.get()).toStrictEqual(42);
    expect(result.current.a.d === state0ad).toBeTruthy();
    expect(state0abc.get()).toStrictEqual(42);

    state0 = result.current;
    state0a = result.current.a; 
    state0ab = result.current.a.b;
    state0abc = result.current.a.b.c;
    state0ad = result.current.a.d;
    act(() => {});
    expect(result.current === state0).toBeTruthy();
    expect(result.current.a === state0a).toBeTruthy();
    expect(result.current.a.b === state0ab).toBeTruthy();
    expect(result.current.a.b.c === state0abc).toBeTruthy();
    expect(result.current.a.b.c.get()).toStrictEqual(42);
    expect(result.current.a.d === state0ad).toBeTruthy();
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

test('primitive: should rerender stable (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useState(0), useState(1)]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(p.result.current[0]), useState(p.result.current[1])]
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

test('object: should rerender stable (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useState({a: 0, b: 0}), useState({a: 1, b: 1})]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(p.result.current[0]), useState(p.result.current[1])]
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

test('object: should rerender stable (scoped, parent rerender)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let p = [useState({a: 0, b: 0}), useState({a: 1, b: 1})]
        return [useState(p[0]), useState(p[1]), p[0], p[1]]
    });
    expect(renderTimes).toStrictEqual(1);

    {
        // make sure parent's state is used
        // so the rerender for scoped component happens
        // via rerendered parent
        expect(result.current[2].a.get()).toStrictEqual(0);
        expect(result.current[2].b.get()).toStrictEqual(0);
        expect(result.current[3].a.get()).toStrictEqual(1);
        expect(result.current[3].b.get()).toStrictEqual(1);

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
            // update root of the parent state
            result.current[3].set(p => p);
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
    }
    
    // repeat but change another parent state
    {
        // make sure parent's state is used
        // so the rerender for scoped component happens
        // via rerendered parent
        expect(result.current[2].a.get()).toStrictEqual(0);
        expect(result.current[2].b.get()).toStrictEqual(0);
        expect(result.current[3].a.get()).toStrictEqual(1);
        expect(result.current[3].b.get()).toStrictEqual(1);
    
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
            // update root of the parent state
            result.current[2].set(p => p);
        });
        expect(renderTimes).toStrictEqual(3);
        expect(result.current[0].a.get()).toStrictEqual(0);
        expect(result.current[0].b.get()).toStrictEqual(0);
        expect(result.current[1].a.get()).toStrictEqual(1);
        expect(result.current[1].b.get()).toStrictEqual(1);
        expect(result.current[0] !== state0).toBeTruthy();
        expect(result.current[1] === state1).toBeTruthy();
        
        // the following two is an interesting result
        // but it makes sense, because state1 and result.current[1] 
        // refer to the same instance of StateMethodsImpl
        expect(result.current[0].a === state0.a).toBeTruthy();
        expect(result.current[0].b === state0.b).toBeTruthy();
        
        expect(result.current[1].a === state1.a).toBeTruthy();
        expect(result.current[1].b === state1.b).toBeTruthy();
        
        expect(result.current[0].a !== state0a).toBeTruthy();
        expect(result.current[0].b !== state0b).toBeTruthy();
        expect(result.current[1].a === state1a).toBeTruthy();
        expect(result.current[1].b === state1b).toBeTruthy();
    }
});

test('object: should rerender stable nested update (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useState({a: 0, b: 0}), useState({a: 1, b: 1})]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useState(p.result.current[0]), useState(p.result.current[1])]
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

test('object: should rerender if used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useState({a: 0, b: 0})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get()
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);

});

test('object: should rerender if nested object used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useState({a: 0, b: { c: 0, d: 0 }})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get()
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.b.set(p => p);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);
});

test('object: should rerender if nested object used and updated in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useState({a: 0, b: { c: 0, d: 0 }})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get().c
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.b.d.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.b.c.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);
});

test('object: should rerender if 2 states used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state1 = useState({a: 0})
        let state2 = useState({a: 0})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state1.a.get() && state2.get().a
        }, [state1, state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.result.current[1].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);
});
