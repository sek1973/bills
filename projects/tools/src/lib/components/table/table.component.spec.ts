import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrintService } from '../../services';
import { TableColumn } from './table-column.model';
import { TableComponent } from './table.component';

interface Row {
  id: number;
  name: string;
  active: boolean;
}

const columns: TableColumn[] = [
  { name: 'id', header: 'ID' },
  { name: 'name', header: 'Name' }
];

const sampleData: Row[] = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false },
  { id: 3, name: 'Charlie', active: true }
];

function setup(overrides: { data?: Row[]; editable?: boolean; expandable?: boolean } = {}) {
  const fixture = TestBed.createComponent(TableComponent<Row>);
  fixture.componentRef.setInput('columnsDefinition', columns);
  fixture.componentRef.setInput('data', overrides.data ?? sampleData);
  if (overrides.editable !== undefined) fixture.componentRef.setInput('editable', overrides.editable);
  if (overrides.expandable !== undefined) fixture.componentRef.setInput('expandable', overrides.expandable);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('TableComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PrintService, useValue: { printPreviewElement: vi.fn() } }
      ]
    });
  });

  it('creates successfully', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('columnsDefinition', () => {
    it('returns columns as-is when expandable=false', () => {
      const { component } = setup({ expandable: false });
      const names = component.columnsDefinition().map(c => c.name);
      expect(names).toEqual(['id', 'name']);
    });

    it('prepends _expand column when expandable=true', () => {
      const { component } = setup({ expandable: true });
      const names = component.columnsDefinition().map(c => c.name);
      expect(names[0]).toBe('_expand');
      expect(names).toContain('id');
      expect(names).toContain('name');
    });
  });

  describe('columnsNames', () => {
    it('returns visible column names', () => {
      const { component } = setup();
      expect(component.columnsNames()).toEqual(['id', 'name']);
    });

    it('excludes hidden columns', () => {
      const withHidden: TableColumn[] = [
        { name: 'id', header: 'ID' },
        { name: 'name', header: 'Name', hidden: true }
      ];
      const fixture = TestBed.createComponent(TableComponent<Row>);
      fixture.componentRef.setInput('columnsDefinition', withHidden);
      fixture.componentRef.setInput('data', sampleData);
      fixture.detectChanges();
      expect(fixture.componentInstance.columnsNames()).toEqual(['id']);
    });
  });

  describe('visibility computed properties', () => {
    it('addButtonVisible is false when editable=false', () => {
      const { component } = setup({ editable: false });
      expect(component.addButtonVisible()).toBe(false);
    });

    it('addButtonVisible is true when editable=true', () => {
      const { component } = setup({ editable: true });
      expect(component.addButtonVisible()).toBe(true);
    });

    it('editButtonVisible is false when editable=false', () => {
      const { component } = setup({ editable: false });
      expect(component.editButtonVisible()).toBe(false);
    });

    it('removeButtonVisible is false when editable=false', () => {
      const { component } = setup({ editable: false });
      expect(component.removeButtonVisible()).toBe(false);
    });
  });

  describe('dataSource', () => {
    it('is initialized with provided data', () => {
      const { component } = setup();
      const ds = component.dataSource();
      expect(ds).toBeTruthy();
      expect(ds!.data.length).toBe(3);
    });

    it('updates when data input changes', () => {
      const { fixture, component } = setup({ data: sampleData });
      const newData: Row[] = [{ id: 99, name: 'NewRow', active: false }];
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.dataSource()!.data.length).toBe(1);
    });
  });

  describe('applyFilter', () => {
    it('sets filter on dataSource', () => {
      const { component } = setup();
      component.applyFilter('alice');
      expect(component.dataSource()!.filter).toBe('alice');
      expect(component.filterValue()).toBe('alice');
    });

    it('trims and lowercases the filter value', () => {
      const { component } = setup();
      component.applyFilter('  ALICE  ');
      expect(component.dataSource()!.filter).toBe('alice');
    });
  });

  describe('clearFilter', () => {
    it('resets filter to empty string', () => {
      const { component } = setup();
      component.applyFilter('bob');
      component.clearFilter();
      expect(component.dataSource()!.filter).toBe('');
      expect(component.filterValue()).toBe('');
    });
  });

  describe('onRowClick', () => {
    it('sets activeRow when a different row is clicked', () => {
      const { component } = setup();
      component.onRowClick(sampleData[0]);
      expect(component.activeRow()).toBe(sampleData[0]);
    });

    it('does not emit rowActivated again for the same row', () => {
      const { component } = setup();
      const spy = vi.fn();
      component.rowActivated.subscribe(spy);
      component.onRowClick(sampleData[0]);
      component.onRowClick(sampleData[0]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emits rowActivated with new row', () => {
      const { component } = setup();
      const spy = vi.fn();
      component.rowActivated.subscribe(spy);
      component.onRowClick(sampleData[1]);
      expect(spy).toHaveBeenCalledWith(sampleData[1]);
    });
  });

  describe('shouldExpandBeDisabled', () => {
    it('returns false by default', () => {
      const { component } = setup();
      expect(component.shouldExpandBeDisabled(sampleData[0])).toBe(false);
    });

    it('uses provided disableExpand function', () => {
      const fixture = TestBed.createComponent(TableComponent<Row>);
      fixture.componentRef.setInput('columnsDefinition', columns);
      fixture.componentRef.setInput('data', sampleData);
      fixture.componentRef.setInput('disableExpand', (row: Row) => row.id === 1);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.shouldExpandBeDisabled(sampleData[0])).toBe(true);
      expect(comp.shouldExpandBeDisabled(sampleData[1])).toBe(false);
    });
  });

  describe('disableEditButtons', () => {
    it('sets canEdit and canDelete to false', () => {
      const { component } = setup({ editable: true });
      component.canEdit.set(true);
      component.canDelete.set(true);
      component.disableEditButtons();
      expect(component.canEdit()).toBe(false);
      expect(component.canDelete()).toBe(false);
    });
  });

  describe('filterPredicate', () => {
    it('matches rows containing the filter string', () => {
      const { component } = setup();
      component.applyFilter('alice');
      const filtered = component.dataSource()!.filteredData;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Alice');
    });

    it('returns all rows when filter is empty', () => {
      const { component } = setup();
      component.applyFilter('');
      expect(component.dataSource()!.filteredData.length).toBe(3);
    });
  });
});
