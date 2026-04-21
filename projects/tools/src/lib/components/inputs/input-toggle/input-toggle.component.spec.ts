import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputToggleComponent } from './input-toggle.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Active', tooltipText: 'Toggle active state', placeholderText: 'Active' }) };
}

function setup(overrides: { editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ active: new UntypedFormControl('value' in overrides ? overrides.value : false) });
  const fixture = TestBed.createComponent(InputToggleComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['active']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputToggleComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputToggleComponent],
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
    const fixture = TestBed.createComponent(InputToggleComponent);
    fixture.componentRef.setInput('formGroup', fg);
    fixture.componentRef.setInput('path', ['missing']);
    fixture.componentRef.setInput('descriptionProvider', makeProvider());
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('is hidden when autoHide=true, editMode=false, and value is null', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: null });
    expect(component.visible()).toBe(false);
  });

  it('is visible when autoHide=true, editMode=false, and value is true', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: true });
    expect(component.visible()).toBe(true);
  });

  it('renders the slide-toggle element when visible', () => {
    const { fixture } = setup();
    const toggle = fixture.nativeElement.querySelector('mat-slide-toggle');
    expect(toggle).toBeTruthy();
  });

  it('disables the form control when editMode is false', () => {
    const fg = new UntypedFormGroup({ active: new UntypedFormControl(false) });
    const fixture = TestBed.createComponent(InputToggleComponent);
    fixture.componentRef.setInput('formGroup', fg);
    fixture.componentRef.setInput('path', ['active']);
    fixture.componentRef.setInput('descriptionProvider', makeProvider());
    fixture.componentRef.setInput('editMode', false);
    fixture.detectChanges();
    TestBed.tick();
    expect(fg.disabled).toBe(true);
  });
});
