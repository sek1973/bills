import { ChangeDetectionStrategy, Component, input, PipeTransform } from '@angular/core';
import { DynamicPipe } from '../../../pipes/dynamic.pipe';
import { ViewFieldComponentBase } from './../view-text-base';


@Component({
  selector: 'app-view-field-text',
  templateUrl: './view-field-text.component.html',
  styleUrls: ['./view-field-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicPipe]
})
export class ViewFieldTextComponent extends ViewFieldComponentBase {
  customPipe = input<PipeTransform>();
  customPipeArgs = input<any[]>([]);
}
