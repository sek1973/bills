import { Component, Input, OnInit, PipeTransform } from '@angular/core';
import { ViewFieldComponentBase } from './../view-text-base';
import { DynamicPipe } from '../../../pipes/dynamic.pipe';


@Component({
    selector: 'app-view-field-text',
    templateUrl: './view-field-text.component.html',
    styleUrls: ['./view-field-text.component.scss'],
    imports: [DynamicPipe]
})
export class ViewFieldTextComponent extends ViewFieldComponentBase implements OnInit {
  @Input() customPipe?: PipeTransform;
  @Input() customPipeArgs: any[] = [];

  constructor() { super(); }

  ngOnInit(): void {
  }

}
