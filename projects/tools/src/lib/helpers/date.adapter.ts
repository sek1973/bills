import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatDateFormats, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

export const BILLS_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {
      dateInput: 'input',
      monthYearLabel: { year: 'numeric', month: 'numeric' },
      dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
      monthYearA11yLabel: { year: 'numeric', month: 'long' },
    } as Intl.DateTimeFormatOptions,
  }
};

@Injectable()
export class BillsDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: any): string {

    if (displayFormat.dateInput === 'input') {

      const day = String(date.getDate()).padStart(2, '0');
      const month = String((date.getMonth() + 1)).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    }

    return date.toDateString();
  }

  parse(value: any): Date | null {
    if (value === undefined || value === null) {
      return null;
    }
    const dateTime = value.split('.');
    return new Date(+dateTime[2], +dateTime[1] - 1, +dateTime[0]);
  }
}

/**
 * Compares date parts only of two dates.
 * Returns:
 *   0 if dates are equal.
 *   1 if date1 is greater than date2
 *   -1 if date1 is smaller than date2
 * Empty date is treated as smaller.
 * If both dates are empty returns 0.
 * @param date1 first date to compare
 * @param date2 second date to compare
 */
export function compareDates(date1: Date | null = null, date2: Date | null = null): number {
  if (date1 === null && date2 === null) { return 0; }
  if (date1 === null) { return -1; }
  if (date2 === null) { return 1; }
  const a = formatDate(date1, 'YYYY-MM-dd', 'en-US');
  const b = formatDate(date2, 'YYYY-MM-dd', 'en-US');
  if (a === b) { return 0; }
  if (a > b) { return 1; } else { return -1; }
}
