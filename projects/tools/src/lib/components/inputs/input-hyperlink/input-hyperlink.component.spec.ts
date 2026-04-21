import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputHyperlinkComponent } from './input-hyperlink.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'URL', tooltipText: 'Enter a URL', placeholderText: 'https://...' }) };
}

function setup(overrides: { value?: string; editMode?: boolean; autoHide?: boolean } = {}) {
  const fg = new UntypedFormGroup({ url: new UntypedFormControl(overrides.value ?? '') });
  const fixture = TestBed.createComponent(InputHyperlinkComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['url']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, fg };
}

describe('InputHyperlinkComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputHyperlinkComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('creates successfully', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('is visible when control exists', () => {
    const { component } = setup({ value: 'example.com' });
    expect(component.visible()).toBe(true);
  });

  describe('externalUrl', () => {
    it('returns empty string when value is empty', () => {
      const { component } = setup({ value: '' });
      expect(component.externalUrl()).toBe('');
    });

    it('keeps existing https:// prefix', () => {
      const { component } = setup({ value: 'https://example.com' });
      expect(component.externalUrl()).toBe('https://example.com');
    });

    it('keeps existing http:// prefix', () => {
      const { component } = setup({ value: 'http://example.com' });
      expect(component.externalUrl()).toBe('http://example.com');
    });

    it('prepends https:// when no protocol is present', () => {
      const { component } = setup({ value: 'example.com' });
      expect(component.externalUrl()).toBe('https://example.com');
    });

    it('updates externalUrl when form control value changes', () => {
      const { component, fg } = setup({ value: '' });
      fg.get('url')!.setValue('google.com');
      TestBed.tick();
      expect(component.externalUrl()).toBe('https://google.com');
    });
  });

  describe('controlValue', () => {
    it('returns the current form control value', () => {
      const { component } = setup({ value: 'https://example.com' });
      expect(component.controlValue()).toBe('https://example.com');
    });

    it('returns empty string when control value is empty', () => {
      const { component } = setup({ value: '' });
      expect(component.controlValue()).toBe('');
    });
  });

  it('is hidden when autoHide=true, editMode=false, and value is empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: '' });
    expect(component.visible()).toBe(false);
  });

  it('is visible when autoHide=true, editMode=false, and value is non-empty', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: 'example.com' });
    expect(component.visible()).toBe(true);
  });
});
