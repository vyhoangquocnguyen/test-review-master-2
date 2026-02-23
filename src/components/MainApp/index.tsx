import React from "react";
import { Form } from "react-bootstrap";
import { InputNewTodo } from "../InputNewTodo";
import UserSelect from "../UserSelect";
import { connect } from "react-redux";
import styles from "./MainApp.module.css";

/**
 * REViEW:
 *
 * ISSUE 1: TYPE SAFETY: Local type definition for 'Todo'
 *   Defining `Todo` here makes it unavailable to other components (like App or
 *   UserSelect) unless they import it from this specific UI component. This
 *   creates a circular dependency risk and makes the type harder to find.
 *   FIX: Move common domain types to a centralized `src/types.ts` file.
 * ISSUE 2 — CONNECT mapStateToProps IS EMPTY (line ~98)
 *   `(state) => ({})` means MainApp gets no state from Redux via `connect()`.
 *   The parent `App` component fetches `todos` from Redux and passes them as a prop. This is redundant.
 *   [see App/index.tsx -> ISSUE 2]
 *   FIX: Map state here: `(state) => ({ todos: state.list.todos })` and
 *   remove the prop from App.
 * 
 * ISSUE 3: MISSING KEY PROP in list rendering (line ~122): React requires a `key` prop for list items to optimize rendering and avoid bugs.
 *   FIX: Add a unique `key` prop to the rendered list items, e.g.:
 *     {this.props.todos.map((t, idx) => (
 *       <div key={idx} className={styles.todo} >
 *         ...
 *       </div>
 *     ))}
 * ISSUE 4: TYPE SAFETY comparison in map (line ~133): `index == idx` is a loose equality check and can lead to bugs if types are not consistent.
 *   FIX: Use strict equality `index === idx` to ensure correct comparison.
 * 
 * ISSUE 5: Inline hanler in render (line ~109): Defining the onChange handler inline creates a new function on every render, which can lead to performance issues.
 *   FIX: Extract to a named method `handleToggleTodo = (idx: number) => () => {...}`
 *   and pass it as `onChange={this.handleToggleTodo(idx)}`.
 * 
 * ISSUE 6: Global variable usage (line ~106): Using `window.allTodosIsDone` is not a good practice as it can lead to conflicts
 *    and is not reactive.
 *   Storing computed state on the `window` object violates React's one-way data flow and encapsulation.
 *   Any other code in the page can read or write it, making it impossible to reason about where the value comes from.
 *   FIX: Calculate the value as a local variable inside the render method:
 * // Derive directly from prop
 *    const allTodosIsDone = this.props.todos.length > 0 &&
 *                           this.props.todos.every(t => t.isDone);
 * // Use directly in JSX
 *    <Form.Check checked={allTodosIsDone} />
 *
 * ISSUE 7 — LOGIC BUG: Using `.map()` for side-effects is wrong:
 *   each iteration unconditionally OVERWRITES the window flag. If the last todo
 *   in the array has `isDone === true`, window.allTodosIsDone ends up `true` even
 *   if previous todos are incomplete.
 *   Example: [{ isDone: false }, { isDone: true }] → flag ends as `true` (wrong).
 *   FIX (correct one-liner):
 *     const allTodosIsDone = todos.length > 0 && todos.every(t => t.isDone);
 *
 * ISSUE 8: Re-rendering performance: The current implementation recalculates `allTodosIsDone` on every render, which can be inefficient for large lists.
 *   FIX: Use `useMemo` hooks (for newer React) to memoize the calculation of `allTodosIsDone` based on the `todos` prop:
 *     const allTodosIsDone = useMemo(() => {
 *       return todos.length > 0 && todos.every(t => t.isDone);
 *     }, [todos]);
 *  This ensures that the calculation only runs when the `todos` prop changes, improving performance. 
 *  It is also the final fix for ISSUE 6 and ISSUE 7, as it eliminates the need for the global variable and ensures correct logic.
 * 
 * ISSUE 9: INCORRECT CONNECT MAP: `removeTodo` is wired but dead (line ~153)
 *   `connect()` maps `removeTodo` to dispatch `{ type: 'REMOVE_TODOS' }` (plural),
 *   but the reducer only handles `'REMOVE_TODO'` (singular) — a typo.
 *   Additionally, `removeTodo` is not listed in `MainAppProps`, so it cannot be
 *   called from the component body at all. The entire delete feature is broken.
 *   FIX:
 *     Fix the action type string: 'REMOVE_TODO' (singular, matching reducer).
 *     Add `removeTodo: (index: number) => void` to `MainAppProps`.
 *     Add a delete button next to each todo item.
 *
 *
 *
 */

type Todo = {
  title: string;
  user?: number;
  isDone: boolean;
};

type MainAppProps = {
  todos: Todo[];
  addTodo: (t: Todo) => void;
  changeTodo: (todos: Todo[]) => void;
};
type MainAppState = {
  todoTitle: string;
};

class Index extends React.Component<MainAppProps, MainAppState> {
  constructor(props: MainAppProps) {
    super(props);
    this.state = { todoTitle: "" };
  }
  handleTodoTitle = (todoTitle: string) => {
    this.setState({ todoTitle });
  };

  handleSubmitTodo = (todo: any) => {
    this.props.addTodo(todo);
  };

  render() {
    const { todoTitle } = this.state;
    window.allTodosIsDone = true;

    this.props.todos.map((t) => {
      if (!t.isDone) {
        window.allTodosIsDone = false;
      } else {
        window.allTodosIsDone = true;
      }
    });

    return (
      <div>
        <Form.Check type="checkbox" label="all todos is done!" checked={window.allTodosIsDone} />
        <hr />
        <InputNewTodo todoTitle={todoTitle} onChange={this.handleTodoTitle} onSubmit={this.handleSubmitTodo} />
        {this.props.todos.map((t, idx) => (
          <div className={styles.todo}>
            {t.title}
            <UserSelect user={t.user} idx={idx} />
            <Form.Check
              style={{ marginTop: -8, marginLeft: 5 }}
              type="checkbox"
              checked={t.isDone}
              onChange={(e) => {
                const changedTodos = this.props.todos.map((t, index) => {
                  const res = { ...t };
                  if (index == idx) {
                    res.isDone = !t.isDone;
                  }
                  return res;
                });
                this.props.changeTodo(changedTodos);
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}

export default connect(
  (state) => ({}),
  (dispatch) => ({
    addTodo: (todo: any) => {
      dispatch({ type: "ADD_TODO", payload: todo });
    },
    changeTodo: (todos: any) => dispatch({ type: "CHANGE_TODOS", payload: todos }),
    removeTodo: (index: number) => dispatch({ type: "REMOVE_TODOS", payload: index }),
  }),
)(Index);
