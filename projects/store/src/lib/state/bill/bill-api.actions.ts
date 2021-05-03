import { createAction, props } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';

export const BillApiActions = {
  loadBillsSuccess: createAction(
    '[Bill API] Load Success',
    props<{ bills: Bill[] }>()
  ),

  loadBillsFailure: createAction(
    '[Bill API] Load Failure',
    props<{ error: string }>()
  ),

  updateBillSuccess: createAction(
    '[Bill API] Update Bill Success',
    props<{ bill: Bill }>()
  ),

  updateBillFailure: createAction(
    '[Bill API] Update Bill Failure',
    props<{ error: string }>()
  ),

  createBillSuccess: createAction(
    '[Bill API] Create Bill Success',
    props<{ bill: Bill }>()
  ),

  createBillFailure: createAction(
    '[Bill API] Create Bill Failure',
    props<{ error: string }>()
  ),

  deleteBillSuccess: createAction(
    '[Bill API] Delete Bill Success',
    props<{ billId: number }>()
  ),

  deleteBillFailure: createAction(
    '[Bill API] Delete Bill Failure',
    props<{ error: string }>()
  ),

  payBillSuccess: createAction(
    '[Bill API] Pay Bill Success',
    props<{ billId: number }>()
  ),

  payBillFailure: createAction(
    '[Bill API] Pay Bill Failure',
    props<{ error: string }>()
  ),

};
