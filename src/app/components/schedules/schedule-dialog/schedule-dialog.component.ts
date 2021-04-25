import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { getSafe } from 'src/app/helpers';
import { Schedule } from 'src/app/model/schedule';
import { AppState } from 'src/app/state/app/app.state';
import { SchedulesActions } from 'src/app/state/schedule';
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
    private store: Store<AppState>) {
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
        date: this.schedule.date,
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
    if (this.schedule) {
      this.store.dispatch(SchedulesActions.updateSchedule({ schedule: this.schedule }));
    } else {
      this.store.dispatch(SchedulesActions.createSchedule({ schedule: this.schedule }));
    }
  }

  cloneData(): void {
    this.schedule.id = -1;
    this.saveData();
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => ScheduleDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }

}
