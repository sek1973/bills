import { Bill } from 'src/app/model';

export interface AppState {
    currentBill: number;
    loggedIn: boolean;
    bills: Bill[];
}
