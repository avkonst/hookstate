
import { useStateLink } from './UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';

test('primitive: should rerender used', async () => {
    const { result } = renderHook(() => useStateLink(0));

    expect(result.current.get()).toStrictEqual(0);
    act(() => {
        result.current.set(p => p + 1);
    });
    expect(result.current.get()).toStrictEqual(1);
});

test('primitive: should not rerender unused', async () => {
    const { result } = renderHook(() => useStateLink(0));

    act(() => {
        result.current.set(p => p + 1);
    });
    expect(result.current.get()).toStrictEqual(0);
});

test('primitive: counter', async () => {
    const { result } = renderHook(() => {
        const l = useStateLink({
            field1: 0,
            field2: 'str'
        });
        return {
            statelink: l,
            rendered: l.get()
        }
    });

    expect(result.current.rendered.field1).toStrictEqual(0);
    act(() => {
        result.current.statelink.nested.field1.set(p => p + 1);
    });
    expect(result.current.rendered.field1).toStrictEqual(1);
});
