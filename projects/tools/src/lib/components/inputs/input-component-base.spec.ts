import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider, InputBaseComponent } from './input-component-base';

@Component({ standalone: true, imports: [ReactiveFormsModule], template: '' })
class TestInputComponent extends InputBaseComponent { }

function makeProvider(label = 'Label', tooltip = 'Tip', placeholder = 'Ph'): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: label, tooltipText: tooltip, placeholderText: placeholder }) };
}

function createComponent(overrides: {
  formGroup?: UntypedFormGroup;
  path?: string[];
  descriptionProvider?: DescriptionProvider;
  editMode?: boolean;
  autoHide?: boolean;
} = {}): { fixture: ComponentFixture<TestInputComponent>; component: TestInputComponent; fg: UntypedFormGroup } {
  const fg = overrides.formGroup ?? new UntypedFormGroup({ name: new UntypedFormControl('') });
  const path = overrides.path ?? ['name'];

  const fixture = TestBed.createComponent(TestInputComponent);
  const component = fixture.componentInstance;

  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', path);
  fixture.componentRef.setInput('descriptionProvider', overrides.descriptionProvider ?? makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);

  fixture.detectChanges();
  return { fixture, component, fg };
}

describe('InputBaseComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestInputComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  describe('fieldName', () => {
    it('returns the last path segment for a single-level path', () => {
      const { component } = createComponent({ path: ['name'] });
      expect(component.fieldName()).toBe('name');
    });

    it('returns the last path segment for a multi-level path', () => {
      const nested = new UntypedFormGroup({ street: new UntypedFormControl('') });
      const fg = new UntypedFormGroup({ address: nested });
      const { component } = createComponent({ formGroup: fg, path: ['address', 'street'] });
      expect(component.fieldName()).toBe('street');
    });
  });

  describe('fieldFormGroup', () => {
    it('returns the root formGroup for a single-level path', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      const { component } = createComponent({ formGroup: fg, path: ['name'] });
      expect(component.fieldFormGroup()).toBe(fg);
    });

    it('returns the nested FormGroup for a multi-level path', () => {
      const nested = new UntypedFormGroup({ street: new UntypedFormControl('') });
      const fg = new UntypedFormGroup({ address: nested });
      const { component } = createComponent({ formGroup: fg, path: ['address', 'street'] });
      expect(component.fieldFormGroup()).toBe(nested);
    });

    it('falls back to root formGroup when nested path does not exist', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      const { component } = createComponent({ formGroup: fg, path: ['missing', 'field'] });
      expect(component.fieldFormGroup()).toBe(fg);
    });
  });

  describe('formControl', () => {
    it('returns the correct form control', () => {
      const ctrl = new UntypedFormControl('hello');
      const fg = new UntypedFormGroup({ name: ctrl });
      const { component } = createComponent({ formGroup: fg, path: ['name'] });
      expect(component.formControl()).toBe(ctrl);
    });

    it('returns null when the control does not exist in the formGroup', () => {
      const fg = new UntypedFormGroup({});
      const { component } = createComponent({ formGroup: fg, path: ['missing'] });
      expect(component.formControl()).toBeNull();
    });

    it('returns a nested control for a multi-level path', () => {
      const ctrl = new UntypedFormControl('city');
      const nested = new UntypedFormGroup({ city: ctrl });
      const fg = new UntypedFormGroup({ address: nested });
      const { component } = createComponent({ formGroup: fg, path: ['address', 'city'] });
      expect(component.formControl()).toBe(ctrl);
    });
  });

  describe('visible', () => {
    it('returns true when the control exists and editMode is true (default)', () => {
      const { component } = createComponent();
      expect(component.visible()).toBe(true);
    });

    it('returns false when the control does not exist', () => {
      const fg = new UntypedFormGroup({});
      const { component } = createComponent({ formGroup: fg, path: ['missing'] });
      expect(component.visible()).toBe(false);
    });

    it('returns false when autoHide=true, editMode=false, and value is empty string', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      const { component } = createComponent({ formGroup: fg, autoHide: true, editMode: false });
      expect(component.visible()).toBe(false);
    });

    it('returns false when autoHide=true, editMode=false, and value is null', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl(null) });
      const { component } = createComponent({ formGroup: fg, autoHide: true, editMode: false });
      expect(component.visible()).toBe(false);
    });

    it('returns false when autoHide=true, editMode=false, and value is undefined', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl(undefined) });
      const { component } = createComponent({ formGroup: fg, autoHide: true, editMode: false });
      expect(component.visible()).toBe(false);
    });

    it('returns true when autoHide=true, editMode=false, and value is non-empty', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('visible value') });
      const { component } = createComponent({ formGroup: fg, autoHide: true, editMode: false });
      expect(component.visible()).toBe(true);
    });

    it('returns true when autoHide=true, editMode=true, even if value is empty', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      const { component } = createComponent({ formGroup: fg, autoHide: true, editMode: true });
      expect(component.visible()).toBe(true);
    });
  });

  describe('description text computeds', () => {
    it('returns labelText from the descriptionProvider', () => {
      const { component } = createComponent({ descriptionProvider: makeProvider('My Label') });
      expect(component['_labelText']()).toBe('My Label');
    });

    it('returns tooltipText from the descriptionProvider', () => {
      const { component } = createComponent({ descriptionProvider: makeProvider('', 'My Tip') });
      expect(component['_tooltipText']()).toBe('My Tip');
    });

    it('returns placeholderText from the descriptionProvider', () => {
      const { component } = createComponent({ descriptionProvider: makeProvider('', '', 'Enter here') });
      expect(component['_placeholderText']()).toBe('Enter here');
    });

    it('falls back to empty string when descriptionProvider returns undefined for a field', () => {
      const provider: DescriptionProvider = { getDescriptionObj: () => undefined as any };
      const { component } = createComponent({ descriptionProvider: provider });
      expect(component['_labelText']()).toBe('');
      expect(component['_tooltipText']()).toBe('');
      expect(component['_placeholderText']()).toBe('');
    });
  });

  describe('editMode effect', () => {
    it('disables the fieldFormGroup when editMode is false', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      createComponent({ formGroup: fg, editMode: false });
      TestBed.tick();
      expect(fg.disabled).toBe(true);
    });

    it('enables the fieldFormGroup when editMode is true', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      fg.disable();
      createComponent({ formGroup: fg, editMode: true });
      TestBed.tick();
      expect(fg.enabled).toBe(true);
    });

    it('re-enables fieldFormGroup when editMode changes from false to true', () => {
      const fg = new UntypedFormGroup({ name: new UntypedFormControl('') });
      const { fixture } = createComponent({ formGroup: fg, editMode: false });
      TestBed.tick();
      expect(fg.disabled).toBe(true);

      fixture.componentRef.setInput('editMode', true);
      TestBed.tick();
      expect(fg.enabled).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    it('returns minlength error message', () => {
      const { component, fg } = createComponent();
      fg.get('name')!.setErrors({ minlength: { requiredLength: 5 } });
      expect(component.getErrorMessage(['name'])).toBe('Minimalna ilość znaków 5');
    });

    it('returns wrongName error message', () => {
      const { component, fg } = createComponent();
      fg.get('name')!.setErrors({ wrongName: { value: 'wrong' } });
      expect(component.getErrorMessage(['name'])).toBe('Błędna nazwa rachunku');
    });

    it('returns required error message', () => {
      const { component, fg } = createComponent();
      fg.get('name')!.setErrors({ required: true });
      expect(component.getErrorMessage(['name'])).toBe('Wartość wymagana');
    });

    it('returns fallback message for unrecognised error', () => {
      const { component, fg } = createComponent();
      fg.get('name')!.setErrors({ unknownError: true });
      expect(component.getErrorMessage(['name'])).toBe('Niepoprawna wartość');
    });
  });
});
