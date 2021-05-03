import { Inject, Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogInputType, ConfirmDialogModel, ConfirmDialogResponse } from '../components';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(@Inject(MatDialog) private dialog: MatDialog) { }

  confirm(
    dialogTitle: string,
    message: string,
    cancelButtonLabel = 'Cancel',
    applyButtonLabel = 'Apply',
    inputType?: ConfirmDialogInputType,
    inputValue?: any,
    inputValidators?: ValidatorFn | ValidatorFn[],
    inputLabelText?: string,
    inputPlaceholderText?: string,
    inputTooltipText?: string
  ): Observable<boolean | ConfirmDialogResponse> {
    const dialogData = new ConfirmDialogModel(dialogTitle, message, cancelButtonLabel, applyButtonLabel,
      inputType, inputValue, inputValidators, inputLabelText, inputPlaceholderText, inputTooltipText);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '600px',
      maxHeight: '800px',
      data: dialogData
    });
    return dialogRef.afterClosed() as Observable<boolean | ConfirmDialogResponse>;
  }
}
