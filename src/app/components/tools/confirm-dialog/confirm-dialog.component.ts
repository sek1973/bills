import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DescriptionProvider } from '../inputs/input-component-base';
import { ConfirmDialogInputType, ConfirmDialogModel } from './confirm-dialog.model';

export interface ConfirmDialogResponse {
  response: boolean;
  value: any;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  dialogTitle: string;
  message: string;
  cancelButtonLabel: string;
  applyButtonLabel: string;
  canApply: boolean = true;

  form?: FormGroup;
  inputType?: ConfirmDialogInputType;
  confirmDialogInputType = ConfirmDialogInputType;
  descriptionProvider!: DescriptionProvider;

  constructor(
    @Inject(MatDialogRef) public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel
  ) {
    this.dialogTitle = data.dialogTitle;
    this.message = data.message;
    this.cancelButtonLabel = data.cancelButtonLabel;
    this.applyButtonLabel = data.applyButtonLabel;
    this.initInput(data);
  }

  ngOnInit(): void { }

  initInput(data: ConfirmDialogModel): void {
    if (data.inputType !== undefined) {
      this.inputType = data.inputType;
      this.descriptionProvider = {
        getDescriptionObj: (...path: string[]) => {
          return {
            tooltipText: data.inputTooltipText || '',
            placeholderText: data.inputPlaceholderText || '',
            labelText: data.inputLabelText || ''
          };
        }
      };
      this.form = new FormGroup({ input: new FormControl(data.inputValue, data.inputValidators) });
      this.form.statusChanges.subscribe(status => this.canApply = (status === 'VALID') ? true : false);
      this.canApply = (this.form.status === 'VALID') ? true : false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onApply(): void {
    if (this.form) {
      this.dialogRef.close({ response: true, value: this.form.get('input')?.value });
    } else {
      this.dialogRef.close(true);
    }
  }
}
