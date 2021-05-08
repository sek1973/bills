import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FieldDescription } from 'projects/model/src/lib/model';
import { AuthService } from 'projects/model/src/public-api';
import { AppState, AuthActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { NavigationService } from 'projects/tools/src/public-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public error: string | undefined = undefined;

  private loginSubscription = Subscription.EMPTY;

  userFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  loginForm = new FormGroup({ user: this.userFormControl, password: this.passwordFormControl });

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

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private store: Store<AppState>) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
  }

  onLogIn(): void {
    this.error = undefined;
    const user = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.store.dispatch(AuthActions.login({ user }));
    this.authService.login(user, password).subscribe({
      next: (val: boolean) => {
        this.store.dispatch(AuthActions.loginSuccess({ user }));
        this.navigationService.goToPreviousPage('/zestawienie');
      },
      error: (err: Error) => {
        this.error = err.message;
        this.store.dispatch(AuthActions.loginFailure({ error: this.error }));
        console.error(err);
      }
    });
  }

  getErrorMessage(formControl: FormControl): string {
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
