import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FieldDescription } from 'src/app/model/field-description';

import { MessagingService } from '../../services/messaging.service';
import { DescriptionProvider } from '../tools/inputs/input-component-base';
import { AuthService } from './../../services/auth.service';
import { BillsFirebaseService } from './../../services/bills.firebase.service';
import { NavigationService } from './../../services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public error = undefined;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  loginForm = new FormGroup({ email: this.emailFormControl, password: this.passwordFormControl });

  formDescription = new Map<string, FieldDescription>([
    ['email', {
      tooltipText: 'Podaj adres email - login do aplikacji.',
      placeholderText: 'Adres email - login',
      labelText: 'Adres email'
    }],
    ['password', {
      tooltipText: 'Podaj hasło, którego używasz do logowania do aplikacji.',
      placeholderText: 'Hasło',
      labelText: 'Hasło'
    }]
  ]);

  constructor(private authService: AuthService,
    private navigationService: NavigationService,
    private billsFirebaseService: BillsFirebaseService,
    private messagingService: MessagingService) { }

  ngOnInit() {
  }

  onLogIn() {
    this.error = undefined;
    this.loadingSubject.next(true);
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.authService.login(email, password).then(
      () => {
        this.billsFirebaseService.load();
        this.loadingSubject.next(false);
        this.authService.getUserName().subscribe(userId => {
          this.messagingService.requestPermission(userId);
          this.messagingService.receiveMessage();
        });
        setTimeout(() => this.navigationService.goToPreviousPage('/zestawienie'));
      },
      rejected => {
        this.error = rejected.message;
        this.loadingSubject.next(false);
        console.error(rejected);
      }
    );
  }

  getErrorMessage(formControl: FormControl): string {
    let errorMsg = '';
    if (formControl.errors) {
      formControl.errors.array.forEach(err => {
        errorMsg += err;
      });
    }
    return errorMsg;
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => this.formDescription.get(path[0])
    };
  }

}
