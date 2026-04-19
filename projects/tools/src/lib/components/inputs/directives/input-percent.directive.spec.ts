import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { percentToString } from '../../../../../../model/src/public-api';
import { InputPercentDirective } from './input-percent.directive';

describe('InputPercentDirective', () => {
  @Component({
    selector: 'test-cmp',
    template: `<input appInputPercent [(ngModel)]="value" />`,
    standalone: true,
    imports: [InputPercentDirective, FormsModule],
  })
  class TestComponent {
    value: unknown = 0.12;
  }

  it('should write formatted value on initial render', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe(percentToString(0.12));
  });

  it('should format value on blur', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '25' } });
    fireEvent.blur(input);
    expect(input.value).toBe(percentToString(0.25));
  });

  it('should replace comma with dot before formatting on blur', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '12,5' } });
    fireEvent.blur(input);
    expect(input.value).toBe(percentToString(0.125));
  });

  it('should fall back to 0 % on blur when value is empty', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(input.value).toBe(percentToString(0));
  });

  it('should call onChange with raw string on input', async () => {
    const { fixture, getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '50' } });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('50');
  });

  it('should show raw numeric value on focus', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.focus(input);
    // initial display is '12 %', percentToNumber('12 %') = 0.12
    expect(input.value).toBe(String(0.12));
  });

  it('should write updated formatted value when model changes', async () => {
    const { fixture, getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    fixture.componentInstance.value = 0.5;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe(percentToString(0.5));
  });

  it('should prevent non-numeric keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const cancelled = !fireEvent.keyDown(input, { key: 'a' });
    expect(cancelled).toBe(true);
  });

  it('should allow digit keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const notCancelled = fireEvent.keyDown(input, { key: '5' });
    expect(notCancelled).toBe(true);
  });

  it('should allow dot keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const notCancelled = fireEvent.keyDown(input, { key: '.' });
    expect(notCancelled).toBe(true);
  });

  it('should allow Backspace keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const notCancelled = fireEvent.keyDown(input, { key: 'Backspace' });
    expect(notCancelled).toBe(true);
  });

  it('should allow Ctrl+A keydown', async () => {
    const { getByRole } = await render(TestComponent);
    const input = getByRole('textbox') as HTMLInputElement;
    const notCancelled = fireEvent.keyDown(input, { key: 'a', ctrlKey: true });
    expect(notCancelled).toBe(true);
  });
});
