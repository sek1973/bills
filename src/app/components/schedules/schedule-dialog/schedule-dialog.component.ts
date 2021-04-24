import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getSafe, timestampToDate } from 'src/app/helpers';
import { Schedule } from 'src/app/model/schedule';
import { ConfirmationService } from 'src/app/services/system/confirmation.service';
import { SchedulesService } from '../../../services/data/schedules.service';
import { DescriptionProvider } from '../../tools/inputs/input-component-base';
import { ScheduleDescription } from './../../../model/schedule';


export interface ScheduleDialogData {
  billUid: string;
  schedule?: Schedule;
}
@Component({
  selector: 'app-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.scss']
})
export class ScheduleDialogComponent implements OnInit, AfterViewInit {

  schedule: Schedule;
  billUid: string;
  dialogTitle: string;
  dialogMode: 'add' | 'edit' = 'add';
  loading = true;
  canSave = false;

  form: FormGroup = new FormGroup({
    uid: new FormControl(),
    date: new FormControl(new Date(), Validators.required),
    sum: new FormControl(),
    remarks: new FormControl()
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    private schedulesFirebaseService: SchedulesService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) {
    this.billUid = getSafe(() => data.billUid);
    this.schedule = getSafe(() => data.schedule);
    this.dialogTitle = (this.schedule ? 'Edytuj' : 'Dodaj') + ' planowaną płatność';
    this.dialogMode = this.schedule ? 'edit' : 'add';
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
    this.loading = false;
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.setFormValue());
  }

  private setFormValue(): void {
    if (this.schedule) {
      const value = {
        uid: this.schedule.id,
        date: timestampToDate(this.schedule.date),
        sum: this.schedule.sum,
        remarks: this.schedule.remarks
      };
      this.form.patchValue(value);
    }
    this.setEditStatus(this.form.status);
  }

  private setEditStatus(status: string): void {
    this.canSave = status === 'VALID' ? true : false;
  }

  closeDialog(): void {
    this.dialogRef.close('cancel');
  }

  saveData(): void {
    let request: Promise<any | void>;
    this.loading = true;
    if (this.schedule) {
      request = this.schedulesFirebaseService.update(this.form.value, this.billUid);
    } else {
      request = this.schedulesFirebaseService.add(this.form.value, this.billUid);
    }
    this.runPromise(request, () => {
      this.snackBar.open('Dane zapisane!', 'Ukryj', { duration: 3000 });
      this.dialogRef.close('saved');
    },
      (error) => { this.snackBar.open('Błąd zapisania danych: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' }); });
  }

  private checkDuplicatedSchedule(action: () => void): void {
    const dateControl = this.form.get('date') as FormControl;
    const date = dateControl.value;
    this.schedulesFirebaseService.queryByDate(this.billUid, date).then(
      result => {
        if (result.size) {
          this.confirmationService
            .confirm('Powtórzony plan', 'Plan płatności z tą datą już istnieje. Czy na pewno dodać nowy?', 'Nie', 'Tak')
            .subscribe((response) => {
              if (response) { action(); } else { this.loading = false; }
            });
        } else {
          action();
        }
      }
    );
  }

  cloneData(): void {
    this.loading = true;
    const request = this.schedulesFirebaseService.add(this.form.value, this.billUid);
    this.checkDuplicatedSchedule(() => this.runPromise(request,
      () => this.snackBar.open('Sklonowano planowaną płatność.', 'Ukryj', { duration: 3000 }),
      error => this.snackBar.open('Błąd klonowania planowanej płatności:' + error, 'Ukryj', { panelClass: 'snackbar-style-error' })));
  }

  private runPromise(promise: Promise<any>, actionThen?: () => void, actionError?: (error: any) => void): void {
    promise.then(resp => {
      this.loading = false;
      if (actionThen) { actionThen(); }
    },
      error => {
        this.loading = false;
        console.error(error);
        if (actionError) { actionError(error); }
      });
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => ScheduleDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }

}
