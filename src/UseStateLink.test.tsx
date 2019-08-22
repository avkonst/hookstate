
import { useStateLink } from './UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';

test('primitive: counter', async () => {
    const { result } = renderHook(() => {
        const l = useStateLink(0);
        return {
            statelink: l,
            rendered: l.get()
        }
    });

    expect(result.current.rendered).toStrictEqual(0);
    act(() => {
        result.current.statelink.set(p => p + 1);
    });
    expect(result.current.rendered).toStrictEqual(1);
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
