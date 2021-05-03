import { Component, OnInit } from '@angular/core';

import { ViewFieldComponentBase } from './../view-text-base';

@Component({
  selector: 'app-view-field-toggle',
  templateUrl: './view-field-toggle.component.html',
  styleUrls: ['./view-field-toggle.component.scss']
})
export class ViewFieldToggleComponent extends ViewFieldComponentBase implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

}
