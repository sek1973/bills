import { FieldDescription } from './field-description';

export class Schedule {
  id: number = -1;

  constructor(
    public date: Date,
    public sum: number = 0,
    public remarks?: string) { }
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
