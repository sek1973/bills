import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

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
    const paymentDate = deadlineCtl.value;
    const deadlineEmpty = paymentDate === null || paymentDate === undefined;
    const reminderDateEmpty = control.value === null || control.value === undefined;
    if (deadlineEmpty && !reminderDateEmpty) {
      return { noPaymentDate: { value: control.value } };
    } else if (!deadlineEmpty && !reminderDateEmpty && control.value <= paymentDate) {
      return { reminderDateTooEarly: { value: control.value } };
    } else {
      return null;
    }
  };
}
