import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const setCurrentBill = createAction(
    '[Bills] Set Current Bill',
    props<{ currentBillId: number }>()
);

export const clearCurrentBill = createAction(
    '[Bills] Clear Current Bill'
);

export const initializeCurrentBill = createAction(
    '[Bills] Initialize Current Bill'
);

export const loadBills = createAction(
    '[Bills] Load'
);

export const updateBill = createAction(
    '[Bills] Update Bill',
    props<{ pbill: Bill }>()
);

export const createBill = createAction(
    '[Bills] Create Bill',
    props<{ pbill: Bill }>()
);

export const deleteBill = createAction(
    '[Bills] Delete Bill',
    props<{ pbillId: number }>()
);
