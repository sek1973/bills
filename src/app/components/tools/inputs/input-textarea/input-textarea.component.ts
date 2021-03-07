import { Component, OnInit, Input } from '@angular/core';

import { InputComponentBase } from './../input-component-base';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss']
})
export class InputTextareaComponent extends InputComponentBase implements OnInit {

  @Input() inputMinRows: number = 10;
  @Input() inputMaxRows: number = 10;

  constructor() { super(); }

  ngOnInit() {
  }

}
