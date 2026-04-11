import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { Payment } from '../model';
import { IMPORT_COLUMN_SEPARATOR, IMPORT_LINE_SEPARATOR, ImportReport } from './common';
import { PaymentsService } from './payments.service';

class TestPaymentsService extends PaymentsService {
  private counter = 0;
  load(): Observable<Payment[]> { throw new Error('not implemented'); }
  createPaymentData(p: Payment): Payment { return p; }
  add(): Observable<number> { this.counter += 1; return of(this.counter); }
  update(): Observable<boolean> { throw new Error('not implemented'); }
  delete(): Observable<boolean> { throw new Error('not implemented'); }
}

class FailingAddPaymentsService extends PaymentsService {
  load(): Observable<Payment[]> { throw new Error('not implemented'); }
  createPaymentData(p: Payment): Payment { return p; }
  add(): Observable<number> { return throwError(() => new Error('db fail')); }
  update(): Observable<boolean> { throw new Error('not implemented'); }
  delete(): Observable<boolean> { throw new Error('not implemented'); }
}

describe('PaymentsService.importPayments', () => {

  it('imports a single valid payment', async () => {
    const svc = new TestPaymentsService();
    const line = ['2026-04-01', '2026-04-02', '1234.56', 'note'].join(IMPORT_COLUMN_SEPARATOR);
    const res = await firstValueFrom(svc.importPayments(line, 42));
    expect(res).toHaveLength(1);
    const report: ImportReport = res[0];
    expect(report.id).toBe(1);
    expect(report.row).toBe(1);
    expect(report.label).toBe('2026-04-01');
  });

  it('returns warnings for invalid paiddate and sum', async () => {
    const svc = new TestPaymentsService();
    const line = ['2026-04-01', 'bad-date', 'bad-sum', 'm'].join(IMPORT_COLUMN_SEPARATOR);
    const res = await firstValueFrom(svc.importPayments(line, 7));
    // add + two warnings
    expect(res).toHaveLength(3);
    expect(res[0].id).toBe(1);
    const warnings = res.filter(r => r.warning).map(r => r.warning);
    expect(warnings.length).toBe(2);
    expect(warnings[0]).toContain('Nie można odczytać daty płatności');
    expect(warnings[1]).toContain('Nie można odczytać kwoty');
  });

  it('returns error when line cannot be parsed', async () => {
    const svc = new TestPaymentsService();
    const line = ['bad-deadline', '2026-04-02', '10', 'r'].join(IMPORT_COLUMN_SEPARATOR);
    const res = await firstValueFrom(svc.importPayments(line, 1));
    expect(res).toHaveLength(1);
    expect(res[0].error).toContain('Nie można zaimportować wiersza (1)');
    expect(res[0].label).toBe('bad-deadline');
  });

  it('returns error when add() throws', async () => {
    const svc = new FailingAddPaymentsService();
    const line = ['2026-04-01', '', '12.34', 'x'].join(IMPORT_COLUMN_SEPARATOR);
    const res = await firstValueFrom(svc.importPayments(line, 99));
    expect(res).toHaveLength(1);
    expect(res[0].error).toContain('2026.04.01 - db fail');
    expect(res[0].row).toBe(1);
  });

  it('handles multiple lines separated by line separator', async () => {
    const svc = new TestPaymentsService();
    const l1 = ['2026-04-01', '', '1', 'a'].join(IMPORT_COLUMN_SEPARATOR);
    const l2 = ['bad', '', '2', 'b'].join(IMPORT_COLUMN_SEPARATOR);
    const data = [l1, l2].join(IMPORT_LINE_SEPARATOR);
    const res = await firstValueFrom(svc.importPayments(data, 5));
    // first line -> id, second line -> error
    expect(res).toHaveLength(2);
    expect(res[0].id).toBe(1);
    expect(res[1].error).toBeDefined();
  });

});
