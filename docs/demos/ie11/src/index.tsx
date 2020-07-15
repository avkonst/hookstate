import 'react-app-polyfill/ie11';
import 'core-js/es/symbol';
import 'core-js/features/symbol';
import 'core-js/features/number/is-integer';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
