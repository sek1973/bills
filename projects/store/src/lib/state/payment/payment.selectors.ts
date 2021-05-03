import { AppState } from '../app/app.state';

export const PaymentsSelectors = {

  selectPayment: (state: AppState) => {
    return state.bills.find(b => b.id = state.currentBill);
  },

  selectAll: (state: AppState) => state.payments,

};
