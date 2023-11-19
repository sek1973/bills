import { Pipe, PipeTransform } from '@angular/core';
import { dateToString } from 'projects/model/src/public-api';

@Pipe({
    name: 'timespanToString',
    standalone: true
})
export class DateToStringPipe implements PipeTransform {

  transform(value: Date): string | undefined {
    return dateToString(value);
  }

}
