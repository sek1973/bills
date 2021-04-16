import { AppState } from '../app/app.state';

export const selectBill = (state: AppState) => state.currentBill;

export const selectAll = (state: AppState) => state.bills;
