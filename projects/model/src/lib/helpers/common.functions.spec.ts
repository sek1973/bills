import { describe, expect, it } from 'vitest';
import { Unit } from '../model';
import {
  addDays,
  calculateNextDeadline,
  currencyToNumber,
  currencyToString,
  dateToString,
  percentToNumber,
  percentToString,
  stringToDate,
} from './common.functions';

describe('common.functions', () => {
  it('dateToString and stringToDate roundtrip', () => {
    const d = new Date(2020, 0, 2);
    expect(dateToString(d)).toBe(d.toLocaleDateString('pl-PL'));
    expect(stringToDate('2020-01-02')?.getTime()).toBe(d.getTime());
    expect(stringToDate('02.01.2020')?.getTime()).toBe(d.getTime());
    expect(stringToDate('2020.01.02')?.getTime()).toBe(d.getTime());
  });

  it('currencyToNumber parses multiple locales', () => {
    expect(currencyToNumber('2,849.89')).toBeCloseTo(2849.89);
    expect(currencyToNumber('2.849,89')).toBeCloseTo(2849.89);
    expect(currencyToNumber('1 234,56 zł')).toBeCloseTo(1234.56);
    expect(currencyToNumber('-')).toBeUndefined();
    expect(currencyToNumber(undefined as unknown as string)).toBeUndefined();
  });

  it('currencyToString and roundtrip back to number', () => {
    const val = 1234.56;
    const formatted = currencyToString(val) as string;
    expect(typeof formatted).toBe('string');
    const parsed = currencyToNumber(formatted);
    expect(parsed).toBeCloseTo(val, 2);
  });

  it('percent conversions', () => {
    expect(percentToString(0.123)).toBe('12 %');
    expect(percentToNumber('12 %')).toBeCloseTo(0.12);
    expect(percentToNumber('12%')).toBeCloseTo(0.12);
  });

  it('addDays adds days correctly', () => {
    const start = new Date(2020, 0, 1);
    const result = addDays(5, start);
    expect(result.getTime()).toBe(new Date(2020, 0, 6).getTime());
  });

  it('calculateNextDeadline handles end-of-month correctly', () => {
    const jan31 = new Date(2021, 0, 31);
    const next = calculateNextDeadline(jan31, Unit.Month, 1);
    expect(next.getMonth()).toBe(1); // February
    expect(next.getFullYear()).toBe(2021);
    expect(next.getDate()).toBe(28); // Feb 2021 has 28 days
  });
});
