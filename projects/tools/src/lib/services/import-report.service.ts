import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportReport } from 'projects/model/src/public-api';
import { ImportReportDialogComponent } from '../components/import-report-dialog/import-report-dialog.component';

@Injectable({ providedIn: 'root' })
export class ImportReportService {
  private dialog = inject(MatDialog);

  show(report: ImportReport[]): void {
    this.dialog.open(ImportReportDialogComponent, {
      maxWidth: '760px',
      maxHeight: '600px',
      data: report
    });
  }
}
