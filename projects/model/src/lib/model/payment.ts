import { FieldDescription } from './field-description';

export class Payment {
  id: number = -1;

  constructor(
    public deadline = new Date(),
    public sum: number = 0,
    public share: number = 1,
    public paiddate?: Date,
    public remarks?: string,
    public billId?: number
  ) { }
}

export const PaymentDescription = new Map<string, FieldDescription>([
  ['deadline', {
    tooltipText: 'Podaj termin płatności',
    placeholderText: 'Termin płatności',
    labelText: 'Termin'
  }],
  ['paiddate', {
    tooltipText: 'Podaj datę opłacenia rachunku',
    placeholderText: 'Data opłacenia',
    labelText: 'Opłacono'
  }],
  ['sum', {
    tooltipText: 'Podaj kwotę do zapłacenia',
    placeholderText: 'Kwota do zapłacenia',
    labelText: 'Kwota'
  }],
  ['share', {
    tooltipText: 'Podaj kwotę jaka została zapłacona',
    placeholderText: 'Kwota zapłacona / udział',
    labelText: 'Udział'
  }],
  ['remarks', {
    tooltipText: 'Dodaj opcjonalny opis',
    placeholderText: 'Opis / uwagi',
    labelText: 'Opis'
  }]]);
