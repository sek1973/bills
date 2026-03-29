import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FieldDescription } from 'projects/model/src/lib/model';
import { AuthService } from 'projects/model/src/public-api';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { InputTextComponent, NotificationService } from 'projects/tools/src/public-api';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, InputTextComponent, RouterLink]
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  loading = signal(false);
  emailSent = signal(false);

  emailFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.email,
  ]);
  form = new UntypedFormGroup({ email: this.emailFormControl });

  formDescription = new Map<string, FieldDescription>([
    ['email', {
      tooltipText: 'Podaj adres e-mail powiązany z kontem.',
      placeholderText: 'Adres e-mail',
      labelText: 'Adres e-mail'
    }]
  ]);

  onSubmit(): void {
    this.loading.set(true);
    this.authService.resetPassword(this.form.value.email).subscribe({
      next: success => {
        this.loading.set(false);
        if (success) {
          this.emailSent.set(true);
          this.notification.success('Link do resetowania hasła został wysłany na podany adres e-mail.');
        } else {
          this.notification.warning('Błąd wysyłania linku. Sprawdź adres e-mail i spróbuj ponownie.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.notification.warning('Błąd wysyłania linku. Spróbuj ponownie.');
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
