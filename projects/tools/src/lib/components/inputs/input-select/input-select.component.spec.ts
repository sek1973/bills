import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Unit, UnitDescription } from '@bills/model';
import { beforeEach, describe, expect, it } from 'vitest';
import { DescriptionProvider } from '../input-component-base';
import { InputSelectComponent, SelectItem, unitsToSelectItems } from './input-select.component';

function makeProvider(): DescriptionProvider {
  return { getDescriptionObj: () => ({ labelText: 'Unit', tooltipText: 'Pick a unit', placeholderText: '' }) };
}

function setup(overrides: { selectItems?: SelectItem<Unit>[]; editMode?: boolean; autoHide?: boolean; value?: any } = {}) {
  const fg = new UntypedFormGroup({ unit: new UntypedFormControl(overrides.value ?? null) });
  const fixture = TestBed.createComponent(InputSelectComponent);
  fixture.componentRef.setInput('formGroup', fg);
  fixture.componentRef.setInput('path', ['unit']);
  fixture.componentRef.setInput('descriptionProvider', makeProvider());
  if (overrides.selectItems !== undefined) fixture.componentRef.setInput('selectItems', overrides.selectItems);
  if (overrides.editMode !== undefined) fixture.componentRef.setInput('editMode', overrides.editMode);
  if (overrides.autoHide !== undefined) fixture.componentRef.setInput('autoHide', overrides.autoHide);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('InputSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputSelectComponent],
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

  it('is hidden when autoHide=true, editMode=false, and value is null', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: null });
    expect(component.visible()).toBe(false);
  });

  it('is visible when autoHide=true, editMode=false, and value is set', () => {
    const { component } = setup({ autoHide: true, editMode: false, value: Unit.Month });
    expect(component.visible()).toBe(true);
  });

  describe('selectItems input', () => {
    it('defaults to an empty array', () => {
      const { component } = setup();
      expect(component.selectItems()).toEqual([]);
    });

    it('accepts a custom list of items', () => {
      const items: SelectItem<Unit>[] = [{ value: Unit.Month, text: 'Miesiąc' }];
      const { component } = setup({ selectItems: items });
      expect(component.selectItems()).toEqual(items);
    });
  });
});

describe('unitsToSelectItems', () => {
  it('returns an item for each entry in UnitDescription', () => {
    const items = unitsToSelectItems();
    expect(items).toHaveLength(UnitDescription.size);
  });

  it('maps Unit enum keys to their descriptions', () => {
    const items = unitsToSelectItems();
    const monthItem = items.find(i => i.value === Unit.Month);
    expect(monthItem).toBeDefined();
    expect(monthItem!.text).toBe(UnitDescription.get(Unit.Month));
  });

  it('includes all Unit enum values', () => {
    const items = unitsToSelectItems();
    const values = items.map(i => i.value);
    expect(values).toContain(Unit.Day);
    expect(values).toContain(Unit.Week);
    expect(values).toContain(Unit.Month);
    expect(values).toContain(Unit.Year);
  });

  it('produces non-empty text for every item', () => {
    const items = unitsToSelectItems();
    items.forEach(item => expect(item.text.length).toBeGreaterThan(0));
  });
});
