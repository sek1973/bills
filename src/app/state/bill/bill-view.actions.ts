import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const toggleBillCode = createAction(
  '[Bill View] Toggle Bill Code'
);

export const setCurrentBill = createAction(
  '[Bill View] Set Current Bill',
  props<{ billId: number }>()
);

export const clearCurrentBill = createAction(
  '[Bill View] Clear Current Bill'
);

export const initializeCurrentBill = createAction(
  '[Bill View] Initialize Current Bill'
);

export const loadBills = createAction(
  '[Bill View] Load'
);

export const updateBill = createAction(
  '[Bill View] Update Bill',
  props<{ bill: Bill }>()
);

export const createBill = createAction(
  '[Bill View] Create Bill',
  props<{ bill: Bill }>()
);

export const deleteBill = createAction(
  '[Bill View] Delete Bill',
  props<{ billId: number }>()
);

export const payBill = createAction(
  '[Bill View] Pay Bill',
  props<{ billId: number, sum: number }>()
);
