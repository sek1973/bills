import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const loadProductsSuccess = createAction(
  '[Bill API] Load Success',
  props<{ bills: Bill[] }>()
);

export const loadProductsFailure = createAction(
  '[Bill API] Load Fail',
  props<{ error: string }>()
);

export const updateProductSuccess = createAction(
  '[Bill API] Update Bill Success',
  props<{ bill: Bill }>()
);

export const updateProductFailure = createAction(
  '[Bill API] Update Bill Fail',
  props<{ error: string }>()
);

export const createProductSuccess = createAction(
  '[Bill API] Create Bill Success',
  props<{ bill: Bill }>()
);

export const createProductFailure = createAction(
  '[Bill API] Create Bill Fail',
  props<{ error: string }>()
);

export const deleteProductSuccess = createAction(
  '[Bill API] Delete Bill Success',
  props<{ productId: number }>()
);

export const deleteProductFailure = createAction(
  '[Bill API] Delete Bill Fail',
  props<{ error: string }>()
);
