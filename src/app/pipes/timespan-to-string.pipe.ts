import { Pipe, PipeTransform } from '@angular/core';
import { firestore } from 'firebase';

import { timestampToString } from '../helpers';

import Timestamp = firestore.Timestamp;
@Pipe({
  name: 'timespanToString'
})
export class TimespanToStringPipe implements PipeTransform {

  transform(value: Timestamp): string {
    return timestampToString(value);
  }

}
