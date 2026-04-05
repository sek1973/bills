import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ImportReport } from 'projects/model/src/public-api';

@Component({
  selector: 'app-import-report-dialog',
  templateUrl: './import-report-dialog.component.html',
  styleUrls: ['./import-report-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatTableModule]
})
export class ImportReportDialogComponent {
  dialogRef = inject(MatDialogRef<ImportReportDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as ImportReport[];

  protected readonly displayedColumns = ['row', 'id', 'status', 'error'];

  protected readonly dataSource = this.data.map((item, index) => ({
    row: index + 1,
    id: item.id ?? '—',
    status: item.error ? 'Błąd' : 'OK',
    error: item.error ?? ''
  }));

  close(): void {
    this.dialogRef.close();
  }
}
