import { createAction, props } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';

export const BillsActions = {

  setCurrentBill: createAction(
    '[Bills] Set Current Bill',
    props<{ currentBillId: number }>()
  ),

  clearCurrentBill: createAction(
    '[Bills] Clear Current Bill'
  ),

  initializeCurrentBill: createAction(
    '[Bills] Initialize Current Bill'
  ),

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

  payBill: createAction(
    '[Bills] Pay Bill',
    props<{ bill: Bill }>()
  ),

};
