import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../auth';
import { AppData, appInitialState } from './app.state';

export const appReducer = createReducer<AppData>(
  appInitialState,

  on(AuthActions.login, (data: AppData) => {
    return {
      ...data,
      loading: true
    };
  }),

  on(AuthActions.loginSuccess, (data: AppData) => {
    return {
      ...data,
      loggedIn: true,
      loading: false
    };
  }),

  on(AuthActions.loginFailure, (data: AppData) => {
    return {
      ...data,
      loading: false
    };
  }),

  on(AuthActions.logout, (data: AppData) => {
    return {
      ...data,
      loading: true
    };
  }),

  on(AuthActions.logoutSuccess, (data: AppData) => {
    return {
      ...data,
      loggedIn: false,
      loading: false
    };
  }),

  on(AuthActions.logoutFailure, (data: AppData) => {
    return {
      ...data,
      loading: false
    };
  })
);