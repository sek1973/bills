import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { Bill, Schedule } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, SchedulesActions, SchedulesSelectors } from 'projects/store/src/lib/state';
import { TableComponent } from 'projects/tools/src/public-api';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog.component';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit, OnDestroy {
  
  @ViewChild('table', { read: TableComponent }) table!: TableComponent<Schedule>;

  data: Schedule[] = [];
  activeRow?: Schedule;
  columns = [
    { name: 'date', header: 'Termin' },
    { name: 'sum', header: 'Kwota' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  bill?: Bill;

  private destroyed$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscribeToData();
    this.subscribeToBillId();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private subscribeToData(): void {
    this.store
      .select(SchedulesSelectors.selectAll)
      .pipe(takeUntil(this.destroyed$),
        filter(() => (this.bill?.id || -1) > -1))
      .subscribe({
        next: schedules => this.data = schedules || []
      });
  }

  private subscribeToBillId(): void {
    this.store
      .select(BillsSelectors.selectBill)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: bill => {
          this.bill = bill;
          this.store.dispatch(SchedulesActions.loadSchedules({ billId: bill?.id || -1 }));
        }
      });
  }

  onRowClicked(row: any): void {
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
