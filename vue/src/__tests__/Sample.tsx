import { createState, useState, self } from '../';

test('primitive: sample test', async () => {
    expect(createState(0).value).toEqual(0)
    expect(useState(0).value).toEqual(0)
});
