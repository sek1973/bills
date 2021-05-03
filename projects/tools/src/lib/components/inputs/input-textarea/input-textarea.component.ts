import { Component, Input, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';


@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss']
})
export class InputTextareaComponent extends InputBaseComponent implements OnInit {

  @Input() inputMinRows: number = 10;
  @Input() inputMaxRows: number = 10;

  constructor() { super(); }

  ngOnInit() {
  }

}
