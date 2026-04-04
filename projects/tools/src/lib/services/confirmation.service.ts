import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel, ConfirmDialogResponse } from '../components/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  confirm(dialogData: ConfirmDialogModel): Observable<boolean | ConfirmDialogResponse> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '600px',
      maxHeight: '800px',
      data: dialogData
    });
    return dialogRef.afterClosed() as Observable<boolean | ConfirmDialogResponse>;
  }
}
