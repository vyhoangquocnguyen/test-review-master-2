import React from 'react';
import styles from './InputNewTodo.module.css'
/**
 * REVIEW:
 * 
 * ISSUE 1: there is no constructor and no class property initialiser for `state`.
 *  FIX: Add internal state to manage the input value and update it on change. This ensures that the component is controlled and behaves predictably.
 *     state:InputNewTodoState = { value: '' };
 *  Currently `this.state` is undefined, so `this.state.value` in handleKeyDown will throw. 
 *  OR: make a contructor and initialize state there.
 *    constructor(props: InputNewTodoProps) {
 *       super(props);
 *       this.state = { value: '' };
 *    }
 * 
 * ISSUE 2:DUPLICATED / SPLIT STATE: value lives in both props and local state.The controlled input renders `value={this.props.todoTitle}` (from parent),
 *   but `handleKeyDown` reads `this.state.value` (local). These two sources of truth can easily get out of sync, leading to bugs where the input doesn't update correctly or submits stale data.
 *  FIX: Choose one source of truth for the input value. The simplest fix is to remove local state and use `this.props.todoTitle` everywhere, ensuring that the parent component fully controls the input value.
 *     const val = this.props.todoTitle.trim();
 *  using this value for both rendering and handlekeydown
 * 
 * ISSUE 3: using var instead of const/let (line ~73): `var val = this.state.value.trim();` is function-scoped and can lead to bugs due to hoisting. 
 *   It's best practice to use `const` for variables that won't be reassigned and `let` for those that will.
 * FIX: Change `var` to `const` same as ISSUE 2 fix
 * 
 * ISSUE 4: `onSubmit` sends `this.state.value` untrimmed but `val` is the trimmed version. 
 * This means that if the user types "  Buy milk  ", the submitted todo will have the title "  Buy milk  " with extra spaces, which is likely not intended.
 * FIX: Use the trimmed `val` when calling `onSubmit` to ensure that the todo title is clean:
 *   this.props.onSubmit({
 *     title: val,
 *     isDone: false,
 *   });
 * 
 * ISSUE 5: No `arial-label` or placeholder for accessibility. 
 * FIX: Add an associated <label> element or at least a placeholder attribute to the input for screen readers:
 *   <input aria-label="New todo title" placeholder="What needs to be done?" ... />
 * 
 * ISSUE 6: use of `keyCode` is deprecated in modern browsers. 
 * FIX: Use `event.key` instead of `keyCode` for better readability and future compatibility:
 *   if (event.key !== 'Enter') {
 *     return;
 *  }
 * 
 */
type InputNewTodoProps = {
    todoTitle: string,
    onChange: (todoTitle: string) => void,
    onSubmit: (todo: any) => void,

}
type InputNewTodoState = {
    value: string
}

export class InputNewTodo extends React.Component<InputNewTodoProps, InputNewTodoState> {
    componentDidUpdate(prevProps: Readonly<InputNewTodoProps>, prevState: Readonly<InputNewTodoState>, snapshot?: any) {
        if (this.props.todoTitle !== prevProps.todoTitle) {
            this.setState({value: this.props.todoTitle})
        }
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(e.target.value);
    }

    handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.keyCode !== 13) {
            return;
        }

        event.preventDefault();

        var val = this.state.value.trim();

        if (val) {
            this.props.onSubmit({
                title: this.state.value,
                isDone: false,
            });
            this.props.onChange('');
        }
    }

    render() {
        return (
            <input
                className={styles['new-todo']}
                type="text"
                value={this.props.todoTitle}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                placeholder="What needs to be done?"
            />
        );
    }
}
