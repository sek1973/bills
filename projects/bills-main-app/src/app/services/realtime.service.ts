import { inject, Injectable } from '@angular/core';
import { Bill, Payment, RealtimeBillEvent, RealtimePaymentEvent, RealtimeService } from '@bills/model';
import { REALTIME_CHANNEL_STATES, RealtimeChannel } from '@supabase/supabase-js';
import moment from 'moment';
import { Subject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class RealtimeServiceImpl extends RealtimeService {

  private supabase: SupabaseService = inject(SupabaseService);

  private billsChangesSubject = new Subject<RealtimeBillEvent>();
  private paymentsChangesSubject = new Subject<RealtimePaymentEvent>();

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

    // On every auth event: skip teardown when channels are already healthy
    // (routine TOKEN_REFRESHED), but rebuild after an outage where refs are
    // non-null yet the state is 'errored' or 'closed'.
    this.supabase.authEvents$.subscribe(async ({ session }) => {
      const healthy =
        this.billsChannel?.state === REALTIME_CHANNEL_STATES.joined &&
        this.paymentsChannel?.state === REALTIME_CHANNEL_STATES.joined;
      if (!healthy) this.removeChannels();
      if (session && !healthy) {
        await client.realtime.setAuth();
        this.initChannels();
      }
      if (!session) this.removeChannels();
    });
  }

  private initChannels(): void {
    if (this.billsChannel && this.paymentsChannel) return;

    const client = this.supabase.client;

    if (!this.billsChannel) {
      this.billsChannel = client
        .channel('bills:changes', { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          const r = payload?.record;
          if (r?.id == null) return;
          this.billsChangesSubject.next({ type: 'INSERT', billId: r.id, bill: this.mapBill(r) });
        })
        .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          const r = payload?.record ?? payload?.old_record;
          if (r?.id == null) return;
          const bill = payload?.record ? this.mapBill(payload.record) : undefined;
          this.billsChangesSubject.next({ type: 'UPDATE', billId: r.id, bill });
        })
        .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          const billId = payload?.old_record?.id ?? payload?.record?.id;
          if (billId != null) this.billsChangesSubject.next({ type: 'DELETE', billId });
        })
        .subscribe();
    }

    if (!this.paymentsChannel) {
      this.paymentsChannel = client
        .channel('payments:changes', { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          const r = payload?.record;
          if (r?.id == null || r?.bill_id == null) return;
          this.paymentsChangesSubject.next({ type: 'INSERT', paymentId: r.id, billId: r.bill_id, payment: this.mapPayment(r) });
        })
        .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          const r = payload?.record ?? payload?.old_record;
          if (r?.id == null || r?.bill_id == null) return;
          const payment = payload?.record ? this.mapPayment(payload.record) : undefined;
          this.paymentsChangesSubject.next({ type: 'UPDATE', paymentId: r.id, billId: r.bill_id, payment });
        })
        .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          const r = payload?.old_record ?? payload?.record;
          if (r?.id == null || r?.bill_id == null) return;
          this.paymentsChangesSubject.next({ type: 'DELETE', paymentId: r.id, billId: r.bill_id });
        })
        .subscribe();
    }
  }

  private mapBill(r: any): Bill | undefined {
    if (r?.id == null) return undefined;
    return new Bill(
      r.position ?? undefined,
      r.name ?? '',
      r.description ?? undefined,
      r.active ?? true,
      r.url ?? undefined,
      r.login ?? undefined,
      r.account ?? undefined,
      r.default_sum ?? 0,
      r.repeat ?? 1,
      r.unit ?? 2,
      r.id,
    );
  }

  private mapPayment(r: any): Payment | undefined {
    if (r?.id == null || r?.bill_id == null) return undefined;
    return new Payment(
      r.deadline ? moment(r.deadline).toDate() : new Date(),
      r.sum ?? 0,
      r.paid_date ? moment(r.paid_date).toDate() : undefined,
      r.remarks ?? undefined,
      r.reminder ? moment(r.reminder).toDate() : undefined,
      r.bill_id,
      r.id,
    );
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
