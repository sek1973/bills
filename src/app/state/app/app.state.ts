import { Bill } from 'src/app/model';

export interface AppState {
    currentBill: number;
    bills: Bill[];
}
