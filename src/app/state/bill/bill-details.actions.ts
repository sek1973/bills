import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const toggleBillCode = createAction(
  '[Bill Details] Toggle Bill Code'
);

export const setCurrentBill = createAction(
  '[Bill Details] Set Current Bill',
  props<{ currentBillId: number }>()
);

export const clearCurrentBill = createAction(
  '[Bill Details] Clear Current Bill'
);

export const initializeCurrentBill = createAction(
  '[Bill Details] Initialize Current Bill'
);

export const loadBills = createAction(
  '[Bill Details] Load'
);

export const updateBill = createAction(
  '[Bill Details] Update Bill',
  props<{ bill: Bill }>()
);

export const createBill = createAction(
  '[Bill Details] Create Bill',
  props<{ bill: Bill }>()
);

export const deleteBill = createAction(
  '[Bill Details] Delete Bill',
  props<{ billId: number }>()
);
