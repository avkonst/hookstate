import { useStateLink } from '@hookstate/core';

import { renderHook, act } from '@testing-library/react-hooks';
import { Logger } from './Logger';

import mockConsole from 'jest-mock-console';

test('logger should not mark objects as used', async () => {
    const restoreConsole = mockConsole();
    try {
        let renderTimes = 0
        const { result } = renderHook(() => {
            renderTimes += 1;
            return useStateLink({ prop: 1 }).with(Logger)
        });
        // tslint:disable-next-line: no-console
        expect(console.log).toHaveBeenCalledTimes(1);

        expect(renderTimes).toStrictEqual(1);
        Logger(result.current).log();
        // tslint:disable-next-line: no-console
        expect(console.log).toHaveBeenCalledTimes(2);

        act(() => {
            result.current.set(p => ({ prop: p.prop + 1 }));
        });
        // logger should not mark objects as used
        expect(renderTimes).toStrictEqual(1);
        // tslint:disable-next-line: no-console
        expect(console.log).toHaveBeenCalledTimes(3);
        expect((console.log as any).mock.calls).toEqual([
            ['[hookstate]: logger attached'],
            // tslint:disable-next-line: quotemark
            ["[hookstate]: current value at path '/: {\"prop\":1}'", { path: [], value: { prop: 1 }}],
            // tslint:disable-next-line: quotemark
            ["[hookstate]: new value set at path '/': {\"prop\":2}", { path: [], value: { prop: 2 }}],
        ]);

        act(() => {
            result.current.nested.prop.set(p => p + 1);
        });
        // logger should not mark objects as used
        expect(renderTimes).toStrictEqual(1);
        // tslint:disable-next-line: no-console
        expect(console.log).toHaveBeenCalledTimes(4);
        // tslint:disable-next-line: no-any no-console
        expect((console.log as any).mock.calls).toEqual([
            ['[hookstate]: logger attached'],
            // tslint:disable-next-line: quotemark
            ["[hookstate]: current value at path '/: {\"prop\":1}'", { path: [], value: { prop: 1 }}],
            // tslint:disable-next-line: quotemark
            ["[hookstate]: new value set at path '/': {\"prop\":2}", { path: [], value: { prop: 3 }}],
            // tslint:disable-next-line: quotemark
            ["[hookstate]: new value set at path '/prop': 3", { path: ['prop'], value: 3}]
        ]);
    } finally {
        restoreConsole();
    }
});
