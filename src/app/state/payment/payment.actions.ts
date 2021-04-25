import { createAction, props } from '@ngrx/store';
import { Payment } from 'src/app/model';

export const loadPayments = createAction(
  '[Payments] Load',
  props<{ billId: number }>()
);

export const updatePayment = createAction(
  '[Payments] Update Payment',
  props<{ payment: Payment }>()
);

export const createPayment = createAction(
  '[Payments] Create Payment',
  props<{ payment: Payment }>()
);

export const deletePayment = createAction(
  '[Payments] Delete Payment',
  props<{ payment: Payment }>()
);

export const importPayments = createAction(
  '[Payments] Import Payments',
  props<{ billId: number }>()
);
