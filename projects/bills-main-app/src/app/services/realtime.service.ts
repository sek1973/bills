import { inject, Injectable } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeService } from 'projects/model/src/public-api';
import { Subject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class RealtimeServiceImpl extends RealtimeService {

  private supabase: SupabaseService = inject(SupabaseService);

  private billsChangesSubject = new Subject<number>();
  private paymentsChangesSubject = new Subject<number>();

  readonly billsChanges$ = this.billsChangesSubject.asObservable();
  readonly paymentsChanges$ = this.paymentsChangesSubject.asObservable();

  private billsChannel: RealtimeChannel | null = null;
  private paymentsChannel: RealtimeChannel | null = null;

  constructor() {
    super();
    const client = this.supabase.client;

    client.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        await client.realtime.setAuth();
        this.initChannels();
      }
    });

    this.supabase.authEvents$.subscribe(async ({ session }) => {
      if (session) {
        await client.realtime.setAuth();
        this.initChannels();
      } else {
        this.removeChannels();
      }
    });

    // After a network outage the existing WebSocket channels are dead.
    // Tear them down and rebuild so realtime events flow again.
    this.supabase.connectivityRestored$.subscribe(() => {
      this.removeChannels();
      client.realtime.setAuth().then(() => this.initChannels());
    });
  }

  private initChannels(): void {
    if (this.billsChannel && this.paymentsChannel) return;

    const client = this.supabase.client;

    if (!this.billsChannel) {
      this.billsChannel = client
        .channel('bills:changes', { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          const billId = payload?.record?.id;
          if (billId != null) this.billsChangesSubject.next(billId);
        })
        .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          const billId = payload?.record?.id ?? payload?.old_record?.id;
          if (billId != null) this.billsChangesSubject.next(billId);
        })
        .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          const billId = payload?.old_record?.id ?? payload?.record?.id;
          if (billId != null) this.billsChangesSubject.next(billId);
        })
        .subscribe();
    }

    if (!this.paymentsChannel) {
      this.paymentsChannel = client
        .channel('payments:changes', { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          const billId = payload?.record?.bill_id;
          const paymentId = payload?.record?.id;
          if (billId != null) this.paymentsChangesSubject.next(billId);
          if (paymentId != null) this.paymentsChangesSubject.next(paymentId);
        })
        .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          const billId = payload?.record?.bill_id ?? payload?.old_record?.bill_id;
          const paymentId = payload?.record?.id ?? payload?.old_record?.id;
          if (billId != null) this.paymentsChangesSubject.next(billId);
          if (paymentId != null) this.paymentsChangesSubject.next(paymentId);
        })
        .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          const billId = payload?.old_record?.bill_id ?? payload?.record?.bill_id;
          const paymentId = payload?.old_record?.id ?? payload?.record?.id;
          if (billId != null) this.paymentsChangesSubject.next(billId);
          if (paymentId != null) this.paymentsChangesSubject.next(paymentId);
        })
        .subscribe();
    }
  }

  private removeChannels(): void {
    const client = this.supabase.client;
    if (this.billsChannel) {
      client.removeChannel(this.billsChannel);
      this.billsChannel = null;
    }
    if (this.paymentsChannel) {
      client.removeChannel(this.paymentsChannel);
      this.paymentsChannel = null;
    }
  }

}
