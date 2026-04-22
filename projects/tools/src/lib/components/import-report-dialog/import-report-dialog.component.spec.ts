import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportReport } from '@bills/model';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportReportDialogComponent } from './import-report-dialog.component';

function makeDialogRef() {
  return { close: vi.fn() };
}

const sampleData: ImportReport[] = [
  { row: 1, label: '2024-01-01', id: 10, error: undefined, warning: undefined },
  { row: 2, label: '2024-01-02', id: 20, error: 'Bad value', warning: undefined },
  { row: 3, label: '2024-01-03', id: 30, error: undefined, warning: 'Check value' }
];

describe('ImportReportDialogComponent', () => {
  let dialogRef: ReturnType<typeof makeDialogRef>;

  beforeEach(() => {
    dialogRef = makeDialogRef();
    TestBed.configureTestingModule({
      imports: [ImportReportDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: sampleData }
      ]
    });
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('maps data rows correctly', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds.length).toBe(3);
    expect(ds[0].row).toBe(1);
    expect(ds[0].status).toBe('OK');
    expect(ds[1].status).toBe('Błąd');
    expect(ds[2].status).toBe('Ostrzeżenie');
  });

  it('assigns error message for error rows', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[1].message).toBe('Bad value');
  });

  it('assigns warning message for warning rows', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[2].message).toBe('Check value');
  });

  it('assigns correct statusColor for error rows', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[1].statusColor).toBe('#c62828');
  });

  it('assigns correct statusColor for warning rows', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[2].statusColor).toBe('#e68600');
  });

  it('assigns correct statusColor for ok rows', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[0].statusColor).toBe('#2e7d32');
  });

  it('sorts rows by row number ascending', () => {
    const unorderedData: ImportReport[] = [
      { row: 3, label: 'C', id: 3 },
      { row: 1, label: 'A', id: 1 },
      { row: 2, label: 'B', id: 2 }
    ];
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ImportReportDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: unorderedData }
      ]
    });
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[0].row).toBe(1);
    expect(ds[1].row).toBe(2);
    expect(ds[2].row).toBe(3);
  });

  it('uses index+1 when row is not provided', () => {
    const noRowData: ImportReport[] = [
      { label: 'A', id: 1 },
      { label: 'B', id: 2 }
    ];
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ImportReportDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: noRowData }
      ]
    });
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[0].row).toBe(1);
    expect(ds[1].row).toBe(2);
  });

  it('uses "—" for missing id', () => {
    const noIdData: ImportReport[] = [{ row: 1, label: 'X' }];
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ImportReportDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: noIdData }
      ]
    });
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const ds = (fixture.componentInstance as any).dataSource;
    expect(ds[0].id).toBe('—');
  });

  it('renders the close button', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('Zamknij');
  });

  it('close() calls dialogRef.close()', () => {
    const fixture = TestBed.createComponent(ImportReportDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
