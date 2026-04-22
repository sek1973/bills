import { createAction, props } from '@ngrx/store';
import { PostgrestError } from '@supabase/supabase-js';
import { Bill, OverviewBill } from 'model';

export const BillApiActions = {
  loadOverviewBillsSuccess: createAction(
    '[Bill API] Load Overview Success',
    props<{ bills: OverviewBill[] }>()
  ),

  loadOverviewBillsFailure: createAction(
    '[Bill API] Load Overview Failure',
    props<{ error: PostgrestError }>()
  ),

  updateBillSuccess: createAction(
    '[Bill API] Update Bill Success',
    props<{ bill: Bill, redirect: boolean }>()
  ),

  updateBillFailure: createAction(
    '[Bill API] Update Bill Failure',
    props<{ error: PostgrestError }>()
  ),

  createBillSuccess: createAction(
    '[Bill API] Create Bill Success',
    props<{ bill: Bill, redirect: boolean }>()
  ),

  createBillFailure: createAction(
    '[Bill API] Create Bill Failure',
    props<{ error: PostgrestError }>()
  ),

  deleteBillSuccess: createAction(
    '[Bill API] Delete Bill Success',
    props<{ billId: number }>()
  ),

  deleteBillFailure: createAction(
    '[Bill API] Delete Bill Failure',
    props<{ error: PostgrestError }>()
  ),

  payBillSuccess: createAction(
    '[Bill API] Pay Bill Success',
    props<{ billId: number }>()
  ),

  payBillFailure: createAction(
    '[Bill API] Pay Bill Failure',
    props<{ error: PostgrestError }>()
  ),

};
