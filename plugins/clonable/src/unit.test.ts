
import { hookstate, State } from '@hookstate/core';
import { renderHook, act } from '@testing-library/react-hooks';
import { Clonable, clonable } from '../src'

test('check typescript assignability', async () => {
    interface Task {
        name: string,
        snapshot: number
    }

    let a = hookstate([{ name: 'string', snapshot: 1 }], clonable(v => v))
    let b: State<Task, Clonable> = a[0]
    let c: Task = b.clone()
    let c2: Task = a[0].clone()
});

