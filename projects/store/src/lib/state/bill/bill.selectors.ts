import { AppState } from '../app/app.state';


export const BillsSelectors = {

  selectBillId: (state: AppState) => state.data.currentBill,

  selectBill: (state: AppState) => state.data.bills.find(b => b.id === state.data.currentBill),

  selectAll: (state: AppState) => state.data.bills,

};
