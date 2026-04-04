import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DescriptionProvider } from '../inputs/input-component-base';
import { InputCurrencyComponent } from '../inputs/input-currency/input-currency.component';
import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../inputs/input-textarea/input-textarea.component';
import { ConfirmDialogInputType, ConfirmDialogModel } from './confirm-dialog.model';

export interface ConfirmDialogResponse {
  response: boolean;
  value: unknown;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputTextComponent, FormsModule, ReactiveFormsModule, InputCurrencyComponent, InputTextareaComponent, MatButtonModule]
})
export class ConfirmDialogComponent {
  protected dialogTitle: string;
  protected message: string;
  protected cancelButtonLabel: string;
  protected cancelButtonVisible: boolean = true;
  protected applyButtonLabel: string;
  protected canApply = signal(true);

  protected form: UntypedFormGroup = new UntypedFormGroup({});
  protected inputType?: ConfirmDialogInputType;
  protected confirmDialogInputType = ConfirmDialogInputType;
  protected descriptionProvider!: DescriptionProvider;

  public dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as ConfirmDialogModel;

  constructor() {
    this.dialogTitle = this.data.dialogTitle;
    this.message = this.data.message;
    this.cancelButtonVisible = this.data.cancelButtonVisible ?? true;
    this.cancelButtonLabel = this.data.cancelButtonLabel || 'Cancel';
    this.applyButtonLabel = this.data.applyButtonLabel || 'Apply';
    this.initInput(this.data);
  }

  initInput(data: ConfirmDialogModel): void {
    if (data.inputType !== undefined) {
      this.inputType = data.inputType;
      this.descriptionProvider = {
        getDescriptionObj: () => {
          return {
            tooltipText: data.inputTooltipText || '',
            placeholderText: data.inputPlaceholderText || '',
            labelText: data.inputLabelText || ''
          };
        }
      };
      this.form = new UntypedFormGroup({ input: new UntypedFormControl(data.inputValue, data.inputValidators) });
      this.form.statusChanges.subscribe(status => this.canApply.set(status === 'VALID'));
      this.canApply.set(this.form.status === 'VALID');
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
