import { Component, DestroyRef, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Schedule } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, SchedulesActions, SchedulesSelectors } from 'projects/store/src/lib/state';
import { TableComponent } from 'projects/tools/src/public-api';
import { filter } from 'rxjs/operators';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog.component';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {

  @ViewChild('table', { read: TableComponent }) table!: TableComponent<Schedule>;

  data: Schedule[] = [];
  activeRow?: Schedule;
  columns = [
    { name: 'date', header: 'Termin' },
    { name: 'sum', header: 'Kwota' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  bill?: Bill;

  #destroyRef = inject(DestroyRef);

  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscribeToData();
    this.subscribeToBillId();
  }

  private subscribeToData(): void {
    this.store
      .select(SchedulesSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.#destroyRef),
        filter(() => (this.bill?.id || -1) > -1))
      .subscribe({
        next: schedules => this.data = schedules || []
      });
  }

  private subscribeToBillId(): void {
    this.store
      .select(BillsSelectors.selectBill)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: bill => {
          this.bill = bill;
          this.store.dispatch(SchedulesActions.loadSchedules({ billId: bill?.id || -1 }));
        }
      });
  }

  onRowClicked(row: Schedule): void {
    if (this.activeRow !== row) {
      this.activeRow = row;
    }
  }

  getId(row: Schedule): number | undefined {
    return row?.id;
  }

  refresh(): void {
    this.store.dispatch(SchedulesActions.loadSchedules({ billId: this.bill?.id || -1 }));
  }

  addSchedule(): void {
    this.openDialog();
  }

  editSchedule(): void {
    if (this.table.activeRow) { this.openDialog(this.table.activeRow); }
  }

  private openDialog(schedule?: Schedule): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '500px',
      data: { schedule, bill: this.bill, schedules: this.data }
    });
    dialogRef.afterClosed().subscribe();
  }

  deleteSchedule(): void {
    if (this.table.activeRow) {
      this.store.dispatch(SchedulesActions.deleteSchedule({ schedule: this.table.activeRow }));
    }
  }

  onRowActivated(row: Schedule): void {
    if (this.table) {
      this.table.canDelete = row ? true : false;
      this.table.canEdit = row ? true : false;
    }
  }

  pasteData(): void {
    this.store.dispatch(SchedulesActions.importSchedules({ billId: this.bill?.id || -1 }));
  }

}
