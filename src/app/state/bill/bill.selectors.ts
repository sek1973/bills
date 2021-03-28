import { AppState } from '../app/app.state';

export const selectBill = (state: AppState) => state.currentBill;
