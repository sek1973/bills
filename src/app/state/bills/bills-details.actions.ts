import { createAction, props } from '@ngrx/store';
import { Bill } from 'src/app/model';

export const toggleProductCode = createAction(
  '[Bill Details] Toggle Bill Code'
);

export const setCurrentProduct = createAction(
  '[Bill Details] Set Current Bill',
  props<{ currentBillId: number }>()
);

export const clearCurrentProduct = createAction(
  '[Bill Details] Clear Current Bill'
);

export const initializeCurrentProduct = createAction(
  '[Bill Details] Initialize Current Bill'
);

export const loadProducts = createAction(
  '[Bill Details] Load'
);

export const updateProduct = createAction(
  '[Bill Details] Update Bill',
  props<{ bill: Bill }>()
);

export const createProduct = createAction(
  '[Bill Details] Create Bill',
  props<{ bill: Bill }>()
);

export const deleteProduct = createAction(
  '[Bill Details] Delete Bill',
  props<{ billId: number }>()
);
