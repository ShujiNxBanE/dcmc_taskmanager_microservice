import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import getStore from 'app/config/store';
import App from './app';

const store = getStore();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Failed to find the root element');
const root = createRoot(rootEl);

const render = (Component: React.ComponentType) =>
  root.render(
    <Provider store={store}>
      <Component />
    </Provider>,
  );

render(App);
