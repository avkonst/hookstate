import React from 'react';
import useStateObject from '../UseStateObject';

const UseStateObjectExample = () => {
    const [instance, { merge }] = useStateObject({ a: 1, b: 'two' });
    return (
        <div>
            {JSON.stringify(instance)}
            <button onClick={() => merge({ b: 'Three' })}>Modify instance</button>
        </div>
    );
};
