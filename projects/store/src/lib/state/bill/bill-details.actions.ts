import { createAction, props } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';

export const BillDetailsActions = {

  toggleBillCode: createAction(
    '[Bill View] Toggle Bill Code'
  ),

  setCurrentBill: createAction(
    '[Bill View] Set Current Bill',
    props<{ billId: number }>()
  ),

  clearCurrentBill: createAction(
    '[Bill View] Clear Current Bill'
  ),

  initializeCurrentBill: createAction(
    '[Bill View] Initialize Current Bill'
  ),

  loadBills: createAction(
    '[Bill View] Load'
  ),

  updateBill: createAction(
    '[Bill View] Update Bill',
    props<{ bill: Bill }>()
  ),

  createBill: createAction(
    '[Bill View] Create Bill',
    props<{ bill: Bill }>()
  ),

  deleteBill: createAction(
    '[Bill View] Delete Bill',
    props<{ bill: Bill }>()
  ),

  payBill: createAction(
    '[Bill View] Pay Bill',
    props<{ bill: Bill }>()
  ),

};
