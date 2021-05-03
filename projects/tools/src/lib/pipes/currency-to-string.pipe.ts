import { Pipe, PipeTransform } from '@angular/core';
import { currencyToString } from 'projects/model/src/public-api';

@Pipe({
  name: 'currencyToString'
})
export class CurrencyToStringPipe implements PipeTransform {

  transform(value: number): string | undefined {
    return currencyToString(value);
  }

}
