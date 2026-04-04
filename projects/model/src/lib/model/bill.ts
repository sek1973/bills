import { FieldDescription } from './field-description';
import { Unit } from './unit';

export class Bill {

  constructor(
    public position?: number,
    public name: string = 'Nowy rachunek',
    public description?: string,
    public active: boolean = true,
    public url?: string,
    public login?: string,
    public sum: number = 0,
    public share: number = 1,
    public repeat: number = 1,
    public unit: Unit = Unit.Month,
    public id: number = -1) { }

  clone(id?: number): Bill {
    return new Bill(
      this.position,
      this.name,
      this.description,
      this.active,
      this.url,
      this.login,
      this.sum,
      this.share,
      this.repeat,
      this.unit,
      id);
  }
}

export const BillDescription = new Map<string, FieldDescription>([
  ['name', {
    tooltipText: 'Podaj nazwę rachunku do opłacania, np. Gaz.',
    placeholderText: 'Nazwa rachunku do opłacania (np. gaz.)',
    labelText: 'Nazwa rachunku'
  }],
  ['description', {
    tooltipText: 'Dodaj opcjonalny opis rachunku.',
    placeholderText: 'Opis / uwagi',
    labelText: 'Opis'
  }],
  ['active', {
    tooltipText: 'Odznacz, jeżeli rachunek (tymczasowo) nie ma być uwzględniany.',
    placeholderText: 'Aktywny',
    labelText: 'Aktywny'
  }],
  ['repeat', {
    tooltipText: 'Co ile jednostek (dni, miesięcy, lat) następuje rozliczenie',
    placeholderText: 'Co ile jednostek (np. co ile miesięcy)',
    labelText: 'Każde'
  }],
  ['unit', {
    tooltipText: 'Podaj jednostkę dla okresu rozliczania (dzień, miesiąc, rok...)',
    placeholderText: 'Jednostka okresu rozliczania np. miesiąc',
    labelText: 'Jednostka'
  }],
  ['sum', {
    tooltipText: 'Podaj kwotę do zapłacenia',
    placeholderText: 'Kwota do zapłacenia',
    labelText: 'Kwota'
  }],
  ['share', {
    tooltipText: 'Jeżeli rachunek opłacasz wspólnie, podaj Twój udział',
    placeholderText: 'Udział w opłacie',
    labelText: 'Udział'
  }],
  ['url', {
    tooltipText: 'Podaj adres www dla rachunku np. 24.energa.pl (strona do logowania)',
    placeholderText: 'Adres www rachunku - strona do logowania',
    labelText: 'Strona WWW'
  }],
  ['login', {
    tooltipText: 'Podaj login, którego używasz na stronie logowania dystrybutora',
    placeholderText: 'Login do konta u dystrybutora',
    labelText: 'Login'
  }],
  ['position', {
    tooltipText: 'Liczba porządkowa rachunku',
    placeholderText: 'Liczba porządkowa',
    labelText: 'Liczba porządkowa'
  },]
]);
