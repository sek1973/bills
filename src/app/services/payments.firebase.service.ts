import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { Observable, of } from 'rxjs';

import { currencyToNumber, dateToTimestamp, stringToTimestamp } from '../helpers';
import { Bill } from '../model/bill';
import { Payment } from '../model/payment';

import Timestamp = firestore.Timestamp;
@Injectable({
  providedIn: 'root',
})
export class PaymentsFirebaseService {

  constructor(public db: AngularFirestore) { }

  fetch(uid: string): Observable<Payment[]> {
    if (uid !== undefined) {
      const query = this.db.collection<Bill>('bills').doc(uid).collection<Payment>('payments');
      return query.valueChanges({ idField: 'uid' });
    }
    return of([]);
  }

  createPaymentData(payment: any): Payment {
    const result: Payment = {
      deadline: dateToTimestamp(payment.deadline || new Date()),
      paiddate: dateToTimestamp(payment.paiddate) || undefined,
      sum: payment.sum,
      share: payment.share,
      remarks: payment.remarks || ''
    };
    if (payment.uid) { result.uid = payment.uid; }
    return result;
  }

  addInTransaction(payment: Payment, billUid: string, transaction: firestore.Transaction): firestore.Transaction {
    const ref = this.db.firestore.collection('bills').doc(billUid).collection('payments').doc();
    return transaction.set(ref, payment);
  }

  add(payment: Payment, billUid: string): Promise<firestore.DocumentReference> {
    return this.db.collection('bills').doc(billUid).collection('payments').add(this.createPaymentData(payment));
  }

  update(payment: Payment, billUid: string): Promise<void> {
    return this.db.collection('bills').doc(billUid).collection('payments').doc(payment.uid).set(this.createPaymentData(payment));
  }

  delete(payment: Payment, billUid: string): Promise<void> {
    return this.db.collection('bills').doc(billUid).collection('payments').doc(payment.uid).delete();
  }

  importPayments(data: string, billUid: string, lineSeparator: string = '\n', columnSeparator: string = '\t'): Promise<void> {
    return this.db.firestore.runTransaction(transaction => {
      const errors = [];
      data.split(lineSeparator).forEach((line, index) => {
        const payment = this.parsePayment(line, columnSeparator);
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

  private parsePayment(text: string, columnSeparator: string = '\t'): Payment {
    const cells = text.split(columnSeparator);
    const deadline: Timestamp = stringToTimestamp(cells[0]);
    const paiddate: Timestamp = stringToTimestamp(cells[1]);
    const sum: number = currencyToNumber(cells[2]);
    const share: number = currencyToNumber(cells[3]);
    const remarks: string = cells[4];
    const payment: Payment = {
      deadline: deadline,
      paiddate: paiddate,
      sum: sum,
      share: share
    };
    if (remarks) { payment.remarks = remarks; }
    return (deadline && paiddate && sum !== undefined && share !== undefined) ? payment : undefined;
  }

}
