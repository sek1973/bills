import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input, OnDestroy, Output,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PrintService } from '../../services';
import { TableCellDirective } from './directives';
import { TableColumn } from './table-column.model';
import { TableDataSource } from './table-data-source';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class TableComponent<T extends { [key: string]: any }> implements AfterViewInit, OnDestroy {
  dataReady: boolean;
  expandedRow: any;
  activeRow: any;

  index = 0;
  private sort?: MatSort;
  private paginator?: MatPaginator;
  private _columnsDefinition: TableColumn[] = [];
  private _expandable: boolean = false;
  private destroyed$: Subject<void> = new Subject<void>();

  @Output() rowDblClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowActivated: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowExpanded: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowCollapsed: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowUnselect: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowSelectAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowUnselectAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() addButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() editButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshButtonClicked: EventEmitter<null> = new EventEmitter<null>();
  @Output() pasteButtonClicked: EventEmitter<null> = new EventEmitter<null>();

  @ViewChild(MatTable) table?: MatTable<any>;
  @ViewChild('table', { read: ElementRef }) tableElementRef?: ElementRef;

  @ViewChild(MatSort)
  set matSort(ms: MatSort) {
    if (this.sort !== ms) { this.sort = ms; }
  }

  @ViewChild(MatPaginator)
  set matPaginator(mp: MatPaginator) {
    if (this.paginator !== mp) {
      this.paginator = mp;
      this.initDataSource();
    }
  }

  @ViewChild('filterInput', { read: HTMLInputElement }) filterInput!: HTMLInputElement;
  cellTemplates: Map<string, TemplateRef<any>> = new Map<string, TemplateRef<any>>();
  @ContentChildren(TableCellDirective) set dataTableCellDirectives(val: QueryList<TableCellDirective>) {
    this.cellTemplates = new Map<string, TemplateRef<any>>();
    for (const element of val.toArray()) {
      this.cellTemplates.set(element.cellTemplateForColumn, element.templateRef);
    }
  }

  @ContentChild('tableTitleTemplate') tableTitleTemplate?: TemplateRef<Component>;
  @ContentChild('expandedRowTemplate') expandedRowTemplate?: TemplateRef<Component>;
  @ContentChild('middleToolbarPanelTemplate') middleToolbarPanelTemplate?: TemplateRef<Component>;
  @ContentChild('rightToolbarPanelTemplate') rightToolbarPanelTemplate?: TemplateRef<Component>;

  @Input() sortActive: string = '';
  @Input() sortDirection: SortDirection = '';

  private _dataSource?: TableDataSource<T>;
  get dataSource(): TableDataSource<T> | undefined {
    return this._dataSource;
  }

  private _data!: T[];
  @Input() set data(value: T[]) {
    if (!Array.isArray(value)) {
      throw new Error('Value should be an array!');
    }
    if (value !== undefined && value !== null) {
      this._data = value;
      this.initDataSource();
    }
  }
  get data(): T[] {
    return this._data;
  }

  @Input() showFilter = false;
  @Input() sortable = true;
  @Input() pageable = true;

  @Input() editable = false;
  @Input() showAddButton = true;
  @Input() showRemoveButton = true;
  @Input() showEditButton = true;
  @Input() showRefreshButton = true;
  @Input() showPasteButton = true;

  @Input() canAdd = false;
  @Input() canDelete = false;
  @Input() canEdit = false;
  @Input() canPaste = false;

  @Input() tableTitle: string = '';
  @Input() filterKeyDelayMs = 500;
  @Input() expansionPanel = false;
  @Input() hideHeader = false;

  @Input() exportable = true;
  @Input() csvSeparator = ',';
  @Input() exportFileName = 'data';

  @Input() disableExpand: (dataRow: any) => boolean = () => false;

  @Input() set expandable(val: boolean) {
    this._expandable = val;
    if (this.expandable) {
      this._columnsDefinition = [{ name: '_expand', header: '' }, ...this._columnsDefinition];
    } else {
      this._columnsDefinition.splice(this._columnsDefinition.findIndex(e => e.name === '_expand'), 1);
    }
  }
  get expandable(): boolean {
    return this._expandable;
  }

  @Input()
  set columnsDefinition(value: TableColumn[]) {
    this._columnsDefinition = value;
    if (this.expandable) {
      this._columnsDefinition = [{ name: '_expand', header: '' }, ...this._columnsDefinition];
    }
  }
  get columnsDefinition(): TableColumn[] {
    return this._columnsDefinition;
  }

  public get columnsNames(): string[] {
    if (this._columnsDefinition) {
      return this._columnsDefinition.filter((element) => !element.hidden).map((element) => element.name);
    } else {
      return [];
    }
  }

  public get dataColumns(): TableColumn[] {
    if (this._columnsDefinition) {
      return this._columnsDefinition.filter(element => {
        return (!element.hidden && element.name !== '_expand');
      });
    } else {
      return [];
    }
  }

  public get addButtonVisible(): boolean {
    return this.editable && this.showAddButton;
  }

  public get editButtonVisible(): boolean {
    return this.editable && this.showEditButton;
  }

  public get removeButtonVisible(): boolean {
    return this.editable && this.showRemoveButton;
  }

  public get pasteButtonVisible(): boolean {
    return this.editable && this.showPasteButton;
  }

  public get menuVisible(): boolean {
    return this.addButtonVisible
      || this.editButtonVisible
      || this.removeButtonVisible
      || this.pasteButtonVisible
      || this.showRefreshButton
      || this.exportable;
  }

  constructor(private printService: PrintService) {
    this.dataReady = false;
  }

  private initDataSource(): void {
    this._dataSource = new TableDataSource(this.data);
    if (this.sort !== undefined) {
      this._dataSource.sort = this.sort;
    }
    if (this.pageable && this.paginator !== undefined) {
      this._dataSource.paginator = this.paginator;
    }
    // workaround for mixed context (numbers & strings) sorting - see: https://github.com/angular/material2/issues/9966:
    this._dataSource.sortingDataAccessor = (data, header) => data[header as keyof T];

    this.activeRow = undefined;
    this.rowActivated.emit(undefined);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initDataSource();
    });
    if (this.filterInput) {
      fromEvent(this.filterInput, 'keyup')
        .pipe(
          takeUntil(this.destroyed$),
          debounceTime(this.filterKeyDelayMs), // before emitting last event
          distinctUntilChanged()
        )
        .subscribe({
          next: () => this.applyFilter(this.filterInput.value)
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getCellTemplate(column: string, defaultTemplate: TemplateRef<any>): TemplateRef<any> {
    const template = this.cellTemplates.get(column);
    if (template) {
      return template;
    } else {
      return defaultTemplate;
    }
  }

  getTableTitleTemplate(defaultTemplate: TemplateRef<any>): TemplateRef<any> {
    const template = this.tableTitleTemplate;
    if (template) {
      return template;
    } else {
      return defaultTemplate;
    }
  }

  applyFilter(filterValue: string): void {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  onRowClick(row: T): void {
    if (this.activeRow !== row) {
      this.activeRow = row;
      this.rowActivated.emit(row);
    }
  }

  shouldExpandBeDisabled(row: any): boolean {
    return this.disableExpand(row);
  }

  onRowExpandClick(row: T): void {
    if (this.disableExpand(row)) {
      return;
    }
    if (this.expandedRow === row) {
      const collapsedRow = this.expandedRow;
      this.expandedRow = undefined;
      this.rowCollapsed.emit(collapsedRow);
    } else {
      const collapsedRow = this.expandedRow;
      this.expandedRow = row;
      if (collapsedRow) { this.rowCollapsed.emit(collapsedRow); }
      this.rowExpanded.emit(this.expandedRow);
    }
  }

  onRowDblClick(row: T): void {
    this.rowDblClick.emit(row);
  }

  onAddClicked(event: Event): void {
    this.addButtonClicked.emit();
  }

  onEditClicked(event: Event): void {
    this.editButtonClicked.emit(this.activeRow);
  }

  onRefreshClicked(event: Event): void {
    this.refreshButtonClicked.emit(null);
  }

  onDeleteClicked(event: Event): void {
    this.deleteButtonClicked.emit(this.activeRow);
  }

  onExportClicked(event: Event): void {
    this.exportToCsv();
  }

  onPrintClicked(event: Event): void {
    const tableElement = this.tableElementRef?.nativeElement as HTMLElement;
    this.printService.printPreviewElement(tableElement);
  }

  onPasteClicked(event: Event): void {
    this.pasteButtonClicked.emit();
  }

  disableEditButtons(): void {
    this.disableEditButton();
    this.disableRemoveButton();
  }

  private disableEditButton(): void {
    this.canEdit = false;
  }

  private disableRemoveButton(): void {
    this.canDelete = false;
  }

  private getExportData(): string {
    if (this.dataSource) {
      const data = this.dataSource.filteredData || this.dataSource.data;
      let result = '\ufeff';
      const columns = this.dataColumns;

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        result += '"' + (column.header || column.name) + '"';
        if (colIndex < columns.length - 1) {
          result += this.csvSeparator;
        }
      }
      if (data) {
        data.forEach((row, i) => {
          result += '\n';
          for (let rowIndex = 0; rowIndex < columns.length; rowIndex++) {
            const column = columns[rowIndex];
            let value: string = row[column.name as keyof T];
            if (value !== null && value !== undefined) {
              value = String(value).replace(/"/g, '""');
            } else { value = ''; }
            result += '"' + value + '"';
            if (rowIndex < columns.length - 1) {
              result += this.csvSeparator;
            }
          }
        });
      }
      return result;
    }
    return '';
  }

  private saveFile(csv: string): void {
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const fileName = this.exportFileName + '.csv';
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    if (link.download !== undefined) {
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', fileName);
      link.click();
    } else {
      csv = 'data:text/csv;charset=utf-8,' + csv;
      window.open(encodeURI(csv));
    }
    document.body.removeChild(link);
  }  

  public exportToCsv(): void {
    const csv = this.getExportData();
    this.saveFile(csv);
  }

  isEmptyTable(): boolean {
    if (!this.dataSource) {
      return true;
    }
    const data = this.dataSource.filteredData || this.dataSource.data;
    if (data) {
      return ((data.length > 0) ? false : true);
    }
    return true;
  }
}
