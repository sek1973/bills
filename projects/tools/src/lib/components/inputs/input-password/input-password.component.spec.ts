import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputPasswordComponent } from './input-password.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Password', tooltipText: 'Enter password', placeholderText: '••••••' }) };
}

function setup(overrides: { editMode?: boolean; autoHide?: boolean } = {}) {
  const fg = new UntypedFormGroup({ password: new UntypedFormControl('') });
  const fixture = TestBed.createComponent(InputPasswordComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['password']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputPasswordComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputPasswordComponent],
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

  describe('hide signal', () => {
    it('is true by default', () => {
      const { component } = setup();
      expect(component.hide()).toBe(true);
    });

    it('toggles to false when onClick is called', () => {
      const { component } = setup();
      component.onClick(new MouseEvent('click'));
      expect(component.hide()).toBe(false);
    });

    it('toggles back to true on a second onClick call', () => {
      const { component } = setup();
      component.onClick(new MouseEvent('click'));
      component.onClick(new MouseEvent('click'));
      expect(component.hide()).toBe(true);
    });
  });

  it('renders the input with type="password" when hide is true', () => {
    const { fixture } = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });

  it('renders the input with type="text" when hide is false', () => {
    const { fixture, component } = setup();
    component.onClick(new MouseEvent('click'));
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('text');
  });

  it('renders the toggle button', () => {
    const { fixture } = setup();
    const button = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(button).toBeTruthy();
  });
});
