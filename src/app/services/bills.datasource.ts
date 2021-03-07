import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { TableDataSource } from '../components/tools/table/table-data-source';
import { Bill } from '../model/bill';
import { BillsFirebaseService } from './bills.firebase.service';

export class BillsDataSource extends TableDataSource<Bill> {

	constructor(private billsFirebaseService: BillsFirebaseService) {
		super([]);
		this.loading$ = this.billsFirebaseService.billsLoading$;
		this.subscription = this.billsFirebaseService
			.billsObservable
			.subscribe((bills) => {
				this.data = bills.sort((a, b) => {
					if (!a.active && b.active) { return 1; }
					if (a.active && !b.active) { return -1; }
					if (a.deadline.toDate() > b.deadline.toDate()) { return 1; }
					if (a.deadline.toDate() < b.deadline.toDate()) { return -1; }
					if (a.name > b.name) { return 1; }
					if (a.name < b.name) { return -1; }
				});
			});
	}

}
