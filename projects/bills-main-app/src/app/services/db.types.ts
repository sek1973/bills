export interface BillRow {
  id: number | null;
  position: number | null;
  name: string;
  description: string | null;
  active: boolean;
  url: string | null;
  login: string | null;
  sum: number;
  share: number;
  repeat: number;
  unit: number;
}

export interface PaymentRow {
  id: number | null;
  deadline: string;
  sum: number;
  paid_date: string | null;
  remarks: string | null;
  bill_id: number;
  reminder: string | null;
}

export interface OverviewBillRow {
  id: number;
  position: number | null;
  name: string;
  description: string | null;
  active: boolean;
  url: string | null;
  login: string | null;
  due_date: string | null;
  sum: number | null;
}
