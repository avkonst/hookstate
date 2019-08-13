
import { useStateLink } from './UseStateLink';

import { renderHook, act } from '@testing-library/react-hooks';

type Dict<T> = {
    [key: string]: T
};

test('should update state', () => {
    const { result } = renderHook(() => useStateLink<Dict<number>>({}));

    act(() => {
        result.current[1].update('1', 1);
    });

    expect(result.current[0]).toStrictEqual({ 1: 1 });
});
