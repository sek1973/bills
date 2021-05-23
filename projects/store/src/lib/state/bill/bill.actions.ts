import { createAction, props } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';

export const BillsActions = {

  loadBills: createAction(
    '[Bills] Load'
  ),

  updateBill: createAction(
    '[Bills] Update Bill',
    props<{ bill: Bill }>()
  ),

  createBill: createAction(
    '[Bills] Create Bill',
    props<{ bill: Bill }>()
  ),

  deleteBill: createAction(
    '[Bills] Delete Bill',
    props<{ bill: Bill }>()
  ),

  deleteBillConfirmed: createAction(
    '[Bills] Delete Bill Confirmed',
    props<{ bill: Bill }>()
  ),

  payBill: createAction(
    '[Bills] Pay Bill',
    props<{ bill: Bill }>()
  ),

  payBillConfirmed: createAction(
    '[Bills] Pay Bill Confirmed',
    props<{ bill: Bill, value: number }>()
  ),

  setCurrentBill: createAction(
    '[Bills] Set Current Bill',
    props<{ bill?: Bill }>()
  ),

};
