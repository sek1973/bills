import { BehaviorSubject } from 'rxjs';

import { TableDataSource } from '../components/tools/table/table-data-source';
import { Schedule } from '../model/schedule';
import { SchedulesFirebaseService } from './schedules.firebase.service';

export class SchedulesDataSource extends TableDataSource<Schedule> {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private schedulesFirebaseService: SchedulesFirebaseService, private uid: string) {
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
    this.subscription = this.schedulesFirebaseService
      .fetch(this.uid)
      .subscribe((schedules) => {
        this.data = schedules.sort((a, b) => {
          if (a.date.toDate() > b.date.toDate()) {
            return 1;
          } else { return -1; }
        });
        this.loadingSubject.next(false);
      });
  }
}
