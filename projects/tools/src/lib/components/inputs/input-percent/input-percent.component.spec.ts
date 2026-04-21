import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputPercentComponent } from './input-percent.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Percent', tooltipText: 'Enter percent', placeholderText: '0%' }) };
}

function setup(overrides: { editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ rate: new UntypedFormControl(overrides.value ?? '') });
  const fixture = TestBed.createComponent(InputPercentComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['rate']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputPercentComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputPercentComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('creates successfully', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('is visible when control exists', () => {
    const { component } = setup();
    expect(component.visible()).toBe(true);
  });

  it('is not visible when control does not exist', () => {
    const fg = new UntypedFormGroup({});
    const fixture = TestBed.createComponent(InputPercentComponent);
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
    const { component } = setup({ autoHide: true, editMode: false, value: '25%' });
    expect(component.visible()).toBe(true);
  });

  it('renders the input element when visible', () => {
    const { fixture } = setup();
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });
});
