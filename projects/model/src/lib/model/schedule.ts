import { FieldDescription } from './field-description';

export class Schedule {

  constructor(
    public date?: Date,
    public sum: number = 0,
    public remarks?: string,
    public billId: number = -1,
    public id: number = -1) { }

  clone(id?: number): Schedule {
    return new Schedule(this.date, this.sum, this.remarks, this.billId, id);
  }
}

export const ScheduleDescription = new Map<string, FieldDescription>([
  ['date', {
    tooltipText: 'Podaj termin dla planowanej płatności',
    placeholderText: 'Termin płatności',
    labelText: 'Termin'
  }],
  ['sum', {
    tooltipText: 'Podaj kwotę do zapłacenia',
    placeholderText: 'Kwota do zapłacenia',
    labelText: 'Kwota'
  }],
  ['remarks', {
    tooltipText: 'Dodaj opcjonalny opis',
    placeholderText: 'Opis / uwagi',
    labelText: 'Opis'
  }]
]);
