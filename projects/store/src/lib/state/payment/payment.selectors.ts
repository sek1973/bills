import { AppState } from '../app/app.state';

export const PaymentsSelectors = {

  selectAll: (state: AppState) => state.data.payments,

  selectByBillId: (billId: number) => (state: AppState) => state.data.payments.filter(p => p.billId === billId),

};
