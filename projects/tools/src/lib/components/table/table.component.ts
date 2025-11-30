import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PrintService } from '../../services';
import { TableCellDirective } from './directives';
import { TableColumn } from './table-column.model';
import { TableDataSource } from './table-data-source';

export interface TablePanelComponent<T> extends Component {
  dataSource: TableDataSource<T> | undefined;
  activeRow?: T;
}

export interface ExpandedRowComponent<T> extends Component {
  row?: T;
}

export interface CellComponent<T> extends Component {
  row?: T;
  column?: string;
  rowIndex?: number;
}

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
  ],
  standalone: true,
  imports: [
    MatMenuModule,
    MatTooltipModule,
    NgTemplateOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatPaginatorModule]
})
export class TableComponent<T> implements AfterViewInit {
  dataReady: boolean;
  expandedRow?: T;
  activeRow?: T;

  index = 0;
  private sort?: MatSort;
  private paginator?: MatPaginator;
  private _columnsDefinition: TableColumn[] = [];
  private _expandable: boolean = false;
  #destroyRef = inject(DestroyRef);

  @Output() rowDblClick: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowActivated: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowExpanded: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowCollapsed: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowSelect: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowUnselect: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowSelectAll: EventEmitter<T> = new EventEmitter<T>();
  @Output() rowUnselectAll: EventEmitter<T> = new EventEmitter<T>();
  @Output() addButtonClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() editButtonClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() deleteButtonClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() refreshButtonClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() pasteButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(MatTable) table?: MatTable<T>;
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
  cellTemplates: Map<string, TemplateRef<Component>> = new Map<string, TemplateRef<Component>>();
  @ContentChildren(TableCellDirective) set dataTableCellDirectives(val: QueryList<TableCellDirective>) {
    this.cellTemplates = new Map<string, TemplateRef<Component>>();
    for (const element of val.toArray()) {
      this.cellTemplates.set(element.cellTemplateForColumn, element.templateRef);
    }
  }

  @ContentChild('tableTitleTemplate') tableTitleTemplate?: TemplateRef<Component>;
  @ContentChild('expandedRowTemplate') expandedRowTemplate?: TemplateRef<ExpandedRowComponent<T>>;
  @ContentChild('middleToolbarPanelTemplate') middleToolbarPanelTemplate?: TemplateRef<TablePanelComponent<T>>;
  @ContentChild('rightToolbarPanelTemplate') rightToolbarPanelTemplate?: TemplateRef<TablePanelComponent<T>>;

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

  @Input() disableExpand: (dataRow: T) => boolean = () => false;

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
    this._dataSource.sortingDataAccessor = (data, header) => data[header as keyof T] as string | number;

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
          takeUntilDestroyed(this.#destroyRef),
          debounceTime(this.filterKeyDelayMs), // before emitting last event
          distinctUntilChanged()
        )
        .subscribe({
          next: () => this.applyFilter(this.filterInput.value)
        });
    }
  }

  getCellTemplate(column: string, defaultTemplate: TemplateRef<CellComponent<T>>): TemplateRef<CellComponent<T>> {
    const template = this.cellTemplates.get(column);
    if (template) {
      return template;
    } else {
      return defaultTemplate;
    }
  }

  getTableTitleTemplate(defaultTemplate: TemplateRef<Component>): TemplateRef<Component> {
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

  shouldExpandBeDisabled(row: T): boolean {
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

  onAddClicked(): void {
    this.addButtonClicked.emit();
  }

  onEditClicked(): void {
    this.editButtonClicked.emit(this.activeRow);
  }

  onRefreshClicked(): void {
    this.refreshButtonClicked.emit();
  }

  onDeleteClicked(): void {
    this.deleteButtonClicked.emit(this.activeRow);
  }

  onExportClicked(): void {
    this.exportToCsv();
  }

  onPrintClicked(): void {
    const tableElement = this.tableElementRef?.nativeElement as HTMLElement;
    this.printService.printPreviewElement(tableElement);
  }

  onPasteClicked(): void {
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
        data.forEach((row) => {
          result += '\n';
          for (let rowIndex = 0; rowIndex < columns.length; rowIndex++) {
            const column = columns[rowIndex];
            let value: string | null | undefined = row[column.name as keyof T]?.toString();
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
