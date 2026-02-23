import React from "react";
import logo from "../../logo.svg";
import "./App.css";
import MainApp from "../MainApp";
import { useSelector } from "react-redux";
/**
 * REViEW:
 *
 * ISSUE 1: `(state: {list: { todos: any[] }}) => state.list.todos` using `any` provides no type safety here,
 *  but we need to have a type for `todos` to be able to use it in `MainApp`
 *  FIX: Export `RootState` from store/index.ts and import it here:
 *   This ensures types stay in sync automatically.
 *     import type { RootState } from '../../store';
 *     const todos = useSelector((state: RootState) => state.list.todos);
 * ISSUE 2: Redundant pros passing: `todos` is already in the Redux store, so MainApp reads from there via `connect()`,
 *  so no need to pass it as a prop here. This creates unnecessary coupling, inconsistency and makes the code less maintainable.
 * FIX: Remove the `todos` prop from `MainApp` and let it read directly from the Redux store via `connect()`.
 * // src/components/App/index.tsx
 *         <MainApp />
 * ISSUE 3: TYPOS in footer (line ~37): "All right reserved" should be "All rights reserved"
 * ISSUE 4: Accessibility: The link in the footer should have `rel="noopener noreferrer"` when using `target="_blank"` to prevent security vulnerabilities.
 * FIX: Update the anchor tag:
 *   <a href="https://example.org" target="_blank" rel="noopener noreferrer" className={"App-footer-link"}>
 *     All rights reserved
 *   </a>
 */
function App() {
  const todos = useSelector((state: { list: { todos: any[] } }) => state.list.todos);
  return (
    <div className="App main">
      <header className="App-header">
        TODO list with users:
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
      </header>
      {/* MAIN APP: */}
      <MainApp todos={todos} />

      <footer className="App-footer">
        <a href="https://example.org" target="_blank" className={"App-footer-link"}>
          All right reserved
        </a>
      </footer>
    </div>
  );
}

export default App;
