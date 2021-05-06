import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '.';
import { AppData, appInitialState } from '../app/app.state';

export const authReducer = createReducer<AppData>(
  appInitialState,

  on(AuthActions.login, (data: AppData) => {
    return {
      ...data,
      loggedIn: true
    };
  }),

  on(AuthActions.logout, (data: AppData) => {
    return {
      ...data,
      loggedIn: false
    };
  })
);
