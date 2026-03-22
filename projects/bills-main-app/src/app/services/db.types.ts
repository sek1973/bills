export interface BillRow {
  id: number;
  lp: number | null;
  name: string;
  description: string | null;
  active: boolean;
  url: string | null;
  login: string | null;
  password: string | null;
  sum: number;
  share: number;
  deadline: string | null;
  repeat: number;
  unit: number;
  reminder: string | null;
}

export interface PaymentRow {
  id: number;
  deadline: string;
  sum: number;
  share: number;
  paid_date: string | null;
  remarks: string | null;
  bill_id: number;
}

export interface ScheduleRow {
  id: number;
  date: string | null;
  sum: number;
  remarks: string | null;
  bill_id: number;
}
