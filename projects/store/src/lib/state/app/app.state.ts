import { Bill, Payment, Schedule } from 'projects/model/src/lib/model';

export interface AppState {
    loggedIn: boolean;
    bills: Bill[];
    currentBill: number;
    payments: Payment[];
    currentPayment: number;
    schedules: Schedule[];
    currentSchedule: number;
    error?: string;
}

export const appInitialState: AppState = {
    loggedIn: false,
    bills: [],
    currentBill: -1,
    payments: [],
    currentPayment: -1,
    schedules: [],
    currentSchedule: -1,
    error: undefined
};
