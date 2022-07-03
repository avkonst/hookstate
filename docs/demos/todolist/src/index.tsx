import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import '@hookstate/devtools';

// optional, defaults are almost always right
import { configure } from '@hookstate/core';
configure({
    interceptDependencyListsMode: "always",
    isDevelopmentMode: process.env.NODE_ENV === 'development'
})

import App from './App';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
