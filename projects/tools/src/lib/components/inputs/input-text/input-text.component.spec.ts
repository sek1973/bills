import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputTextComponent } from './input-text.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Name', tooltipText: 'Enter name', placeholderText: 'Type here...' }) };
}

function setup(overrides: { type?: string; editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ name: new UntypedFormControl(overrides.value ?? '') });
  const fixture = TestBed.createComponent(InputTextComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['name']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.type !== undefined) fixture.componentRef.setInput('type', overrides.type);
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputTextComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputTextComponent],
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
    const { component } = setup({ autoHide: true, editMode: false, value: 'hello' });
    expect(component.visible()).toBe(true);
  });

  describe('type input', () => {
    it('defaults to "text"', () => {
      const { component } = setup();
      expect(component.type()).toBe('text');
    });

    it('can be set to "email"', () => {
      const { component } = setup({ type: 'email' });
      expect(component.type()).toBe('email');
    });

    it('can be set to "number"', () => {
      const { component } = setup({ type: 'number' });
      expect(component.type()).toBe('number');
    });

    it('renders the input with the given type', () => {
      const { fixture } = setup({ type: 'email' });
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('email');
    });
  });

  it('renders the input element when visible', () => {
    const { fixture } = setup();
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });
});
