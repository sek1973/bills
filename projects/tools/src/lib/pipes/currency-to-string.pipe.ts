import { Pipe, PipeTransform } from '@angular/core';
import { currencyToString } from '@bills/model';

@Pipe({
  name: 'currencyToString'
})
export class CurrencyToStringPipe implements PipeTransform {

  transform(value: number): string | undefined {
    return currencyToString(value);
  }

}
