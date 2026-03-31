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
  deadline: string | null;
  repeat: number;
  unit: number;
  reminder: string | null;
}

export interface PaymentRow {
  id: number | null;
  deadline: string;
  sum: number;
  share: number;
  paid_date: string | null;
  remarks: string | null;
  bill_id: number;
}

export interface ScheduleRow {
  id: number | null;
  date: string | null;
  sum: number;
  remarks: string | null;
  bill_id: number;
}
