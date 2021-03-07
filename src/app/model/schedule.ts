import { firestore } from 'firebase';

import Timestamp = firestore.Timestamp;
import { FieldDescription } from './field-description';

export interface Schedule {
  uid?: string;
  date: Timestamp;
  sum: number;
  remarks?: string;
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
