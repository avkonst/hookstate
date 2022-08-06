import { hookstate, none, State, useHookstate } from '../';

import { renderHook, act } from '@testing-library/react-hooks';

test('check assignability on typescript level', async () => {
    {
        // assign state to state of reduced value
        let a = hookstate<{ a: string, b?: string }>({ a: 'a', b: 'b' })
        let b: State<{ a: string }> = a;
    }
    
    {
        //assign state with extension method to a state without
        interface Inf {
            m(): void,
        }
        let a = hookstate<{ a: string, b?: string }, Inf>({ a: 'a', b: 'b' }, () => ({
            onCreate: () => ({
                m: () => () => {}
            })
        }))
        let b: State<{ a: string }> = a;
    }
});