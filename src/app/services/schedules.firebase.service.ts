import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { Observable, of } from 'rxjs';

import { currencyToNumber, dateToTimestamp, stringToTimestamp } from '../helpers';
import { Bill } from '../model/bill';
import { Schedule } from '../model/schedule';

import Timestamp = firestore.Timestamp;
@Injectable({
  providedIn: 'root',
})
export class SchedulesFirebaseService {

  constructor(public db: AngularFirestore) { }

  fetchComming(bill: Bill): Promise<Schedule> {
    const billUid = bill.uid;
    const ref = this.db.collection<Bill>('bills').doc(billUid).collection<Schedule>('schedules').ref;
    return ref.orderBy('date').limit(1).get().then(result => {
      if (result.empty === false) {
        const uid = result.docs[0].id;
        const schedule = result.docs[0].data() as Schedule;
        schedule.uid = uid;
        return schedule;
      } else { return null; }
    });
  }

  fetch(billUid: string): Observable<Schedule[]> {
    if (billUid !== undefined) {
      const query = this.db.collection<Bill>('bills').doc(billUid).collection<Schedule>('schedules');
      return query.valueChanges({ idField: 'uid' });
    }
    return of([]);
  }

  queryByDate(billUid: string, date: Timestamp): Promise<firestore.QuerySnapshot> {
    const ref = this.db.collection<Bill>('bills').doc(billUid).collection<Schedule>('schedules').ref;
    return ref.where('date', '==', date).get();
  }

  private createScheduleData(schedule: any): Schedule {
    const result: Schedule = {
      date: dateToTimestamp(schedule.date || new Date()),
      sum: schedule.sum || 0,
      remarks: schedule.remarks || '',
    };
    if (schedule.uid) { result.uid = schedule.uid; }
    return result;
  }

  add(schedule: Schedule, billUid: string): Promise<firestore.DocumentReference> {
    return this.db.collection('bills').doc(billUid).collection('schedules').add(this.createScheduleData(schedule));
  }

  update(schedule: Schedule, billUid: string): Promise<void> {
    return this.db.collection('bills').doc(billUid).collection('schedules').doc(schedule.uid).set(this.createScheduleData(schedule));
  }

  delete(schedule: Schedule, billUid: string): Promise<void> {
    return this.db.collection('bills').doc(billUid).collection('schedules').doc(schedule.uid).delete();
  }

  deleteInTransaction(schedule: Schedule, billUid: string, transaction: firestore.Transaction): firestore.Transaction {
    const ref = this.db.firestore.collection('bills').doc(billUid).collection('schedules').doc(schedule.uid);
    return transaction.delete(ref);
  }

  addInTransaction(schedule: Schedule, billUid: string, transaction: firestore.Transaction): firestore.Transaction {
    const ref = this.db.firestore.collection('bills').doc(billUid).collection('schedules').doc();
    return transaction.set(ref, schedule);
  }

  importSchedules(data: string, billUid: string, lineSeparator: string = '\n', columnSeparator: string = '\t'): Promise<void> {
    return this.db.firestore.runTransaction(transaction => {
      const errors = [];
      data.split(lineSeparator).forEach((line, index) => {
        const payment = this.parseSchedule(line, columnSeparator);
        if (payment) {
          try {
            this.addInTransaction(payment, billUid, transaction);
          } catch (error) {
            return Promise.reject(error);
          }
        } else {
          errors.push(`Nie można zaimportować wiersza (${index + 1}): ${line}`);
        }
      });
      if (errors.length) { return Promise.reject(errors); }
      return Promise.resolve();
    });
  }

  private parseSchedule(text: string, columnSeparator: string = '\t'): Schedule {
    const cells = text.split(columnSeparator);
    const date: Timestamp = stringToTimestamp(cells[0]);
    const sum: number = currencyToNumber(cells[1]);
    const remarks: string = cells[2];
    const schedule: Schedule = {
      date: date,
      sum: sum
    };
    if (remarks) { schedule.remarks = remarks; }
    return (date && sum !== undefined) ? schedule : undefined;
  }

}
