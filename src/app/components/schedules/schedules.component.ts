import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Schedule } from 'src/app/model/schedule';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ConfirmDialogResponse } from '../tools/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInputType } from '../tools/confirm-dialog/confirm-dialog.model';
import { SchedulesDataSource } from './../../services/schedules.datasource';
import { SchedulesService } from '../../services/schedules.service';
import { TableComponent } from './../tools/table/table.component';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog.component';


@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  private _billUid!: string;
  @Input() set billUid(val: string) {
    this._billUid = val;
    this.setTableDataSource();
  }
  get billUid(): string {
    return this._billUid;
  }
  @ViewChild('table', { read: TableComponent })
  table!: TableComponent;
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeRow: any;

  dataSource?: SchedulesDataSource;
  columns = [
    { name: 'date', header: 'Termin' },
    { name: 'sum', header: 'Kwota' },
    { name: 'remarks', header: 'Uwagi' }
  ];

  constructor(
    private schedulesFirebaseService: SchedulesService,
    @Inject(MatDialog) public dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  private setTableDataSource(): void {
    this.dataSource = new SchedulesDataSource(this.schedulesFirebaseService, this.billUid);
    this.dataSource.load();
  }

  onRowClicked(row: any): void {
    if (this.activeRow !== row) {
      this.activeRow = row;
    }
  }

  getId(row: Schedule): string | undefined {
    return row.id;
  }

  refresh(): void {
    this.dataSource?.load();
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
      data: { schedule, billUid: this.billUid }
    });

    dialogRef.afterClosed().subscribe();
  }

  deleteSchedule(): void {
    if (this.table.activeRow) {
      this.confirmationService
        .confirm('Usuń planowaną płatność', 'Czy na pewno chcesz usunąć tę płatność?', 'Nie', 'Tak')
        .subscribe((response) => {
          if (response) {
            this.schedulesFirebaseService.delete(this.table.activeRow, this.billUid).then(
              () => this.snackBar.open('Usunięto planowaną płatność.', 'Ukryj', { duration: 3000 }),
              error => this.snackBar.open('Błąd usuwania planowanej płatności: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' })
            );
          }
        });
    }
  }

  onRowActivated(row: Schedule): void {
    this.table.canDelete = row ? true : false;
    this.table.canEdit = row ? true : false;
  }

  pasteData(): void {
    this.confirmationService
      .confirm('Importuj planowane płatności',
        'Wklej ze schowka lub wpisz dane w poniższe pole a następnie naciśnij importuj.', 'Anuluj', 'Importuj',
        ConfirmDialogInputType.InputTypeTextArea, undefined, [Validators.required], 'Dane', 'Dane')
      .subscribe((response) => {
        if (response) {
          this.loading.emit(true);
          const data = (response as ConfirmDialogResponse).value as string;
          if (!data || data === null || data === undefined || data === '') {
            this.loading.emit(false);
            this.snackBar.open('Brak danych do zaimportowania', 'Ukryj', { panelClass: 'snackbar-style-error' });
          } else {
            this.schedulesFirebaseService.importSchedules(data, this.billUid).then(() => {
              this.loading.emit(false);
              this.snackBar.open('Dane zaimportowane!', 'Ukryj', { duration: 3000 });
            },
              error => {
                this.loading.emit(false);
                this.snackBar.open('Błąd importu danych: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' });
              });
          }
        }
      });
  }

}
