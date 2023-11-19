import { Component, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
    selector: 'app-input-date',
    templateUrl: './input-date.component.html',
    styleUrls: ['./input-date.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatTooltipModule]
})
export class InputDateComponent extends InputBaseComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
