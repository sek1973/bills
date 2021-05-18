import { createAction, props } from '@ngrx/store';
import { Payment } from 'projects/model/src/lib/model';
import { ImportReport } from 'projects/model/src/public-api';

export const PaymentApiActions = {

  loadPaymentsSuccess: createAction(
    '[Payment API] Load Success',
    props<{ payments: Payment[] }>()
  ),

  loadPaymentsFailure: createAction(
    '[Payment API] Load Failure',
    props<{ error: string }>()
  ),

  updatePaymentSuccess: createAction(
    '[Payment API] Update Payment Success',
    props<{ payment: Payment }>()
  ),

  updatePaymentFailure: createAction(
    '[Payment API] Update Payment Failure',
    props<{ error: string }>()
  ),

  createPaymentSuccess: createAction(
    '[Payment API] Create Payment Success',
    props<{ payment: Payment }>()
  ),

  createPaymentFailure: createAction(
    '[Payment API] Create Payment Failure',
    props<{ error: string }>()
  ),

  deletePaymentSuccess: createAction(
    '[Payment API] Delete Payment Success',
    props<{ billId: number }>()
  ),

  deletePaymentFailure: createAction(
    '[Payment API] Delete Payment Failure',
    props<{ error: string }>()
  ),

  importPaymentsSuccess: createAction(
    '[Payment API] Import Payments Success',
    props<{ report: string | ImportReport[] }>()
  ),

  importPaymentsFailure: createAction(
    '[Payment API] Import Payments Failure',
    props<{ report: string | ImportReport[] }>()
  ),

};
