import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Authentication] User Login',
  props<{ user: string }>()
);

export const loginSuccess = createAction(
  '[Authentication] User Login Success'
);

export const loginFailure = createAction(
  '[Authentication] User Login Failure',
  props<{ error: any }>()
);

export const logout = createAction(
  '[Authentication] Logout'
);

export const logoutSuccess = createAction(
  '[Authentication] User Logout Success'
);

export const logoutFailure = createAction(
  '[Authentication] User Logout Failure',
  props<{ error: any }>()
);
