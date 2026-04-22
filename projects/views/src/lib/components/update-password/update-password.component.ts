import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService, FieldDescription } from 'model';
import { DescriptionProvider, InputPasswordComponent, NotificationService } from 'tools';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, InputPasswordComponent, RouterLink]
})
export class UpdatePasswordComponent {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
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
      this.notification.warning('Hasła nie są identyczne.');
      return;
    }

    this.loading.set(true);
    this.authService.updatePassword(newPassword).subscribe({
      next: success => {
        this.loading.set(false);
        if (success) {
          this.notification.success('Hasło zostało zmienione. Zaloguj się ponownie.');
          this.router.navigate(['/login']);
        } else {
          this.notification.warning('Błąd zmiany hasła. Spróbuj ponownie.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.notification.warning('Błąd zmiany hasła. Spróbuj ponownie.');
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
