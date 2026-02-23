import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import store from './store'
import { Provider } from 'react-redux'

/*

ISSUE 1 — MISSING SEMICOLONS / STYLE INCONSISTENCY
 *   The imports at the top mix semicolons (lines 1–5) with no-semicolons (lines 6–7).
ISSUE 2 - SAFETY: `document.getElementById('root')` can return null
 *   If the DOM element with id "root" is missing, ReactDOM.render silently fails.
 *   FIX: Add a null guard:
 *     const rootElement = document.getElementById('root');
 *     if (!rootElement) throw new Error('Root element #root not found in document');
 *     ReactDOM.render(..., rootElement);
Minor ISSUE:
 *  Extra indentation — align <Provider> and <App> to 2-space indent

*/
ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
  </React.StrictMode>,
  // 
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
