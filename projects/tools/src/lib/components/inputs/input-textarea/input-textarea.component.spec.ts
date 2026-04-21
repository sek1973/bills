import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputTextareaComponent } from './input-textarea.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Notes', tooltipText: 'Enter notes', placeholderText: 'Type here...' }) };
}

function setup(overrides: { inputMinRows?: number; inputMaxRows?: number; editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ notes: new UntypedFormControl(overrides.value ?? '') });
  const fixture = TestBed.createComponent(InputTextareaComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['notes']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.inputMinRows !== undefined) fixture.componentRef.setInput('inputMinRows', overrides.inputMinRows);
  if (overrides.inputMaxRows !== undefined) fixture.componentRef.setInput('inputMaxRows', overrides.inputMaxRows);
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputTextareaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputTextareaComponent],
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

  it('is hidden when autoHide=true, editMode=false, and value is empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: '' });
    expect(component.visible()).toBe(false);
  });

  it('is visible when autoHide=true, editMode=false, and value is non-empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: 'some notes' });
    expect(component.visible()).toBe(true);
  });

  describe('inputMinRows', () => {
    it('defaults to 10', () => {
      const { component } = setup();
      expect(component.inputMinRows()).toBe(10);
    });

    it('accepts a custom value', () => {
      const { component } = setup({ inputMinRows: 3 });
      expect(component.inputMinRows()).toBe(3);
    });
  });

  describe('inputMaxRows', () => {
    it('defaults to 10', () => {
      const { component } = setup();
      expect(component.inputMaxRows()).toBe(10);
    });

    it('accepts a custom value', () => {
      const { component } = setup({ inputMaxRows: 20 });
      expect(component.inputMaxRows()).toBe(20);
    });
  });

  it('renders the textarea element when visible', () => {
    const { fixture } = setup();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
