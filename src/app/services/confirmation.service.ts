import { ConfirmDialogInputType } from './../components/tools/confirm-dialog/confirm-dialog.model';
import { ConfirmDialogComponent, ConfirmDialogResponse } from './../components/tools/confirm-dialog/confirm-dialog.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { ConfirmDialogModel } from '../components/tools/confirm-dialog/confirm-dialog.model';
import { ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(private dialog: MatDialog) { }

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
