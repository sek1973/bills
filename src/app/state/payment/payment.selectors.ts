import { AppState } from '../app/app.state';

export const selectPayment = (state: AppState) => {
  return state.bills.find(b => b.id = state.currentBill);
};

export const selectAll = (state: AppState) => state.payments;
