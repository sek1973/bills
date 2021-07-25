import { FieldDescription } from './field-description';

export class Payment {

  constructor(
    public deadline = new Date(),
    public sum: number = 0,
    public share: number = 1,
    public paidDate?: Date,
    public remarks?: string,
    public billId?: number,
    public id: number = -1
  ) { }

  clone(id?: number, billId = this.billId): Payment {
    return new Payment(this.deadline, this.sum, this.share, this.paidDate, this.remarks, billId, id);
  }
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
