import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import {
  getErrorMessage,
  validateBillName,
  validateDistinctBillName,
  validatePaymentReminderDate,
  validateScheduleDate
} from './validators';

describe('validators', () => {
  describe('validateBillName', () => {
    it('should return null if name matches', () => {
      const validator = validateBillName('test');
      const control = new UntypedFormControl('test');
      expect(validator(control)).toBeNull();
    });
    it('should return error if name does not match', () => {
      const validator = validateBillName('test');
      const control = new UntypedFormControl('other');
      expect(validator(control)).toEqual({ wrongName: { value: 'other' } });
    });
  });

  describe('validateDistinctBillName', () => {
    it('should return error if name is not distinct', () => {
      const validator = validateDistinctBillName(['a', 'b']);
      const control = new UntypedFormControl('a');
      expect(validator(control)).toEqual({ nameNotDistinct: { value: 'a' } });
    });
    it('should return null if name is distinct', () => {
      const validator = validateDistinctBillName(['a', 'b']);
      const control = new UntypedFormControl('c');
      expect(validator(control)).toBeNull();
    });
  });

  describe('validatePaymentReminderDate', () => {
    it('should return error if deadline is null and reminder is set', () => {
      const deadlineCtl = new UntypedFormControl(null);
      const validator = validatePaymentReminderDate(deadlineCtl);
      const control = new UntypedFormControl('2026-04-20');
      expect(validator(control)).toEqual({ noPaymentDate: { value: '2026-04-20' } });
    });
    it('should return error if reminder > deadline', () => {
      const deadlineCtl = new UntypedFormControl('2026-04-19');
      const validator = validatePaymentReminderDate(deadlineCtl);
      const control = new UntypedFormControl('2026-04-20');
      expect(validator(control)).toEqual({ reminderDateTooLate: { value: '2026-04-20' } });
    });
    it('should return null if reminder <= deadline', () => {
      const deadlineCtl = new UntypedFormControl('2026-04-21');
      const validator = validatePaymentReminderDate(deadlineCtl);
      const control = new UntypedFormControl('2026-04-20');
      expect(validator(control)).toBeNull();
    });
    it('should return null if both are null', () => {
      const deadlineCtl = new UntypedFormControl(null);
      const validator = validatePaymentReminderDate(deadlineCtl);
      const control = new UntypedFormControl(null);
      expect(validator(control)).toBeNull();
    });
  });

  describe('validateScheduleDate', () => {
    it('should return error if deadline is null and date is set', () => {
      const validator = validateScheduleDate(null);
      const control = new UntypedFormControl(new Date('2026-04-20'));
      expect(validator(control)).toEqual({ noPaymentDate: { value: control.value } });
    });
    it('should return error if date <= deadline', () => {
      const validator = validateScheduleDate(new Date('2026-04-21'));
      const control = new UntypedFormControl(new Date('2026-04-20'));
      expect(validator(control)).toEqual({ dateBeforeDeadline: { value: control.value } });
    });
    it('should return null if date > deadline', () => {
      const validator = validateScheduleDate(new Date('2026-04-19'));
      const control = new UntypedFormControl(new Date('2026-04-20'));
      expect(validator(control)).toBeNull();
    });
    it('should return null if both are null', () => {
      const validator = validateScheduleDate(null);
      const control = new UntypedFormControl(null);
      expect(validator(control)).toBeNull();
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages', () => {
      const group = new UntypedFormGroup({
        a: new UntypedFormControl('', { validators: [] })
      });
      group.get('a')!.setErrors({ minlength: { requiredLength: 5 } });
      expect(getErrorMessage(['a'], group)).toContain('Minimalna ilość znaków');
      group.get('a')!.setErrors({ wrongName: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Błędna nazwa rachunku');
      group.get('a')!.setErrors({ nameNotDistinct: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Powtórzona nazwa rachunku');
      group.get('a')!.setErrors({ noPaymentDate: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Brak daty dla płatności');
      group.get('a')!.setErrors({ reminderDateTooLate: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Przypomnienie za późno');
      group.get('a')!.setErrors({ dateBeforeDeadline: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Data musi być po terminie płatności w rachunku');
      group.get('a')!.setErrors({ scheduleDateNotDistinct: { value: 'x' } });
      expect(getErrorMessage(['a'], group)).toContain('Powtórzony plan płatności');
      group.get('a')!.setErrors({ required: true });
      expect(getErrorMessage(['a'], group)).toContain('Wartość wymagana');
      group.get('a')!.setErrors({ unknown: true });
      expect(getErrorMessage(['a'], group)).toBe('Niepoprawna wartość');
    });
  });
});
