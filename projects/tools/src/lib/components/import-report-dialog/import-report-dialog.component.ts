import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ImportReport } from '@bills/model';

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

  protected readonly displayedColumns = ['row', 'label', 'id', 'status', 'message'];

  protected readonly dataSource = this.data
    .map((item, index) => ({
      row: item.row ?? index + 1,
      label: item.label ?? '',
      id: item.id ?? '—',
      status: item.error ? 'Błąd' : item.warning ? 'Ostrzeżenie' : 'OK',
      statusColor: item.error ? '#c62828' : item.warning ? '#e68600' : '#2e7d32',
      message: item.error ?? item.warning ?? ''
    }))
    .sort((a, b) => a.row - b.row);

  close(): void {
    this.dialogRef.close();
  }
}
