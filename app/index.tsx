import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { configure } from 'mobx';

import { App } from './app';

import './index.css';

configure({ enforceActions: 'observed' });

ReactDOM.render(<App />, document.getElementById('app'));
