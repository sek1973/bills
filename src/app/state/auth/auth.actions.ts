import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Authentication] User Login',
  props<{ user: string }>()
);

export const logout = createAction(
  '[Authentication] Logout'
);
