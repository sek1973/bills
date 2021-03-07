import { BehaviorSubject } from 'rxjs';

import { TableDataSource } from '../components/tools/table/table-data-source';
import { Payment } from '../model/payment';
import { PaymentsFirebaseService } from './payments.firebase.service';

export class PaymentsDataSource extends TableDataSource<Payment> {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private paymentsFirebaseService: PaymentsFirebaseService, private uid: string) {
    super([]);
    this.loading$ = this.loadingSubject.asObservable();
  }

  disconnect(): void {
    this.loadingSubject.complete();
    super.disconnect();
  }

  load() {
    this.subscription.unsubscribe();
    this.loadingSubject.next(true);
    this.subscription = this.paymentsFirebaseService
      .fetch(this.uid)
      .subscribe((payments) => {
        this.data = payments.sort((a, b) => {
          if (a.deadline === null || a.deadline === undefined) { return 1; }
          if (b.deadline === null || b.deadline === undefined) { return -1; }
          if (a.deadline.toDate() < b.deadline.toDate()) {
            return 1;
          } else { return -1; }
        });
        this.loadingSubject.next(false);
      });
  }
}
