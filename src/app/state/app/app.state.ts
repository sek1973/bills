import { Bill } from 'src/app/model';

export interface AppState {
    currentBill: number;
    loggedIn: boolean;
    bills: Bill[];
    error?: string;
}

export const appInitialState: AppState = {
    currentBill: -1,
    loggedIn: false,
    bills: [],
    error: undefined
};
