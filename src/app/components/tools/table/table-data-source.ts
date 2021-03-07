import { MatTableDataSource } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

export abstract class TableDataSource<T> extends MatTableDataSource<T> {
  protected subscription = Subscription.EMPTY;
  public loading$: Observable<boolean>;

  connect() {
    return super.connect();
  }

  disconnect(): void {
    this.subscription.unsubscribe();
    super.disconnect();
  }

}
