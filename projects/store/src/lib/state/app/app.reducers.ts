import { Bill, OverviewBill, Payment } from '@bills/model';
import { createReducer, on } from "@ngrx/store";
import { AuthActions } from "../auth";
import { BillApiActions, BillsActions } from "../bill";
import { PaymentApiActions, PaymentsActions } from "../payment";
import { AppData, appInitialState } from "./app.state";

function recalcBillOverview(bills: Bill[], payments: Payment[], billId: number): Bill[] {
  return bills.map(b => {
    if (b.id !== billId) return b;
    const unpaid = payments
      .filter(p => p.billId === billId && !p.paiddate)
      .sort((a, z) => new Date(a.deadline).getTime() - new Date(z.deadline).getTime());
    const next = unpaid[0];
    return new OverviewBill(
      b.position, b.name, b.description, b.active, b.url, b.login, b.account,
      b.defaultSum, b.repeat, b.unit, b.id,
      next?.deadline instanceof Date ? next.deadline : next ? new Date(next.deadline) : undefined,
      next?.sum ?? 0,
    );
  });
}

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

  on(PaymentsActions.loadAllPayments, (data: AppData) => {
    return { ...data, loading: true };
  }),

  on(PaymentApiActions.loadAllPaymentsSuccess, (data: AppData, action: { payments: Payment[] }) => {
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

  on(BillApiActions.removeBill, (data: AppData, action) => ({
    ...data,
    bills: data.bills.filter(b => b.id !== action.billId),
    currentBill: data.currentBill?.id === action.billId ? undefined : data.currentBill,
  })),

  on(BillApiActions.upsertBill, (data: AppData, action) => {
    const isNew = !data.bills.some(b => b.id === action.bill.id);
    const bills = isNew
      ? [...data.bills, recalcBillOverview([new OverviewBill(
        action.bill.position, action.bill.name, action.bill.description, action.bill.active,
        action.bill.url, action.bill.login, action.bill.account,
        action.bill.defaultSum, action.bill.repeat, action.bill.unit, action.bill.id,
      )], data.payments, action.bill.id)[0]]
      : recalcBillOverview(
        data.bills.map(b => b.id === action.bill.id
          ? new OverviewBill(
            action.bill.position, action.bill.name, action.bill.description, action.bill.active,
            action.bill.url, action.bill.login, action.bill.account,
            action.bill.defaultSum, action.bill.repeat, action.bill.unit, action.bill.id,
          )
          : b
        ),
        data.payments,
        action.bill.id,
      );
    return { ...data, bills };
  }),

  on(PaymentApiActions.upsertPayment, (data: AppData, action) => {
    const payments = data.payments.some(p => p.id === action.payment.id)
      ? data.payments.map(p => p.id === action.payment.id ? action.payment : p)
      : [...data.payments, action.payment];
    return { ...data, payments, bills: recalcBillOverview(data.bills, payments, action.payment.billId!) };
  }),

  on(PaymentApiActions.removePayment, (data: AppData, action) => {
    const payments = data.payments.filter(p => p.id !== action.paymentId);
    return { ...data, payments, bills: recalcBillOverview(data.bills, payments, action.billId) };
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
    PaymentApiActions.loadAllPaymentsFailure,
    PaymentApiActions.updatePaymentFailure,
    PaymentApiActions.createPaymentFailure,
    PaymentApiActions.deletePaymentFailure,
    PaymentApiActions.importPaymentsFailure,
    (data: AppData) => {
      return { ...data, loading: false };
    }
  ),

);
