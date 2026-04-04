import { ValidatorFn } from '@angular/forms';

export enum ConfirmDialogInputType {
  InputTypeText,
  InputTypeCurrency,
  InputTypeTextArea
}

export interface ConfirmDialogModel {
  dialogTitle: string;
  message: string;
  cancelButtonLabel?: string;
  cancelButtonVisible?: boolean;
  applyButtonLabel?: string;
  inputType?: ConfirmDialogInputType;
  inputValue?: unknown;
  inputValidators?: ValidatorFn | ValidatorFn[];
  inputLabelText?: string;
  inputPlaceholderText?: string;
  inputTooltipText?: string;
}
