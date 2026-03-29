import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Ukryj', { duration: 3000, panelClass: 'snackbar-style-success' });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Ukryj', { duration: 60000, panelClass: 'snackbar-style-error' });
  }

  warning(message: string): void {
    this.snackBar.open(message, 'Ukryj', { duration: 5000, panelClass: 'snackbar-style-warning' });
  }
}
