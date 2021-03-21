
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, Subscription } from 'rxjs';

export abstract class TableDataSource<T> extends MatTableDataSource<T> {
  protected subscription = Subscription.EMPTY;
  public loading$: Observable<boolean> = of(false);

  connect() {
    return super.connect();
  }

  disconnect(): void {
    this.subscription.unsubscribe();
    super.disconnect();
  }

}
