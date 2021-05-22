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
