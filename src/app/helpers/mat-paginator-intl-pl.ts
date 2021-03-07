import { MatPaginatorIntl } from '@angular/material';
import { Injectable } from "@angular/core";

@Injectable()
export class MatPaginatorIntlPL extends MatPaginatorIntl {
  itemsPerPageLabel = 'Na stronie';
  nextPageLabel = 'Następna strona';
  previousPageLabel = 'Poprzednia strona';

  getRangeLabel = function (page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return '0 z ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;

    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' z ' + length;
  };

}
