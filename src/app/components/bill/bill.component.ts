import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getSafe } from 'src/app/helpers';

import { Bill } from './../../model/bill';
import { AuthService } from './../../services/auth.service';
import { BillsFirebaseService } from './../../services/bills.firebase.service';

@Component({
	selector: 'app-bill',
	templateUrl: './bill.component.html',
	styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {

	private subscription = Subscription.EMPTY;
	editMode = false;
	newBill = false;
	bill: Bill;
	loading: boolean = true;

	constructor(private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private billsFirebaseService: BillsFirebaseService) { }

	ngOnInit() {
		let id: number;
		this.subscription = this.route.paramMap.pipe(switchMap(param => {
			const params = param['params'];
			id = params ? +params['id'] : undefined;
			return this.billsFirebaseService.billsObservable;
		}))
			.subscribe(bills => this.handleData(bills, id));
	}

	private handleData(bills: Bill[], id: number) {
		this.bill = bills.find(b => b.id === id);
		if (!this.bill) {
			this.createBill();
			this.editMode = true;
			this.newBill = true;
			this.loading = false;
		} else {
			this.editMode = false;
			this.newBill = false;
			this.loading = false;
		}
	}

	private createBill() {
		this.bill = new Bill();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	getTitle(): string {
		const title = getSafe(() => this.bill.name);
		return title || 'Rachunek bez nazwy';
	}

	onLoading(event: boolean): void {
		this.loading = event;
	}

}
