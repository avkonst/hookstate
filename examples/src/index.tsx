import 'core-js/features/map';
import 'core-js/features/set';
import 'core-js/features/array';
import 'core-js/features/array/includes';
import 'core-js/features/array/flat';
import 'core-js/web/url-search-params';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import ReactGA from 'react-ga';

const trackingId = 'UA-146415947-1';
ReactGA.initialize(trackingId);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
