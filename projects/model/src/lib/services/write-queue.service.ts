import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type QueuedOperationType =
  | 'createPayment' | 'updatePayment' | 'deletePayment'
  | 'createBill' | 'updateBill' | 'deleteBill' | 'payBill';

export interface QueuedOperation {
  id: number;
  type: QueuedOperationType;
  payload: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export abstract class WriteQueueService {
  abstract enqueue(type: QueuedOperationType, payload: unknown): Observable<void>;
  abstract dequeue(id: number): Observable<void>;
  abstract getAll(): Observable<QueuedOperation[]>;
}
