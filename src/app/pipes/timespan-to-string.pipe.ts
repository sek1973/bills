import { Pipe, PipeTransform } from '@angular/core';

import { dateToString } from '../helpers';

@Pipe({
  name: 'timespanToString'
})
export class TimespanToStringPipe implements PipeTransform {

  transform(value: Date): string | undefined {
    return dateToString(value);
  }

}
