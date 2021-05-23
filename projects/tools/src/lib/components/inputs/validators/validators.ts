import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Schedule } from 'projects/model/src/lib/model';

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
    } else if (deadline !== null && reminder !== null && reminder <= deadline) {
      return { reminderDateTooEarly: { value: control.value } };
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
      return { reminderDateTooEarly: { value: control.value } };
    } else {
      return null;
    }
  };
}

export function validateDisinctScheduleDate(schedules: Schedule[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && schedules && schedules.map(s => s.date).indexOf(control.value) >= 0) {
      return { scheduleDateNotDistinct: { value: control.value } };
    } else {
      return null;
    }
  };
}
