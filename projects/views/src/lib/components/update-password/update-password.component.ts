import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { FieldDescription } from 'projects/model/src/lib/model';
import { AuthService } from 'projects/model/src/public-api';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { InputPasswordComponent } from 'projects/tools/src/public-api';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, InputPasswordComponent, RouterLink]
})
export class UpdatePasswordComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);

  newPasswordFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  confirmPasswordFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  form = new UntypedFormGroup({
    newPassword: this.newPasswordFormControl,
    confirmPassword: this.confirmPasswordFormControl
  });

  formDescription = new Map<string, FieldDescription>([
    ['newPassword', {
      tooltipText: 'Podaj nowe hasło (minimum 6 znaków).',
      placeholderText: 'Nowe hasło',
      labelText: 'Nowe hasło'
    }],
    ['confirmPassword', {
      tooltipText: 'Powtórz nowe hasło.',
      placeholderText: 'Powtórz hasło',
      labelText: 'Powtórz hasło'
    }]
  ]);

  onSubmit(): void {
    const newPassword = this.form.value.newPassword;
    const confirmPassword = this.form.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('Hasła nie są identyczne.', 'Ukryj', { duration: 5000 });
      return;
    }

    this.loading.set(true);
    this.authService.updatePassword(newPassword).subscribe({
      next: success => {
        this.loading.set(false);
        if (success) {
          this.snackBar.open('Hasło zostało zmienione. Zaloguj się ponownie.', 'Ukryj', { duration: 3000, panelClass: 'snackbar-style-success' });
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open('Błąd zmiany hasła. Spróbuj ponownie.', 'Ukryj', { duration: 5000 });
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Błąd zmiany hasła. Spróbuj ponownie.', 'Ukryj', { duration: 5000 });
      }
    });
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) =>
        this.formDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }
}
