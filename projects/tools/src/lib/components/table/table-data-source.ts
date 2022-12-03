
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';

export class TableDataSource<T extends { [key: string]: any }> extends MatTableDataSource<T> {
  protected subscription = Subscription.EMPTY;

  connect(): BehaviorSubject<T[]> {
    return super.connect();
  }

  disconnect(): void {
    this.subscription.unsubscribe();
    super.disconnect();
  }

}
