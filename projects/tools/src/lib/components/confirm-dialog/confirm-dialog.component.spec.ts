import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogInputType } from './confirm-dialog.model';

function makeDialogRef() {
  return { close: vi.fn() };
}

function setup(data: object = {}) {
  const dialogRef = makeDialogRef();
  const defaultData = { dialogTitle: 'Test Title', message: 'Are you sure?' };
  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, dialogRef };
}

describe('ConfirmDialogComponent', () => {
  let dialogRef: ReturnType<typeof makeDialogRef>;

  beforeEach(() => {
    dialogRef = makeDialogRef();

    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { dialogTitle: 'Confirm', message: 'Are you sure?' }
        }
      ]
    });
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders title and message from data', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Confirm');
    expect(el.textContent).toContain('Are you sure?');
  });

  it('uses default button labels when not provided', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    const { component } = { component: fixture.componentInstance };
    expect((component as any).cancelButtonLabel).toBe('Cancel');
    expect((component as any).applyButtonLabel).toBe('Apply');
  });

  it('cancel button is visible by default', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('onCancel() closes dialog with false', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('onApply() closes dialog with response true when no input', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.onApply();
    expect(dialogRef.close).toHaveBeenCalledWith({ response: true, value: undefined });
  });

  describe('with custom labels', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, ReactiveFormsModule],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              dialogTitle: 'Delete',
              message: 'Delete item?',
              cancelButtonLabel: 'No',
              applyButtonLabel: 'Yes'
            }
          }
        ]
      });
    });

    it('uses provided button labels', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const { component } = { component: fixture.componentInstance };
      expect((component as any).cancelButtonLabel).toBe('No');
      expect((component as any).applyButtonLabel).toBe('Yes');
    });
  });

  describe('with cancelButtonVisible=false', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, ReactiveFormsModule],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              dialogTitle: 'Alert',
              message: 'Something happened',
              cancelButtonVisible: false
            }
          }
        ]
      });
    });

    it('hides cancel button when cancelButtonVisible is false', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });
  });

  describe('with text input', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, ReactiveFormsModule],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              dialogTitle: 'Enter name',
              message: 'Provide a name',
              inputType: ConfirmDialogInputType.InputTypeText,
              inputValue: 'initial',
              inputLabelText: 'Name',
              inputPlaceholderText: 'Type name',
              inputTooltipText: ''
            }
          }
        ]
      });
    });

    it('creates with text input type', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      expect((fixture.componentInstance as any).inputType).toBe(ConfirmDialogInputType.InputTypeText);
    });

    it('initializes form with provided value', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      expect((fixture.componentInstance as any).form.get('input')?.value).toBe('initial');
    });

    it('onApply() closes with form value', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      (fixture.componentInstance as any).form.get('input')?.setValue('updated');
      fixture.componentInstance.onApply();
      expect(dialogRef.close).toHaveBeenCalledWith({ response: true, value: 'updated' });
    });

    it('canApply is false when required validator fails', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, ReactiveFormsModule],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              dialogTitle: 'Required',
              message: 'Enter value',
              inputType: ConfirmDialogInputType.InputTypeText,
              inputValue: '',
              inputValidators: Validators.required
            }
          }
        ]
      });
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      expect((fixture.componentInstance as any).canApply()).toBe(false);
    });

    it('canApply becomes true when required field is filled', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, ReactiveFormsModule],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              dialogTitle: 'Required',
              message: 'Enter value',
              inputType: ConfirmDialogInputType.InputTypeText,
              inputValue: 'hello',
              inputValidators: Validators.required
            }
          }
        ]
      });
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      expect((fixture.componentInstance as any).canApply()).toBe(true);
    });
  });
});
