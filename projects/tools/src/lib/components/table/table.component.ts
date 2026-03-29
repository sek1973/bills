import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fromEvent, Subscription } from 'rxjs';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatPaginatorModule
  ]
})
export class TableComponent<T> {
  private printService = inject(PrintService);

  // --- State signals ---
  readonly dataReady = signal(false);
  readonly expandedRow = signal<T | undefined>(undefined);
  readonly collapsingRow = signal<T | undefined>(undefined);
  readonly activeRow = signal<T | undefined>(undefined);
  readonly dataSource = signal<TableDataSource<T> | undefined>(undefined);
  readonly index = signal(0);

  // --- Outputs ---
  readonly rowDblClick = output<T>();
  readonly rowActivated = output<T | undefined>();
  readonly rowExpanded = output<T>();
  readonly rowCollapsed = output<T>();
  readonly rowSelect = output<T>();
  readonly rowUnselect = output<T>();
  readonly rowSelectAll = output<T>();
  readonly rowUnselectAll = output<T>();
  readonly addButtonClicked = output<void>();
  readonly editButtonClicked = output<T | undefined>();
  readonly deleteButtonClicked = output<T | undefined>();
  readonly refreshButtonClicked = output<void>();
  readonly pasteButtonClicked = output<void>();

  // --- View queries ---
  readonly table = viewChild(MatTable);
  readonly tableElementRef = viewChild<ElementRef>('table');
  readonly matSort = viewChild(MatSort);
  readonly matPaginator = viewChild(MatPaginator);
  private readonly filterInputRef = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  // --- Content queries ---
  private readonly tableCellDirectives = contentChildren(TableCellDirective);
  readonly tableTitleTemplate = contentChild<TemplateRef<Component>>('tableTitleTemplate');
  readonly expandedRowTemplate = contentChild<TemplateRef<ExpandedRowComponent<T>>>('expandedRowTemplate');
  readonly middleToolbarPanelTemplate = contentChild<TemplateRef<TablePanelComponent<T>>>('middleToolbarPanelTemplate');
  readonly rightToolbarPanelTemplate = contentChild<TemplateRef<TablePanelComponent<T>>>('rightToolbarPanelTemplate');

  readonly cellTemplates = computed(() => {
    const map = new Map<string, TemplateRef<Component>>();
    for (const d of this.tableCellDirectives()) {
      map.set(d.cellTemplateForColumn(), d.templateRef);
    }
    return map;
  });

  // --- Inputs ---
  readonly sortActive = input('');
  readonly sortDirection = input<SortDirection>('');
  readonly data = input<T[]>([]);
  readonly showFilter = input(false);
  readonly sortable = input(true);
  readonly pageable = input(true);
  readonly editable = input(false);
  readonly showAddButton = input(true);
  readonly showRemoveButton = input(true);
  readonly showEditButton = input(true);
  readonly showRefreshButton = input(true);
  readonly showPasteButton = input(true);
  readonly canAdd = input(false);
  readonly canDelete = model(false);
  readonly canEdit = model(false);
  readonly canPaste = input(false);
  readonly tableTitle = input('');
  readonly filterKeyDelayMs = input(500);
  readonly expansionPanel = input(false);
  readonly hideHeader = input(false);
  readonly exportable = input(true);
  readonly csvSeparator = input(',');
  readonly exportFileName = input('data');
  readonly disableExpand = input<(dataRow: T) => boolean>(() => false);
  readonly expandable = input(false);

  readonly rawColumnsDefinition = input<TableColumn[]>([], { alias: 'columnsDefinition' });

  // --- Computed ---
  readonly columnsDefinition = computed(() => {
    const cols = this.rawColumnsDefinition();
    return this.expandable()
      ? [{ name: '_expand', header: '' }, ...cols]
      : cols;
  });

  readonly columnsNames = computed(() => {
    return this.columnsDefinition()
      .filter(e => !e.hidden)
      .map(e => e.name);
  });

  readonly dataColumns = computed(() => {
    return this.columnsDefinition()
      .filter(e => !e.hidden && e.name !== '_expand');
  });

  readonly addButtonVisible = computed(() => this.editable() && this.showAddButton());
  readonly editButtonVisible = computed(() => this.editable() && this.showEditButton());
  readonly removeButtonVisible = computed(() => this.editable() && this.showRemoveButton());
  readonly pasteButtonVisible = computed(() => this.editable() && this.showPasteButton());
  readonly menuVisible = computed(() =>
    this.addButtonVisible() || this.editButtonVisible() || this.removeButtonVisible()
    || this.pasteButtonVisible() || this.showRefreshButton() || this.exportable()
  );

  // --- Effects ---
  private initEffect = effect(() => {
    const data = this.data();
    const sort = this.matSort();
    const paginator = this.matPaginator();
    const pageable = this.pageable();

    if (!data) return;

    const ds = new TableDataSource(data);
    if (sort) { ds.sort = sort; }
    if (pageable && paginator) { ds.paginator = paginator; }
    // workaround for mixed context (numbers & strings) sorting - see: https://github.com/angular/material2/issues/9966:
    ds.sortingDataAccessor = (d, header) => d[header as keyof T] as string | number;

    this.dataSource.set(ds);
    this.activeRow.set(undefined);
    this.rowActivated.emit(undefined);
  });

  private filterSub?: Subscription;
  private filterEffect = effect((onCleanup) => {
    const el = this.filterInputRef()?.nativeElement;
    if (!el) return;

    this.filterSub = fromEvent(el, 'keyup').pipe(
      debounceTime(this.filterKeyDelayMs()),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilter(el.value));

    onCleanup(() => this.filterSub?.unsubscribe());
  });

  getCellTemplate(column: string, defaultTemplate: TemplateRef<CellComponent<T>>): TemplateRef<CellComponent<T>> {
    return this.cellTemplates().get(column) as TemplateRef<CellComponent<T>> ?? defaultTemplate;
  }

  getTableTitleTemplate(defaultTemplate: TemplateRef<Component>): TemplateRef<Component> {
    return this.tableTitleTemplate() ?? defaultTemplate;
  }

  applyFilter(filterValue: string): void {
    const ds = this.dataSource();
    if (ds) {
      ds.filter = filterValue.trim().toLowerCase();
    }
  }

  onRowClick(row: T): void {
    if (this.activeRow() !== row) {
      this.activeRow.set(row);
      this.rowActivated.emit(row);
    }
  }

  shouldExpandBeDisabled(row: T): boolean {
    return this.disableExpand()(row);
  }

  onCollapseTransitionEnd(row: T): void {
    if (this.collapsingRow() === row) {
      this.collapsingRow.set(undefined);
    }
  }

  isRowRendered(row: T): boolean {
    return row === this.expandedRow() || row === this.collapsingRow();
  }

  onRowExpandClick(row: T): void {
    if (this.disableExpand()(row)) { return; }
    const expanded = this.expandedRow();
    if (expanded === row) {
      this.collapsingRow.set(row);
      this.expandedRow.set(undefined);
      this.rowCollapsed.emit(row);
    } else {
      if (expanded) {
        this.collapsingRow.set(expanded);
        this.rowCollapsed.emit(expanded);
      }
      this.expandedRow.set(row);
      this.rowExpanded.emit(row);
    }
  }

  onRowDblClick(row: T): void {
    this.rowDblClick.emit(row);
  }

  onAddClicked(): void {
    this.addButtonClicked.emit();
  }

  onEditClicked(): void {
    this.editButtonClicked.emit(this.activeRow());
  }

  onRefreshClicked(): void {
    this.refreshButtonClicked.emit();
  }

  onDeleteClicked(): void {
    this.deleteButtonClicked.emit(this.activeRow());
  }

  onExportClicked(): void {
    this.exportToCsv();
  }

  onPrintClicked(): void {
    const tableElement = this.tableElementRef()?.nativeElement as HTMLElement;
    this.printService.printPreviewElement(tableElement);
  }

  onPasteClicked(): void {
    this.pasteButtonClicked.emit();
  }

  disableEditButtons(): void {
    this.canEdit.set(false);
    this.canDelete.set(false);
  }

  private getExportData(): string {
    const ds = this.dataSource();
    if (ds) {
      const data = ds.filteredData || ds.data;
      let result = '\ufeff';
      const columns = this.dataColumns();
      const separator = this.csvSeparator();

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        result += '"' + (column.header || column.name) + '"';
        if (colIndex < columns.length - 1) {
          result += separator;
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
              result += separator;
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
    const fileName = this.exportFileName() + '.csv';
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
    const ds = this.dataSource();
    if (!ds) { return true; }
    const data = ds.filteredData || ds.data;
    return !data || data.length === 0;
  }
}
