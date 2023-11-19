import { Component } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-password',
    templateUrl: './input-password.component.html',
    styleUrls: ['./input-password.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatButtonModule, MatIconModule]
})
export class InputPasswordComponent extends InputBaseComponent {
  hide: boolean = true;

  constructor() { super(); }

  onClick(event: Event): void {
    this.hide = !this.hide;
  }
}
