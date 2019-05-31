import React from 'react';
import useStateArray from '../UseStateArray';

const UseStateArrayExample = () => {
    const [array, { push }] = useStateArray([1, 2]);
    return (
        <div>
            {array.join(',')}
            <button onClick={() => push(array.length)}>Add</button>
        </div>
    );
};
