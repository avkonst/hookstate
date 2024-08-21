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

    {
        // array inference
        let a = hookstate<{ a: string }[]>([]);
        let b: State<{ a: string }> = a[0];
    }

    {
        // nullable array inference
        let a = hookstate<{ a: string }[] | null>(null);
        let b: State<{ a: string }> | undefined = a[0];
    }

    {
        // object inference
        let a = hookstate<{ a: string }>({ a: 'a' });
        let b: State<string> = a.a;
    }

    {
        // nullable object inference
        let a = hookstate<{ a: string } | null>(null);
        let b: State<string> | undefined = a.a;
    }

    {
        // null inference
        let a = hookstate<null>(null);
        // if this is not an error, inference works correctly
        let b: 'a' extends keyof typeof a ? never : typeof a = a;
    }
});