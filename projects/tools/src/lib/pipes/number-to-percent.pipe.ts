import { Pipe, PipeTransform } from '@angular/core';
import { percentToString } from 'model';

@Pipe({
  name: 'numberToPercent'
})
export class NumberToPercentPipe implements PipeTransform {

  transform(value: number): string | undefined {
    return percentToString(value);
  }

}
