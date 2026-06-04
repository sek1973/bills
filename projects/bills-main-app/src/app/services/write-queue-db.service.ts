import { Injectable } from '@angular/core';
import { QueuedOperation, QueuedOperationType, WriteQueueService } from '@bills/model';
import { IDBPDatabase, openDB } from 'idb';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface WriteQueueDB {
  'write-ops': {
    key: number;
    value: QueuedOperation;
  };
}

const QUEUE_DB_NAME = 'bills-write-queue';
const QUEUE_DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class WriteQueueDbService extends WriteQueueService {
  private readonly db$: Promise<IDBPDatabase<WriteQueueDB>>;

  constructor() {
    super();
    this.db$ = openDB<WriteQueueDB>(QUEUE_DB_NAME, QUEUE_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('write-ops')) {
          db.createObjectStore('write-ops', { keyPath: 'id' });
        }
      },
    });
  }

  enqueue(type: QueuedOperationType, payload: unknown): Observable<void> {
    const op: QueuedOperation = {
      id: Date.now(),
      type,
      payload: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    };
    return from(this.db$.then(db => db.put('write-ops', op))).pipe(map(() => void 0));
  }

  dequeue(id: number): Observable<void> {
    return from(this.db$.then(db => db.delete('write-ops', id))).pipe(map(() => void 0));
  }

  getAll(): Observable<QueuedOperation[]> {
    return from(this.db$.then(db => db.getAll('write-ops')));
  }
}
