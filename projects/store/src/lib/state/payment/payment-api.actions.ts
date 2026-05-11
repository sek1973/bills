import { ImportReport, Payment } from '@bills/model';
import { createAction, props } from '@ngrx/store';
import { PostgrestError } from '@supabase/supabase-js';

export const PaymentApiActions = {

  loadPaymentsSuccess: createAction(
    '[Payment API] Load Success',
    props<{ payments: Payment[] }>()
  ),

  loadPaymentsFailure: createAction(
    '[Payment API] Load Failure',
    props<{ error: PostgrestError }>()
  ),

  loadAllPaymentsSuccess: createAction(
    '[Payment API] Load All Success',
    props<{ payments: Payment[] }>()
  ),

  loadAllPaymentsFailure: createAction(
    '[Payment API] Load All Failure',
    props<{ error: PostgrestError }>()
  ),

  updatePaymentSuccess: createAction(
    '[Payment API] Update Payment Success',
    props<{ payment: Payment }>()
  ),

  updatePaymentFailure: createAction(
    '[Payment API] Update Payment Failure',
    props<{ error: PostgrestError }>()
  ),

  createPaymentSuccess: createAction(
    '[Payment API] Create Payment Success',
    props<{ payment: Payment }>()
  ),

  createPaymentFailure: createAction(
    '[Payment API] Create Payment Failure',
    props<{ error: PostgrestError }>()
  ),

  deletePaymentSuccess: createAction(
    '[Payment API] Delete Payment Success',
    props<{ billId: number }>()
  ),

  deletePaymentFailure: createAction(
    '[Payment API] Delete Payment Failure',
    props<{ error: PostgrestError }>()
  ),

  importPaymentsSuccess: createAction(
    '[Payment API] Import Payments Success',
    props<{ billId: number, report: string | ImportReport[] }>()
  ),

  importPaymentsFailure: createAction(
    '[Payment API] Import Payments Failure',
    props<{ error: string }>()
  ),

  upsertPayment: createAction(
    '[Payment API] Upsert Payment',
    props<{ payment: Payment }>()
  ),

  removePayment: createAction(
    '[Payment API] Remove Payment',
    props<{ paymentId: number; billId: number }>()
  ),

};
