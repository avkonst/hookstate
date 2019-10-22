import React from 'react';
import { createStateLink, useStateLink, useStateLinkUnmounted } from '@hookstate/core';

const store = createStateLink(0);

useStateLinkUnmounted(store);

export const ExampleComponent = () => {
    const state = useStateLink(store);
    return <>{state.value}</>
}
