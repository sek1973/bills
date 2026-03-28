import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ViewFieldComponentBase } from './../view-text-base';

@Component({
  selector: 'app-view-field-toggle',
  templateUrl: './view-field-toggle.component.html',
  styleUrls: ['./view-field-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggleModule]
})
export class ViewFieldToggleComponent extends ViewFieldComponentBase {
}
