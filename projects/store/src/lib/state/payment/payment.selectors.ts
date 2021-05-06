import { AppState } from '../app/app.state';

export const PaymentsSelectors = {

  selectPayment: (state: AppState) => {
    return state.data.bills.find(b => b.id = state.data.currentBill);
  },

  selectAll: (state: AppState) => state.data.payments,

};
