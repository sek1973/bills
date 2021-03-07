import { Pipe, PipeTransform } from '@angular/core';

import { currencyToString } from '../helpers';

@Pipe({
  name: 'currencyToString'
})
export class CurrencyToStringPipe implements PipeTransform {

  transform(value: number): string {
    return currencyToString(value);
  }

}
