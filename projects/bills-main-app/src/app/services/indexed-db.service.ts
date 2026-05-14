import { Injectable } from '@angular/core';
import { OfflineCacheService, OverviewBill, Payment } from '@bills/model';
import { IDBPDatabase, openDB } from 'idb';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CachedBill {
  id: number;
  position?: number;
  name: string;
  description?: string;
  active: boolean;
  url?: string;
  login?: string;
  account?: string;
  defaultSum: number;
  repeat: number;
  unit: number;
  dueDate?: Date;
  sum: number;
}

interface CachedPayment {
  id: number;
  deadline: Date;
  sum: number;
  paiddate?: Date;
  remarks?: string;
  reminder?: Date;
  billId?: number;
}

interface BillsAppDB {
  bills: {
    key: number;
    value: CachedBill;
  };
  payments: {
    key: number;
    value: CachedPayment;
  };
}

const DB_NAME = 'bills-app';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class IndexedDbService extends OfflineCacheService {
  private readonly db$: Promise<IDBPDatabase<BillsAppDB>>;

  constructor() {
    super();
    this.db$ = openDB<BillsAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bills')) {
          db.createObjectStore('bills', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('payments')) {
          db.createObjectStore('payments', { keyPath: 'id' });
        }
      },
    });
  }

  getBills(): Observable<OverviewBill[]> {
    return from(this.db$.then(db => db.getAll('bills'))).pipe(
      map(rows =>
        rows.map(
          r =>
            new OverviewBill(
              r.position,
              r.name,
              r.description,
              r.active,
              r.url,
              r.login,
              r.account,
              r.defaultSum,
              r.repeat,
              r.unit,
              r.id,
              r.dueDate ? new Date(r.dueDate) : undefined,
              r.sum,
            ),
        ),
      ),
    );
  }

  saveBills(bills: OverviewBill[]): Observable<void> {
    return from(
      this.db$.then(async db => {
        const tx = db.transaction('bills', 'readwrite');
        await tx.store.clear();
        await Promise.all(
          bills.map(b =>
            tx.store.put({
              id: b.id,
              position: b.position,
              name: b.name,
              description: b.description,
              active: b.active,
              url: b.url,
              login: b.login,
              account: b.account,
              defaultSum: b.defaultSum,
              repeat: b.repeat,
              unit: b.unit,
              dueDate: b.dueDate,
              sum: b.sum,
            }),
          ),
        );
        await tx.done;
      }),
    );
  }

  getPayments(): Observable<Payment[]> {
    return from(this.db$.then(db => db.getAll('payments'))).pipe(
      map(rows =>
        rows.map(
          r =>
            new Payment(
              r.deadline ? new Date(r.deadline) : new Date(),
              r.sum,
              r.paiddate ? new Date(r.paiddate) : undefined,
              r.remarks,
              r.reminder ? new Date(r.reminder) : undefined,
              r.billId,
              r.id,
            ),
        ),
      ),
    );
  }

  savePayments(payments: Payment[]): Observable<void> {
    return from(
      this.db$.then(async db => {
        const tx = db.transaction('payments', 'readwrite');
        await tx.store.clear();
        await Promise.all(
          payments.map(p =>
            tx.store.put({
              id: p.id,
              deadline: p.deadline,
              sum: p.sum,
              paiddate: p.paiddate,
              remarks: p.remarks,
              reminder: p.reminder,
              billId: p.billId,
            }),
          ),
        );
        await tx.done;
      }),
    );
  }
}
