export interface OverviewBill {
  id: number;
  position?: number;
  name: string;
  description?: string;
  active: boolean;
  url?: string;
  login?: string;
  dueDate?: Date;
  sum: number;
}
