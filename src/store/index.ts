import { configureStore } from '@reduxjs/toolkit'

/**
 * REViEW:
 * 
 * ISSUE 1: TYPE SAFETY: reducer state and action are implicitly `any`
 *   Neither the state shape nor the action payload is typed.
 *   This means TypeScript cannot catch mismatches (e.g. passing a string
 *   where a Todo object is expected) at compile time.
 *   The current approach is using inline definitions, easy to get duplicated accross files,
 *   and when refactoring it's hard to spot, need to changes from all files.
 * FIX: Use Centralization & Automic Inference
 *   Create a dedicated types file (e.g: src/types.ts) and define types there and annotate the reducer
 *   Then import them in the files where they are used.
 * // src/types.ts  
 * export interface Todo {
        title: string;
        user?: number;
        isDone: boolean;
    }

** ISSUE 2 — Store does not export RootState / AppDispatch types
 *   Using Redux Toolkit without exporting these types means every consumer
 *   must re-declare the state shape inline as mentioned in the previous issue (see App/index.tsx and
 *   This leads to duplication, drift, and fragile code.
 *   FIX:
 *     export type RootState  = ReturnType<typeof store.getState>;
 *     export type AppDispatch = typeof store.dispatch;
 *     // Then in each file: const todos = useSelector((state: RootState) => state.list.todos);
 * 
 *  ISSUE 3 — The strings types for action types are hardcoded and duplicated across files:
 *   'ADD_TODO', 'REMOVE_TODO', 'CHANGE_TODOS' are hardcoded strings in
 *   MainApp/index.tsx, UserSelect/index.tsx, and here. A single typo silently
 *   does nothing.
 *   FIX: 
 *   Either put them in the src/types.ts (preferbly) and import them, or Export an ACTION_TYPES constant here and import it everywhere:
 *     export const ACTION_TYPES = {
 *       ADD_TODO:    'ADD_TODO',
 *       REMOVE_TODO: 'REMOVE_TODO',
 *       CHANGE_TODOS:'CHANGE_TODOS',
 *     } as const;
 *  ISSUE 4: State mutation in ADD_TODO case (line~ 59)
 *   `const newState = state` does NOT copy the object — it assigns a reference
 *   to the same object. Calling `newState.todos.push(...)` therefore mutates
 *   the original Redux state in place, which:
 *     Breaks Redux's immutability guarantee
 *     Prevents change-detection (state.todos === newState.todos → React/Redux won't see a new value and won't re-render)
 *   FIX:
 *     return { ...state, todos: [...state.todos, action.payload] };
 * 
 */

export default configureStore({
    reducer: {
        list: (state = {todos: []}, action) => {
            switch (action.type) {
                case 'ADD_TODO': {
                    const newState = state;
                    newState.todos.push(action.payload);
                    return newState;
                }
                case 'REMOVE_TODO': {
                    return {
                        ...state,
                        todos: state.todos.filter((t: any, index: number) => index !== action.payload),
                    };
                }
                case 'CHANGE_TODOS': {
                    return {
                        todos: action.payload,
                    };
                }
                default:
                    return state;
            }
        }
    }
})
