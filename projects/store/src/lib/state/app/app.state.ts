import { Bill, Payment } from 'projects/model/src/lib/model';

export interface AppData {
    loggedIn: boolean;
    bills: Bill[];
    currentBill?: Bill;
    payments: Payment[];
    loading: boolean;
    error?: string;
}

export interface AppState {
    data: AppData;
}

export const appInitialState: AppData = {
    loggedIn: false,
    bills: [],
    currentBill: undefined,
    payments: [],
    loading: false,
    error: undefined
};
