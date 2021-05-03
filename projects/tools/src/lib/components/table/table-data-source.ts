
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';

export class TableDataSource<T extends { [key: string]: any }> extends MatTableDataSource<T> {
  protected subscription = Subscription.EMPTY;
  public loading$: Observable<boolean> = of(false);

  connect(): BehaviorSubject<T[]> {
    return super.connect();
  }

  disconnect(): void {
    this.subscription.unsubscribe();
    super.disconnect();
  }

}
