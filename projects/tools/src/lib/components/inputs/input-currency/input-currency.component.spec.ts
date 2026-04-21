import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputCurrencyComponent } from './input-currency.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Amount', tooltipText: 'Enter amount', placeholderText: '0.00' }) };
}

function setup(overrides: { editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ amount: new UntypedFormControl(overrides.value ?? '') });
  const fixture = TestBed.createComponent(InputCurrencyComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['amount']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputCurrencyComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputCurrencyComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('creates successfully', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('is visible when control exists and editMode is true', () => {
    const { component } = setup();
    expect(component.visible()).toBe(true);
  });

  it('is not visible when control does not exist in the formGroup', () => {
    const fg = new UntypedFormGroup({});
    const fixture = TestBed.createComponent(InputCurrencyComponent);
    fixture.componentRef.setInput('formGroup', fg);
    fixture.componentRef.setInput('path', ['missing']);
    fixture.componentRef.setInput('descriptionProvider', makeProvider());
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('is hidden when autoHide=true, editMode=false, and value is empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: '' });
    expect(component.visible()).toBe(false);
  });

  it('is visible when autoHide=true, editMode=false, and value is non-empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: '100.50' });
    expect(component.visible()).toBe(true);
  });

  it('renders the input element when visible', () => {
    const { fixture } = setup();
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });
});
