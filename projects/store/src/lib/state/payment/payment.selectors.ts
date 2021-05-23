import { AppState } from '../app/app.state';

export const PaymentsSelectors = {

  selectAll: (state: AppState) => state.data.payments,

};
