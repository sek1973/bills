import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Schedule } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, PaymentsActions } from 'projects/store/src/lib/state';
import { SchedulesActions, SchedulesSelectors } from 'projects/store/src/lib/state/schedule';
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
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    if (this.table.activeRow) { this.openDialog(); }
  }

  private openDialog(): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe();
  }

  deleteSchedule(): void {
    if (this.table.activeRow) {
      this.store.dispatch(PaymentsActions.deletePayment({ payment: this.table.activeRow }));
    }
  }

  onRowActivated(row: Schedule): void {
    this.table.canDelete = row ? true : false;
    this.table.canEdit = row ? true : false;
  }

  pasteData(): void {
    this.store.dispatch(PaymentsActions.importPayments({ billId: this.billId }));
  }

}