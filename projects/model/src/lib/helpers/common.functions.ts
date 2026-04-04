import moment from 'moment';
import { Unit } from '../model';

export function dateToString(val: Date): string | undefined {
  return (val !== undefined && val !== null) ? val.toLocaleDateString('pl-PL') : undefined;
}

/** Tries to read formats:
 * - yyyy-mm-dd
 * - yyyy.mm.dd
 * - dd.mm.yyyy
 * - dd-mm-yyyy
 * @param {string} val
 * @return {Date | undefined} date
 */
export function stringToDate(val: string): Date | undefined {
  if (val === undefined || val === null || val === '') { return undefined; }
  let date = val.split('-');
  if (date.length !== 3) { date = val.split('.'); }
  if (date.length !== 3) { return undefined; }
  const date0: number = parseInt(date[0], 10);
  const date1: number = parseInt(date[1], 10);
  const date2: number = parseInt(date[2], 10);
  if (date0 > 1900 && date0 < 9999 && date1 > 0 && date1 < 13 && date2 > 0 && date2 < 32) {
    return new Date(date0, date1 - 1, date2);
  }
  if (date2 > 1900 && date2 < 9999 && date1 > 0 && date1 < 13 && date0 > 0 && date0 < 32) {
    return new Date(date2, date1 - 1, date0);
  }
  return undefined;
}

export function currencyToString(val: number, NaNvalue: unknown = 0): string | undefined {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  });
  if (val === undefined || val === null || Number.isNaN(+val)) {
    return formatter.format(NaNvalue as number);
  }
  return formatter.format(val);
}

export function currencyToNumber(val: string): number | undefined {
  if (val !== undefined && val !== null) {
    const cleaned = val.replace(/[^0-9.,-]+/g, '').replace(',', '.');
    const result = Number(cleaned);
    return result;
  }
  return undefined;
}

export function percentToString(val: number, NaNvalue: unknown = 0): string | undefined {
  if (val === undefined || val === null || Number.isNaN(+val)) {
    return Math.round((NaNvalue as number) * 100) + ' %';
  }
  return Math.round(val * 100) + ' %';
}

export function percentToNumber(val: string): number | undefined {
  if (val !== undefined && val !== null) {
    const cleaned = val.replace(/[^0-9.,-]+/g, '').replace(',', '.');
    const result = Number(cleaned) / 100;
    return result;
  }
  return undefined;
}

export function addDays(days: number = 7, date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateNextDeadline(
  deadline?: Date,
  unit: Unit = Unit.Month,
  repeat: number = 1): Date {
  const m = deadline ? moment(deadline) : moment();
  const originalDay = m.date();
  switch (unit) {
    case Unit.Day:
      m.add(repeat, 'days');
      break;
    case Unit.Week:
      m.add(7 * repeat, 'days');
      break;
    case Unit.Month: {
      const isOrigLast = originalDay === m.clone().endOf('month').date();
      m.add(repeat, 'months');
      if (isOrigLast) m.endOf('month');
      else m.date(Math.min(originalDay, m.daysInMonth()));
      break;
    }
    case Unit.Year: {
      const isOrigLast = originalDay === m.clone().endOf('month').date();
      m.add(repeat, 'years');
      if (isOrigLast) m.endOf('month');
      else m.date(Math.min(originalDay, m.daysInMonth()));
      break;
    }
    default:
      break;
  }
  return m.toDate();
}
