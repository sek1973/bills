import { ValidatorFn } from '@angular/forms';

export enum ConfirmDialogInputType {
  InputTypeText,
  InputTypeCurrency,
  InputTypeTextArea
}

export class ConfirmDialogModel {
  constructor(
    public dialogTitle: string,
    public message: string,
    public cancelButtonLabel = 'Anuluj',
    public applyButtonLabel = 'OK',
    public inputType?: ConfirmDialogInputType,
    public inputValue?: any,
    public inputValidators?: ValidatorFn | ValidatorFn[],
    public inputLabelText?: string,
    public inputPlaceholderText?: string,
    public inputTooltipText?: string
  ) { }
}
