import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.13";

const EMAIL_ADDR = Deno.env.get("EMAIL_ADDR");
const FROM_NAME = "Bills backup";

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
const SMTP_SECURE = Deno.env.get("SMTP_SECURE") === "true";

const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");

function escapeCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[\n\r\",]/.test(s)) {
    return '"' + s.replaceAll('"', '""') + '"';
  }
  return s;
}

Deno.serve(async (req: Request) => {
  console.log("[monthly-bills-payments-report] start", {
    method: req.method,
    url: req.url,
  });

  let sql: any = null;
  let transporter: any = null;

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    console.info("[monthly-bills-payments-report] smtp config presence", {
      SMTP_USER_set: !!SMTP_USER,
      SMTP_PASS_set: !!SMTP_PASS,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
    });

    if (!SMTP_USER || !SMTP_PASS) {
      return new Response("Missing SMTP_USER or SMTP_PASS", { status: 500 });
    }

    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing SUPABASE_DB_URL" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    sql = postgres(dbUrl);

    const billsForCsv = await sql/*sql*/`
      select *
      from public.bills
    `;

    const paymentsForCsv = await sql/*sql*/`
      select *
      from public.payments
    `;

    console.log("[monthly-bills-payments-report] building html and csv...");

    const html = `
      <div style="font-family: Arial, sans-serif;">
        Bills and payments backup.
      </div>
    `;

    const subject = `Bills and payments backup`;

    const billsRows = Array.isArray(billsForCsv) ? billsForCsv : [];
    const paymentsRows = Array.isArray(paymentsForCsv) ? paymentsForCsv : [];

    const billsCsvHeader = billsRows.length ? Object.keys(billsRows[0]) : [];
    const billsCsv = billsRows.length
      ? [
        billsCsvHeader.join(","),
        ...billsRows.map((r: any) => billsCsvHeader.map((h: string) => escapeCsvValue(r[h])).join(",")),
      ].join("\n")
      : "";

    const paymentsCsvHeader = paymentsRows.length ? Object.keys(paymentsRows[0]) : [];
    const paymentsCsv = paymentsRows.length
      ? [
        paymentsCsvHeader.join(","),
        ...paymentsRows.map((r: any) => paymentsCsvHeader.map((h: string) => escapeCsvValue(r[h])).join(",")),
      ].join("\n")
      : "";

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      logger: true,
      debug: true,
    });

    const timestamp = new Date().toISOString().replaceAll(':', '-');

    const mailInfo = await transporter.sendMail({
      from: `${FROM_NAME} <${EMAIL_ADDR}>`,
      to: EMAIL_ADDR,
      subject,
      html,
      attachments: [
        {
          filename: `bills-${timestamp}.csv`,
          content: billsCsv,
          contentType: "text/csv; charset=utf-8",
        },
        {
          filename: `payments-${timestamp}.csv`,
          content: paymentsCsv,
          contentType: "text/csv; charset=utf-8",
        },
      ],
    });

    return new Response(
      JSON.stringify({ ok: true, messageId: mailInfo?.messageId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error('[monthly-bills-payments-report] error', e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    try {
      if (sql && typeof sql.end === "function") {
        await sql.end();
      }
    } catch (closeErr) {
      console.warn("[monthly-bills-payments-report] failed to close sql client", closeErr);
    }

    try {
      if (transporter && typeof transporter.close === "function") {
        transporter.close();
      }
    } catch (tCloseErr) {
      console.warn("[monthly-bills-payments-report] failed to close transporter", tCloseErr);
    }
  }
});
