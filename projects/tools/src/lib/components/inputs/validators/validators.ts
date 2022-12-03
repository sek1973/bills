import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { Schedule } from 'projects/model/src/lib/model';
import { compareDates } from '../../../helpers/date.adapter';

export function validateBillName(billName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value === billName) {
      return null;
    } else {
      return { wrongName: { value: control.value } };
    }
  };
}

export function validateDistinctBillName(billNames: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && billNames && billNames.indexOf(control.value) >= 0) {
      return { nameNotDistinct: { value: control.value } };
    } else {
      return null;
    }
  };
}

export function validatePaymentReminderDate(deadlineCtl: UntypedFormControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const deadline = deadlineCtl.value || null;
    const reminder = control.value || null;
    if (deadline === null && reminder !== null) {
      return { noPaymentDate: { value: control.value } };
    } else if (deadline !== null && reminder !== null && reminder > deadline) {
      return { reminderDateTooLate: { value: control.value } };
    } else {
      return null;
    }
  };
}

export function validateScheduleDate(deadline: Date | null = null): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const date = control.value || null;
    if (deadline === null && date !== null) {
      return { noPaymentDate: { value: control.value } };
    } else if (deadline !== null && date !== null && date <= deadline) {
      return { dateBeforeDeadline: { value: control.value } };
    } else {
      return null;
    }
  };
}

export function validateDisinctScheduleDate(schedules: Schedule[], schedule?: Schedule): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const dates = schedules.filter(s => s !== schedule).map(s => s.date);
    if (control.value && dates && dates.findIndex(d => compareDates(control.value, d) === 0) >= 0) {
      return { scheduleDateNotDistinct: { value: control.value } };
    } else {
      return null;
    }
  };
}

export function getErrorMessage(path: string[], formGroup: UntypedFormGroup): string {
  const formControl = formGroup.get(path);
  let result: string = '';
  if (formControl !== null && formControl.errors) {
    const errors = formControl.errors;
    if (errors.minlength) { result = 'Minimalna ilość znaków ' + errors.minlength.requiredLength; }
    else if (errors.wrongName) { result = 'Błędna nazwa rachunku'; }
    else if (errors.nameNotDistinct) { result = 'Powtórzona nazwa rachunku'; }
    else if (errors.noPaymentDate) { result = 'Brak daty dla płatności'; }
    else if (errors.reminderDateTooLate) { result = 'Przypomnienie za późno'; }
    else if (errors.dateBeforeDeadline) { result = 'Data musi być po terminie płatności w rachunku'; }
    else if (errors.minlength) { result = 'Maksymalna ilość znaków ' + errors.maxLength.requiredLength; }
    else if (errors.scheduleDateNotDistinct) { result = 'Powtórzony plan płatności'; }
    else if (errors.required) { result = 'Wartość wymagana'; }
  }
  return result || 'Niepoprawna wartość';
}
