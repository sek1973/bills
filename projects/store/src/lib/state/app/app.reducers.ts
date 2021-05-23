import { createReducer, on } from '@ngrx/store';
import { Bill, Payment, Schedule } from 'projects/model/src/lib/model';
import { AuthActions } from '../auth';
import { BillApiActions, BillsActions } from '../bill';
import { PaymentApiActions, PaymentsActions } from '../payment';
import { ScheduleApiActions, SchedulesActions } from '../schedule';
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

  on(BillsActions.setCurrentBill, (data: AppData, action: { bill?: Bill }) => {
    return { ...data, currentBill: action.bill, loading: false };
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

  on(PaymentsActions.createPayment, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentsActions.deletePaymentConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentApiActions.deletePaymentSuccess, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(PaymentsActions.updatePayment, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(SchedulesActions.loadSchedules, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentsActions.importPaymentsConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(ScheduleApiActions.loadSchedulesSuccess, (data: AppData, action: { schedules: Schedule[] }) => {
    return { ...data, schedules: action.schedules, loading: false };
  }),

  on(SchedulesActions.createSchedule, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(SchedulesActions.deleteScheduleConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(ScheduleApiActions.deleteScheduleSuccess, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(SchedulesActions.updateSchedule, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(SchedulesActions.importSchedulesConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

);
