import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AddHiddenAttributeDirective } from './add-hidden-attribute.directive';

describe('AddHiddenAttributeDirective', () => {
  it('should not set hidden attribute by default', async () => {
    await render(`<div appAddHiddenAttribute data-testid="test-div"></div>`, {
      imports: [AddHiddenAttributeDirective],
    });
    const div = screen.getByTestId('test-div');
    expect(div.hasAttribute('hidden')).toBe(false);
  });

  it('should set hidden attribute when input is true', async () => {
    await render(`<div appAddHiddenAttribute="true" data-testid="test-div"></div>`, {
      imports: [AddHiddenAttributeDirective],
    });
    const div = screen.getByTestId('test-div');
    expect(div.hasAttribute('hidden')).toBe(true);
  });

  it('should remove hidden attribute when input changes from true to false', async () => {
    @Component({
      selector: 'test-cmp',
      template: `<div [appAddHiddenAttribute]="hidden()" data-testid="test-div"></div>`,
      standalone: true,
      imports: [AddHiddenAttributeDirective],
    })
    class TestCmp {
      hidden = signal(true);
    }
    const { fixture } = await render(TestCmp);
    const div = screen.getByTestId('test-div');
    expect(div.hasAttribute('hidden')).toBe(true);
    fixture.componentInstance.hidden.set(false);
    fixture.detectChanges();
    await Promise.resolve(); // Wait for signal effect
    expect(div.hasAttribute('hidden')).toBe(false);
  });
});
