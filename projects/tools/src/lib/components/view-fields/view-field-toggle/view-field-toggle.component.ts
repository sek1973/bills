import { Component, OnInit } from '@angular/core';

import { ViewFieldComponentBase } from './../view-text-base';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-view-field-toggle',
    templateUrl: './view-field-toggle.component.html',
    styleUrls: ['./view-field-toggle.component.scss'],
    standalone: true,
    imports: [MatSlideToggleModule]
})
export class ViewFieldToggleComponent extends ViewFieldComponentBase implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

}
