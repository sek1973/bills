import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FieldDescription } from 'projects/model/src/lib/model';
import { AppState, AuthActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public error: string | undefined = undefined;

  userFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]);
  passwordFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  loginForm = new UntypedFormGroup({ user: this.userFormControl, password: this.passwordFormControl });

  formDescription = new Map<string, FieldDescription>([
    ['user', {
      tooltipText: 'Podaj nazwę użytkownika - login do aplikacji.',
      placeholderText: 'Nazwa użytkownika - login',
      labelText: 'Nazwa użytkownika'
    }],
    ['password', {
      tooltipText: 'Podaj hasło, którego używasz do logowania do aplikacji.',
      placeholderText: 'Hasło',
      labelText: 'Hasło'
    }]
  ]);

  constructor(private store: Store<AppState>) { }

  onLogIn(): void {
    this.error = undefined;
    const user = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.store.dispatch(AuthActions.login({ user, password }));
  }

  getErrorMessage(formControl: UntypedFormControl): string {
    let errorMsg = '';
    if (formControl.errors) {
      formControl.errors.array.forEach((err: string) => {
        errorMsg += err;
      });
    }
    return errorMsg;
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => this.formDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }

}
