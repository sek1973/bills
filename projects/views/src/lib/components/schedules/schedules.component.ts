import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Schedule } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, SchedulesActions, SchedulesSelectors } from 'projects/store/src/lib/state';
import { TableComponent } from 'projects/tools/src/public-api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog.component';


@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit, OnDestroy {
  @ViewChild('table', { read: TableComponent })
  table!: TableComponent<Schedule>;

  data: Schedule[] = [];
  activeRow?: Schedule;
  columns = [
    { name: 'date', header: 'Termin' },
    { name: 'sum', header: 'Kwota' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  billId: number = -1;

  private dataSubscription: Subscription = Subscription.EMPTY;
  private billIdSubscription: Subscription = Subscription.EMPTY;

  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscribeToData();
    this.subscribeToBillId();
  }

  ngOnDestroy(): void {
    this.billIdSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
  }

  private subscribeToData(): void {
    this.dataSubscription = this.store
      .select(SchedulesSelectors.selectAll)
      .pipe(filter(() => this.billId > -1))
      .subscribe({
        next: schedules => this.data = schedules || []
      });
  }

  private subscribeToBillId(): void {
    this.billIdSubscription = this.store
      .select(BillsSelectors.selectBillId)
      .subscribe({
        next: billId => {
          this.billId = billId;
          this.store.dispatch(SchedulesActions.loadSchedules({ billId: this.billId }));
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
    this.store.dispatch(SchedulesActions.loadSchedules({ billId: this.billId }));
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
      data: { schedule, billId: this.billId, schedules: this.data }
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
    this.store.dispatch(SchedulesActions.importSchedules({ billId: this.billId }));
  }

}
