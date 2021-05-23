import { AppState } from '../app/app.state';


export const BillsSelectors = {

  selectBill: (state: AppState) => state.data.currentBill,

  selectAll: (state: AppState) => state.data.bills,

};
