import React from 'react';
import { Form } from 'react-bootstrap';
import { InputNewTodo } from '../InputNewTodo';
import UserSelect from '../UserSelect';
import { connect } from 'react-redux';
import styles from './MainApp.module.css';

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
 */

type Todo = {
    title: string,
    user?: number,
    isDone: boolean,
}

type MainAppProps = {
    todos: Todo[],
    addTodo: (t: Todo) => void,
    changeTodo: (todos: Todo[]) => void,
}
type MainAppState = {
    todoTitle: string
};

class Index extends React.Component<MainAppProps, MainAppState> {
    constructor(props: MainAppProps) {
        super(props);
        this.state = { todoTitle: '' }
    }
    handleTodoTitle = (todoTitle: string) => {
        this.setState({ todoTitle })
    }

    handleSubmitTodo = (todo: any) => {
        this.props.addTodo(todo)
    }

    render() {
        const { todoTitle } = this.state;
        window.allTodosIsDone = true;

        this.props.todos.map(t => {
            if (!t.isDone) {
                window.allTodosIsDone = false
            } else {
                window.allTodosIsDone = true
            }
        });

        return (
            <div>
                <Form.Check type="checkbox" label="all todos is done!" checked={window.allTodosIsDone}/>
                <hr/>
                <InputNewTodo todoTitle={todoTitle} onChange={this.handleTodoTitle} onSubmit={this.handleSubmitTodo}/>
                {this.props.todos.map((t, idx) => (
                    <div className={styles.todo} >
                        {t.title}
                        <UserSelect user={t.user} idx={idx}/>
                        <Form.Check
                            style={{ marginTop: -8, marginLeft: 5 }}
                            type="checkbox" checked={t.isDone} onChange={(e) => {
                            const changedTodos = this.props.todos.map((t, index) => {
                                const res = { ...t }
                                if (index == idx) {
                                    res.isDone = !t.isDone;
                                }
                                return res;

                            })
                            this.props.changeTodo(changedTodos)

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
            dispatch({type: 'ADD_TODO', payload: todo});
        },
        changeTodo: (todos: any) => dispatch({type: 'CHANGE_TODOS', payload: todos}),
        removeTodo: (index: number) => dispatch({type: 'REMOVE_TODOS', payload: index}),
    })

)(Index);
