import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
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

export function validatePaymentReminderDate(deadlineCtl: FormControl): ValidatorFn {
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

export function getErrorMessage(path: string[], formGroup: FormGroup): string {
  const formControl = formGroup.get(path);
  let result: string = '';
  if (formControl !== null && formControl.errors) {
    const errors = formControl.errors;
    if (errors.minlength) { result = 'Minimalna ilo???? znak??w ' + errors.minlength.requiredLength; }
    else if (errors.wrongName) { result = 'B????dna nazwa rachunku'; }
    else if (errors.nameNotDistinct) { result = 'Powt??rzona nazwa rachunku'; }
    else if (errors.noPaymentDate) { result = 'Brak daty dla p??atno??ci'; }
    else if (errors.reminderDateTooLate) { result = 'Przypomnienie za p????no'; }
    else if (errors.dateBeforeDeadline) { result = 'Data musi by?? po terminie p??atno??ci w rachunku'; }
    else if (errors.minlength) { result = 'Maksymalna ilo???? znak??w ' + errors.maxLength.requiredLength; }
    else if (errors.scheduleDateNotDistinct) { result = 'Powt??rzony plan p??atno??ci'; }
    else if (errors.required) { result = 'Warto???? wymagana'; }
  }
  return result || 'Niepoprawna warto????';
}
