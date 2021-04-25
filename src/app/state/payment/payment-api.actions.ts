import { createAction, props } from '@ngrx/store';
import { Payment } from 'src/app/model';

export const loadPaymentsSuccess = createAction(
  '[Payment API] Load Success',
  props<{ payments: Payment[] }>()
);

export const loadPaymentsFailure = createAction(
  '[Payment API] Load Failure',
  props<{ error: string }>()
);

export const updatePaymentSuccess = createAction(
  '[Payment API] Update Payment Success',
  props<{ payment: Payment }>()
);

export const updatePaymentFailure = createAction(
  '[Payment API] Update Payment Failure',
  props<{ error: string }>()
);

export const createPaymentSuccess = createAction(
  '[Payment API] Create Payment Success',
  props<{ payment: Payment }>()
);

export const createPaymentFailure = createAction(
  '[Payment API] Create Payment Failure',
  props<{ error: string }>()
);

export const deletePaymentSuccess = createAction(
  '[Payment API] Delete Payment Success',
  props<{ paymentId: number }>()
);

export const deletePaymentFailure = createAction(
  '[Payment API] Delete Payment Failure',
  props<{ error: string }>()
);

export const importPaymentsSuccess = createAction(
  '[Payment API] Import Payments Success',
  props<{ report: string }>()
);

export const importPaymentsFailure = createAction(
  '[Payment API] Import Payments Failure',
  props<{ report: string }>()
);
