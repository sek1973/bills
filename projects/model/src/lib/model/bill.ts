import { FieldDescription } from './field-description';
import { Unit } from './unit';

export class Bill {

  constructor(
    public lp?: number,
    public name: string = 'Nowy rachunek',
    public description?: string,
    public active: boolean = true,
    public url?: string,
    public login?: string,
    public password?: string,
    public sum: number = 0,
    public share: number = 1,
    public deadline?: Date,
    public repeat: number = 1,
    public unit: Unit = Unit.Month,
    public reminder?: Date,
    public id: number = -1) { }

  clone(id?: number): Bill {
    return new Bill(
      this.lp,
      this.name,
      this.description,
      this.active,
      this.url,
      this.login,
      this.password,
      this.sum,
      this.share,
      this.deadline,
      this.repeat,
      this.unit,
      this.reminder,
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
  ['deadline', {
    tooltipText: 'Podaj termin dla najbliższej płatności',
    placeholderText: 'Termin płatności',
    labelText: 'Termin płatności'
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
  ['reminder', {
    tooltipText: 'Podaj datę przypomnienia o płatności',
    placeholderText: 'Przypomnienie o płatności',
    labelText: 'Przypomnienie'
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
  ['password', {
    tooltipText: 'Podaj hasło, którego używasz na stronie logowania dystrybutora',
    placeholderText: 'Hasło do konta u dystrybutora',
    labelText: 'Hasło'
  }]
]);
