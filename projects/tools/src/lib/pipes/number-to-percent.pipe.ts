import { Pipe, PipeTransform } from '@angular/core';
import { percentToString } from 'projects/model/src/public-api';

@Pipe({
    name: 'numberToPercent',
    standalone: true
})
export class NumberToPercentPipe implements PipeTransform {

  transform(value: number): string | undefined {
    return percentToString(value);
  }

}
