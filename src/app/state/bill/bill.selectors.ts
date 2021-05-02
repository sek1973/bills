import { AppState } from '../app/app.state';

export const BillsSelectors = {

  selectBillId: (state: AppState) => {
    return state.currentBill;
  },

  selectBill: (state: AppState) => {
    return state.bills.find(b => b.id === state.currentBill);
  },

  selectAll: (state: AppState) => state.bills,

};
