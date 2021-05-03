import { createAction, props } from '@ngrx/store';
import { Payment } from 'src/app/model';

export const PaymentsActions = {

  loadPayments: createAction(
    '[Payments] Load',
    props<{ billId: number }>()
  ),

  updatePayment: createAction(
    '[Payments] Update Payment',
    props<{ payment: Payment }>()
  ),

  createPayment: createAction(
    '[Payments] Create Payment',
    props<{ payment: Payment }>()
  ),

  deletePayment: createAction(
    '[Payments] Delete Payment',
    props<{ payment: Payment }>()
  ),

  importPayments: createAction(
    '[Payments] Import Payments',
    props<{ billId: number }>()
  ),

};
