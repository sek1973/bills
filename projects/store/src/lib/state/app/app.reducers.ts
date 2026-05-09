import { Bill, OverviewBill, Payment } from '@bills/model';
import { createReducer, on } from "@ngrx/store";
import { AuthActions } from "../auth";
import { BillApiActions, BillsActions } from "../bill";
import { PaymentApiActions, PaymentsActions } from "../payment";
import { AppData, appInitialState } from "./app.state";

export const appReducer = createReducer<AppData>(
  appInitialState,

  on(AuthActions.login, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(AuthActions.loginSuccess, (data: AppData) => {
    return { ...data, loggedIn: true, loading: false };
  }),

  on(AuthActions.logout, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(AuthActions.logoutSuccess, (data: AppData) => {
    return { ...data, loggedIn: false, loading: false };
  }),

  on(BillsActions.loadOverviewBills, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillApiActions.loadOverviewBillsSuccess, (data: AppData, action: { bills: OverviewBill[] }) => {
    return { ...data, bills: action.bills, loading: false };
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

  on(BillApiActions.deleteBillSuccess, (data: AppData) => {
    return { ...data, currentBill: undefined, loading: false };
  }),

  on(BillsActions.updateBill, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.updateBillConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillApiActions.updateBillSuccess, (data: AppData, action: { bill: Bill }) => {
    return { ...data, currentBill: action.bill, loading: false };
  }),

  on(BillsActions.payBill, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillsActions.payBillConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(BillsActions.payBillCancelled, (data: AppData) => {
    return { ...data, loading: false };
  }),

  on(BillApiActions.payBillSuccess, (data: AppData) => {
    return { ...data, loading: false };
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

  on(PaymentsActions.importPaymentsConfirmed, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(
    AuthActions.loginFailure,
    AuthActions.logoutFailure,
    BillApiActions.updateBillFailure,
    BillApiActions.createBillFailure,
    BillApiActions.deleteBillFailure,
    BillApiActions.payBillFailure,
    BillApiActions.loadOverviewBillsFailure,
    PaymentApiActions.loadPaymentsFailure,
    PaymentApiActions.updatePaymentFailure,
    PaymentApiActions.createPaymentFailure,
    PaymentApiActions.deletePaymentFailure,
    PaymentApiActions.importPaymentsFailure,
    (data: AppData) => {
      return { ...data, loading: false };
    }
  ),

);
