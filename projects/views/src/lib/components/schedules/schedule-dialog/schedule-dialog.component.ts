import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Schedule, ScheduleDescription } from 'projects/model/src/lib/model';
import { calculateNextScheduleDate } from 'projects/model/src/public-api';
import { AppState } from 'projects/store/src/lib/state';
import { SchedulesActions } from 'projects/store/src/lib/state/schedule';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { validateDisinctScheduleDate, validateScheduleDate } from 'projects/tools/src/public-api';

export interface ScheduleDialogData {
  bill: Bill;
  schedule?: Schedule;
  schedules: Schedule[];
}
@Component({
  selector: 'app-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.scss']
})
export class ScheduleDialogComponent implements OnInit, AfterViewInit {

  schedule?: Schedule;
  bill?: Bill;
  dialogTitle: string = '';
  dialogMode: 'add' | 'edit' = 'add';
  canSave = false;
  canClone = false;

  form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(),
    date: new UntypedFormControl(new Date(), Validators.required),
    sum: new UntypedFormControl(),
    remarks: new UntypedFormControl()
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    private store: Store<AppState>) {
    this.bill = data?.bill;
    this.schedule = data?.schedule;
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.setDateValidators();
      this.setFormValue();
      this.form.markAllAsTouched();
    });
  }

  private setDateValidators(): void {
    const dateCtl = this.form.get('date') as UntypedFormControl;
    dateCtl?.setValidators([
      Validators.required,
      validateDisinctScheduleDate(this.data.schedules, this.schedule),
      validateScheduleDate(this.bill?.deadline || null)]);
    dateCtl?.updateValueAndValidity();
  }

  private setFormValue(): void {
    let value: any;
    if (this.schedule) {
      value = {
        id: this.schedule.id,
        date: this.schedule.date,
        sum: this.schedule.sum,
        remarks: this.schedule.remarks
      };
    } else {
      value = {
        id: -1,
        date: calculateNextScheduleDate(this.bill, this.bill?.deadline, this.data.schedules),
        sum: this.bill?.sum
      };
    }
    this.form.patchValue(value);
    this.setEditStatus(this.form.status);
  }

  private setEditStatus(status: string): void {
    this.canSave = status === 'VALID' ? true : false;
    this.canClone = status === 'VALID' && this.schedule ? true : false;
    this.dialogTitle = (this.schedule ? 'Edytuj' : 'Dodaj') + ' planowaną płatność';
    this.dialogMode = this.schedule ? 'edit' : 'add';
  }

  closeDialog(): void {
    this.dialogRef.close('cancel');
  }

  saveData(): void {
    const val = this.form.value;
    const schedule = this.schedule ? this.schedule.clone(this.schedule.id) : new Schedule();
    schedule.date = val.date;
    schedule.sum = val.sum;
    schedule.remarks = val.remarks;
    schedule.billId = this.bill?.id || -1;
    if (schedule.id > -1) {
      this.store.dispatch(SchedulesActions.updateSchedule({ schedule }));
    } else {
      this.store.dispatch(SchedulesActions.createSchedule({ schedule }));
    }
    this.dialogRef.close(schedule);
  }

  cloneData(): void {
    this.schedule = undefined;
    this.setDateValidators();
    const dateCtl = this.form.get('date');
    dateCtl?.setValue(
      calculateNextScheduleDate(this.bill, dateCtl.value, this.data.schedules));
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => ScheduleDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }

}
