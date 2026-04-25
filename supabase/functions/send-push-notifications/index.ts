import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const EMAIL_ADDR = Deno.env.get("EMAIL_ADDR")!;
const APP_LOGIN_URL =
  Deno.env.get("APP_LOGIN_URL") ?? "https://bills-umber.vercel.app";

type DueBill = {
  bill_id: number;
  bill_name: string | null;
  due_date: string;
  sum: number;
};

type RequestBody = {
  reminderDate: string;
  dueBills: DueBill[];
};

Deno.serve(async (req: Request) => {
  console.log("[send-push-notifications] start", {
    method: req.method,
    url: req.url,
  });

  try {
    if (req.method !== "POST") {
      console.warn("[send-push-notifications] wrong method", {
        method: req.method,
      });
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { reminderDate, dueBills = [] } = body;

    console.debug("[send-push-notifications] request body received", {
      reminderDate,
      dueBills_count: dueBills.length,
    });

    if (!reminderDate || dueBills.length === 0) {
      console.info("[send-push-notifications] no due bills to notify", {
        reminderDate,
        dueBills_len: dueBills.length,
      });
      return new Response(
        JSON.stringify({ ok: true, sent: 0, failed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
    console.info("[send-push-notifications] db url presence", {
      SUPABASE_DB_URL_set: !!dbUrl,
    });

    const sql = postgres(dbUrl);

    console.log("[send-push-notifications] fetching push subscriptions...");
    const subs = await sql<
      { user_id: string; endpoint: string; p256dh: string; auth: string }[]
    >`
      SELECT user_id, endpoint, p256dh, auth
      FROM public.push_subscriptions
    `;

    console.info("[send-push-notifications] subscriptions found", {
      count: subs.length,
    });

    if (subs.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, failed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    webpush.setVapidDetails(
      `mailto:${EMAIL_ADDR}`,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
    );

    const billCount = dueBills.length;
    const title = `Rachunki do zapłacenia – ${reminderDate}`;
    const pluralizeBills = (n: number): string => {
      const lastTwo = n % 100;
      const lastOne = n % 10;
      if (lastTwo >= 12 && lastTwo <= 14) return "rachunków";
      if (lastOne >= 2 && lastOne <= 4) return "rachunki";
      return "rachunków";
    };
    const bodyText =
      billCount === 1
        ? `${dueBills[0].bill_name ?? "Rachunek"} – ${dueBills[0].sum}`
        : `${billCount} ${pluralizeBills(billCount)} do zapłacenia`;

    const notification = JSON.stringify({
      title,
      body: bodyText,
      url: APP_LOGIN_URL,
      tag: "bills-reminder",
    });

    console.log("[send-push-notifications] sending push notifications...", {
      subscriptions: subs.length,
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notification,
        )
      ),
    );

    // Remove stale subscriptions (HTTP 410 Gone)
    const staleEndpoints = results
      .map((r, i) => ({ r, endpoint: subs[i].endpoint }))
      .filter(
        ({ r }) =>
          r.status === "rejected" &&
          (r as PromiseRejectedResult).reason?.statusCode === 410,
      )
      .map(({ endpoint }) => endpoint);

    if (staleEndpoints.length > 0) {
      console.info("[send-push-notifications] removing stale subscriptions", {
        count: staleEndpoints.length,
      });
      await sql`
        DELETE FROM public.push_subscriptions
        WHERE endpoint = ANY(${staleEndpoints})
      `;
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    console.info("[send-push-notifications] done", { sent, failed });

    return new Response(JSON.stringify({ ok: true, sent, failed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-push-notifications] error", e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
