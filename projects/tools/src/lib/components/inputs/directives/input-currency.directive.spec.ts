import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { currencyToString } from '../../../../../../model/src/public-api';
import { InputCurrencyDirective } from './input-currency.directive';

describe('InputCurrencyDirective', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => true),
      writable: true,
      configurable: true,
    });
  });

  @Component({
    selector: 'test-cmp',
    template: `<input appInputCurrency [(ngModel)]="value" />`,
    standalone: true,
    imports: [InputCurrencyDirective, FormsModule],
  })
  class TestComponent {
    value: unknown = 123.45;
  }

  it('should format value on blur', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '1234.56' } });
    fireEvent.blur(input);
    expect(input.value).toBe(currencyToString(1234.56));
  });

  it('should call onChange with normalized string on input', async () => {
    const { fixture, getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '987.65' } });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('987.65');
  });

  it('should allow negative sign only at start', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '-123.45' } });
    fireEvent.keyDown(input, { key: '-' });
    expect(input.value.startsWith('-')).toBe(true);
  });

  it('should prevent non-numeric keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const cancelled = !fireEvent.keyDown(input, { key: 'a' });
    expect(cancelled).toBe(true);
  });

  it('should handle paste event without throwing', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: { getData: () => string } };
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: { getData: () => '1,234.56' },
    });
    expect(() => input.dispatchEvent(pasteEvent)).not.toThrow();
  });

  it('should handle drop event without throwing', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: { getData: () => string } };
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => '2,345.67' },
    });
    expect(() => input.dispatchEvent(dropEvent)).not.toThrow();
  });

  it('should write formatted value to input when model changes', async () => {
    const { fixture, getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fixture.componentInstance.value = 555.55;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe(currencyToString(555.55));
  });
});
