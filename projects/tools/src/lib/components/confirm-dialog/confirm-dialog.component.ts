import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DescriptionProvider } from '../inputs/input-component-base';
import { ConfirmDialogInputType, ConfirmDialogModel } from './confirm-dialog.model';
import { MatButtonModule } from '@angular/material/button';
import { InputTextareaComponent } from '../inputs/input-textarea/input-textarea.component';
import { InputCurrencyComponent } from '../inputs/input-currency/input-currency.component';
import { InputTextComponent } from '../inputs/input-text/input-text.component';

export interface ConfirmDialogResponse {
  response: boolean;
  value: any;
}

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    standalone: true,
    imports: [InputTextComponent, FormsModule, ReactiveFormsModule, InputCurrencyComponent, InputTextareaComponent, MatButtonModule]
})
export class ConfirmDialogComponent {
  dialogTitle: string;
  message: string;
  cancelButtonLabel: string;
  applyButtonLabel: string;
  canApply: boolean = true;

  form: UntypedFormGroup = new UntypedFormGroup({});
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
      this.form = new UntypedFormGroup({ input: new UntypedFormControl(data.inputValue, data.inputValidators) });
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
