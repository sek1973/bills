import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const loadBillsSuccess = createAction(
  '[Bill API] Load Success',
  props<{ bills: Bill[] }>()
);

export const loadBillsFailure = createAction(
  '[Bill API] Load Fail',
  props<{ error: string }>()
);

export const updateBillSuccess = createAction(
  '[Bill API] Update Bill Success',
  props<{ bill: Bill }>()
);

export const updateBillFailure = createAction(
  '[Bill API] Update Bill Fail',
  props<{ error: string }>()
);

export const createBillSuccess = createAction(
  '[Bill API] Create Bill Success',
  props<{ bill: Bill }>()
);

export const createBillFailure = createAction(
  '[Bill API] Create Bill Fail',
  props<{ error: string }>()
);

export const deleteBillSuccess = createAction(
  '[Bill API] Delete Bill Success',
  props<{ billId: number }>()
);

export const deleteBillFailure = createAction(
  '[Bill API] Delete Bill Fail',
  props<{ error: string }>()
);
