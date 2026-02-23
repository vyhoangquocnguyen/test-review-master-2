import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './UserSelect.module.css';
/**
 * 
 * REVIEW:
 * 
 * ISSUE 1: No options in select: The `options` state is initialized as an empty array and is only populated after the fetch completes. 
 * This means that when the component first renders, the select dropdown will have no options, which can be confusing for users.
 * FIX: Add a loading state or a default option to indicate that the users are being loaded. For example:
 *   const [loading, setLoading] = React.useState(true);
 *   ...
 *   fetch(...).then(users => {
 *    setOptions(users);
 *   setLoading(false);
 *  }).catch(err => {
 *    console.error(err);
 *   setLoading(false);
 * });
 * And in the render:
 *  if (loading) {
 *   return <div>Loading users...</div>;\
 *  }
 *  
 * ISSUE 2: Action type mismatch due to typo: The `handleChange` function dispatches an action with type `'CHANGE_TODO'`, 
 * but the reducer in `store/index.ts` listens for `'CHANGE_TODOS'` (plural). 
 * This means that the dispatched action will not be handled by the reducer, and the state will not update as expected when a user is selected.
 * FIX: Change the action type string in the dispatch call to match the reducer:
 *  dispatch({type: 'CHANGE_TODOS', payload: changedTodos})
 *  or, better yet, define action types as constants in a central file to avoid such typos (see store/index.tsx -> ISSUE 3).
 * 
 * ISSUE 3: Mismatched type `user` is typed as `number | undefined`but the select value is set as `res.user = e.target.value` where `e.target.value`
 *  is always a `string`. 
 * FIX: parse the value to a number before setting it in the state:
 *  res.user = parseInt(e.target.value, 10);
 * 
 * ISSUE 4: Type safety: duplicated state shape type `(state: {list: { todos: any[] }}) => state.list.todos` is used in multiple places without a defined type for `todos`, 
 * leading to potential type safety issues. (same as App/index.tsx -> ISSUE 1)
 * FIX: Export `RootState` from `store/index.ts` and import it here to ensure type safety and consistency:
 *   import type { RootState } from '../../store';
 *  const todos = useSelector((state: RootState) => state.list.todos);
 * 
 * ISSUE 5: Memory leak risk: The `fetch` call in `useEffect` does not have any cleanup logic. 
 * If the component unmounts before the fetch completes, it could lead to a memory leak where `setOptions(users)` will attempt to update state on an unmounted
 *   component.
 * 
 * FIX: Use an AbortController for cleanup:
 *     useEffect(() => {
 *       const controller = new AbortController();
 *       fetch('https://jsonplaceholder.typicode.com/users/', { signal: controller.signal })
 *         .then(r => r.json())
 *         .then(users => setOptions(users))
 *         .catch(err => { if (err.name !== 'AbortError') console.error(err); });
 *       return () => controller.abort();
 *     }, []);
 * 
 * ISSUE 6: No error handling for fetch: The current implementation does not handle errors that may occur during the fetch request, 
 *  which can lead to silent failures and a poor user experience if the API is down or returns an error.
 * FIX: Add error handling to the fetch call to manage and display errors gracefully:
 *  .catch(err => setError('Failed to load users'));
 * and add an error state (optional): (Combine with ISSUE 1 loading state)
 *  const [error, setError] = React.useState<string | null>(null);
 * Then in the render method, display the error message if it exists:
 *  if (error) {
 *    return <div>Error: {error}</div>;
 * 
 * ISSUE 7: Missing `key` prop in options rendering: When rendering the list of users as options in the select dropdown, 
 * each option should have a unique `key` prop to help React identify which items have changed, are added, or are removed.
 * FIX: Add a `key` prop to the option elements, using a unique identifier such as the user's ID:
 * {options.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}
 * 
 * ISSUE 8: MISSING value prop in select: The select element does not have a `value` prop, which means it is an uncontrolled component.
 * This can lead to issues where the selected value does not reflect the current state of the application, especially if the `user` prop changes from outside this component.
 * FIX: Add a `value` prop to the select element that reflects the current selected user:
 *  <select name="user" className={styles.user} onChange={handleChange} value={props.user || ''}>
 * This ensures that the select dropdown is controlled and always reflects the current state of the selected user.
 * 
 * ISSUE 9: use strict equality in handleChange: In the `handleChange` function, 
 * the comparison `if (index == idx)` uses loose equality, which can lead to bugs if `index` and `idx` are of different types (e.g., string vs number).
 * FIX: Use strict equality `===` to ensure that the comparison is type-safe (same as MainApp/index.tsx -> ISSUE 4):
 *  if (index === idx) {
 * This prevents potential bugs where the condition might evaluate to true due to type coercion, leading to unintended updates to the todo items.
 * 
 * ISSUE 10: No <label> for the <select> screen reader cannot identify what the select is for.
 * FIX: Add a <label> element associated with the select for better accessibility:
 *   <select aria-label="Assign user" ...>
 *  
 */
type UserSelectProps = {
    user?: number,
    idx: number,
}

function UserSelect(props: UserSelectProps) {
    const dispatch = useDispatch();
    const todos = useSelector((state: {list: { todos: any[] }}) => state.list.todos);
    React.useEffect(
        () => {
            console.log('userSelect');
            fetch('https://jsonplaceholder.typicode.com/users/').then(
                (users) => users.json(),
            ).then(users => setOptions(users))
        },
        [],
    )
    const [options, setOptions] = React.useState([]);

    const { idx } = props;
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const changedTodos = todos.map((t, index) => {
            const res = { ...t }
            if (index == idx) {
                console.log('props.user', props.user);
                res.user = e.target.value;
            }
            return res;
        })
        dispatch({type: 'CHANGE_TODO', payload: changedTodos})
    }

    return (
        <select name="user" className={styles.user} onChange={handleChange}>
            {options.map((user: any) => <option value={user.id}>{user.name}</option>)}
        </select>
    );
}

export default UserSelect;
