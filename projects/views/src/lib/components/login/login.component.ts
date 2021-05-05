import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FieldDescription } from 'projects/model/src/lib/model';
import { AuthService } from 'projects/model/src/public-api';
import { AuthActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { NavigationService } from 'projects/tools/src/public-api';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
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
    private store: Store) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
  }

  onLogIn(): void {
    this.error = undefined;
    this.loadingSubject.next(true);
    const user = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.authService.login(user, password).subscribe({
      next: (val: boolean) => {
        this.store.dispatch(AuthActions.login({ user, password }));
        this.loadingSubject.next(false);
        this.navigationService.goToPreviousPage('/zestawienie');
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loadingSubject.next(false);
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
