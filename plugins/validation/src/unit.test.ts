
import { useHookstate } from '@hookstate/core';
import { renderHook, act } from '@testing-library/react-hooks';
import { validation } from './validation';

test('validation: basic test', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let result = useHookstate({ a: [0, 1], b: [1, 1] }, validation())
        result.a.validate(r => r[0] === 0, "a.0 should be zero")
        result.b[1].validate(r => r === 1, "b.* should be one")
        return result;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.valid()).toStrictEqual(true);
    expect(result.current.a.valid()).toStrictEqual(true);
    expect(result.current.a[0].valid()).toStrictEqual(true);
    expect(result.current.a[1].valid()).toStrictEqual(true);
    expect(result.current.b.valid()).toStrictEqual(true);
    expect(result.current.b[0].valid()).toStrictEqual(true);
    expect(result.current.b[1].valid()).toStrictEqual(true);

    act(() => {
        result.current.a[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.valid()).toStrictEqual(false);
    expect(result.current.a.valid()).toStrictEqual(false);
    expect(result.current.a[0].valid()).toStrictEqual(true);
    expect(result.current.a[1].valid()).toStrictEqual(true);
    expect(result.current.b.valid()).toStrictEqual(true);
    expect(result.current.b[0].valid()).toStrictEqual(true);
    expect(result.current.b[1].valid()).toStrictEqual(true);

    act(() => {
        result.current.a[0].set(p => p - 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.valid()).toStrictEqual(true);
    expect(result.current.a.valid()).toStrictEqual(true);
    expect(result.current.a[0].valid()).toStrictEqual(true);
    expect(result.current.a[1].valid()).toStrictEqual(true);
    expect(result.current.b.valid()).toStrictEqual(true);
    expect(result.current.b[0].valid()).toStrictEqual(true);
    expect(result.current.b[1].valid()).toStrictEqual(true);

    act(() => {
        result.current.b[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.valid()).toStrictEqual(false);
    expect(result.current.a.valid()).toStrictEqual(true);
    expect(result.current.a[0].valid()).toStrictEqual(true);
    expect(result.current.a[1].valid()).toStrictEqual(true);
    expect(result.current.b.valid()).toStrictEqual(false);
    expect(result.current.b[0].valid()).toStrictEqual(false);
    expect(result.current.b[1].valid()).toStrictEqual(true);
});

test('validation: ', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let result = useHookstate("", validation())
        return result;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.valid()).toStrictEqual(true);
});
