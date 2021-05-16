import { createReducer, on } from '@ngrx/store';
import { Bill, Payment } from 'projects/model/src/lib/model';
import { AuthActions } from '../auth';
import { BillApiActions, BillsActions } from '../bill';
import { PaymentApiActions, PaymentsActions } from '../payment';
import { AppData, appInitialState } from './app.state';

export const appReducer = createReducer<AppData>(
  appInitialState,

  on(AuthActions.login, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(AuthActions.loginSuccess, (data: AppData) => {
    return { ...data, loggedIn: true, loading: false };
  }),

  on(AuthActions.loginFailure, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(AuthActions.logout, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(AuthActions.logoutSuccess, (data: AppData) => {
    return { ...data, loggedIn: false, loading: false };
  }),

  on(AuthActions.logoutFailure, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.loadBills, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillApiActions.loadBillsSuccess, (data: AppData, action: { bills: Bill[] }) => {
    return { ...data, bills: action.bills, loading: false };
  }),

  on(BillApiActions.loadBillsFailure, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.setCurrentBill, (data: AppData, action: { billId: number }) => {
    return { ...data, currentBill: action.billId, loading: false };
  }),

  on(BillsActions.createBill, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillsActions.deleteBill, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.deleteBillConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillsActions.updateBill, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillsActions.payBill, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.payBillConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentsActions.loadPayments, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentApiActions.loadPaymentsSuccess, (data: AppData, action: { payments: Payment[] }) => {
    return { ...data, payments: action.payments, loading: false };
  }),

);
