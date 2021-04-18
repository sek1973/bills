import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '.';
import { appInitialState, AppState } from '../app/app.state';

export const authReducer = createReducer<AppState>(
  appInitialState,

  on(AuthActions.login, (state): AppState => {
    return {
      ...state,
      loggedIn: true
    };
  }),

  on(AuthActions.logout, (state): AppState => {
    return {
      ...state,
      loggedIn: false
    };
  })
);
