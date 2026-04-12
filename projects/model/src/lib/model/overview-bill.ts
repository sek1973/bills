import { Bill } from './bill';
import { Unit } from './unit';

export class OverviewBill extends Bill {
  constructor(
    position?: number,
    name: string = 'Nowy rachunek',
    description?: string,
    active: boolean = true,
    url?: string,
    login?: string,
    account?: string,
    defaultSum: number = 0,
    repeat: number = 1,
    unit: Unit = Unit.Month,
    id: number = -1,
    public dueDate?: Date,
    public sum: number = 0,
  ) {
    super(position, name, description, active, url, login, account, defaultSum, repeat, unit, id);
  }
}
