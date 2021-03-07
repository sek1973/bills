import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private billsFirebaseService: BillsFirebaseService,
		            private messagingService: MessagingService,
		            private authGuard: AuthGuard,
		            private authService: AuthService,
		            private reminderService: ReminderService) {
		this.reminderService.start();
	}

	ngOnInit() {
		this.authGuard.canActivate(null, null).subscribe(response => {
			if (response) {
				this.billsFirebaseService.load();
				this.authService.getUserName().subscribe(userId => {
					this.messagingService.requestPermission(userId);
					this.messagingService.receiveMessage();
				});
			}
		});
	}

	ngOnDestroy() {
		this.reminderService.stop();
	}
}
