import { Bill, Payment, Schedule } from 'projects/model/src/lib/model';

export interface AppData {
    loggedIn: boolean;
    bills: Bill[];
    currentBill?: Bill;
    payments: Payment[];
    schedules: Schedule[];
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
    schedules: [],
    loading: false,
    error: undefined
};
