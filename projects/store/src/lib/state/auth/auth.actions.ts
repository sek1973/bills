import { createAction, props } from '@ngrx/store';

export const AuthActions = {
  login: createAction(
    '[Authentication] User Login',
    props<{ user: string, password: string }>()
  ),

  loginSuccess: createAction(
    '[Authentication] User Login Success',
    props<{ user: string }>()
  ),

  loginFailure: createAction(
    '[Authentication] User Login Failure',
    props<{ error: any }>()
  ),

  logout: createAction(
    '[Authentication] Logout'
  ),

  logoutSuccess: createAction(
    '[Authentication] User Logout Success'
  ),

  logoutFailure: createAction(
    '[Authentication] User Logout Failure',
    props<{ error: any }>()
  )
};
