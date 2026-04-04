import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OverviewBill } from '../model';

@Injectable({
  providedIn: 'root',
})
export abstract class OverviewBillsService {
  abstract load(): Observable<OverviewBill[]>;
}
