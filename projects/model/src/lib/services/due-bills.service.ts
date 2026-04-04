import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DueBill } from '../model';

@Injectable({
  providedIn: 'root',
})
export abstract class DueBillsService {
  abstract load(): Observable<DueBill[]>;
}
