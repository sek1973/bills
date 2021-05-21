

export function getSafe(fn: () => any): any {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export function dateToString(val: Date): string | undefined {
  return (val !== undefined && val !== null) ? val.toLocaleDateString('pl-PL') : undefined;
}

/** Tries to read formats:
 * - yyyy-mm-dd
 * - yyyy.mm.dd
 * - dd.mm.yyyy
 * - dd-mm-yyyy
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

export function currencyToString(val: number, NaNvalue: any = 0): string | undefined {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  });
  if (val === undefined || val === null || Number.isNaN(+val)) {
    return formatter.format(NaNvalue);
  }
  return formatter.format(val);
}

export function currencyToNumber(val: string): number | undefined {
  if (val !== undefined && val !== null) {
    const cleaned = val.replace(/[^0-9\.,-]+/g, '').replace(',', '.');
    const result = Number(cleaned);
    return result;
  }
  return undefined;
}

export function percentToString(val: number, NaNvalue: any = 0): string | undefined {
  if (val === undefined || val === null || Number.isNaN(+val)) {
    return Math.round(NaNvalue * 100) + ' %';
  }
  return Math.round(val * 100) + ' %';
}

export function percentToNumber(val: string): number | undefined {
  if (val !== undefined && val !== null) {
    const cleaned = val.replace(/[^0-9\.,-]+/g, '').replace(',', '.');
    const result = Number(cleaned) / 100;
    return result;
  }
  return undefined;
}

export function addDays(days: number = 7, date: Date = new Date()): Date {
  const result = date;
  result.setDate(date.getDate() + days);
  return result;
}
