import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.13";

type DueBill = {
  bill_id: number;
  bill_name: string | null;
  due_date: string; // ISO date
  sum: number;
};

type RequestBody = {
  reminderDate: string;
  dueBills: DueBill[];
};

const FROM_EMAIL = Deno.env.get("BILLS_FROM_EMAIL");

const FROM_NAME =
  Deno.env.get("BILLS_FROM_NAME") ??
  "Rachunki - notyfikacje";

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
const SMTP_SECURE = Deno.env.get("SMTP_SECURE") === "true";

const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");

const APP_LOGIN_URL =
  Deno.env.get("APP_LOGIN_URL") ??
  "https://bills-umber.vercel.app";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

Deno.serve(async (req: Request) => {
  console.log("[bills-reminder-email] start", {
    method: req.method,
    url: req.url,
  });

  try {
    if (req.method !== "POST") {
      console.warn("[bills-reminder-email] wrong method", { method: req.method });
      return new Response("Method Not Allowed", { status: 405 });
    }

    console.info("[bills-reminder-email] smtp config presence", {
      SMTP_USER_set: !!SMTP_USER,
      SMTP_PASS_set: !!SMTP_PASS,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
    });

    if (!SMTP_USER || !SMTP_PASS) {
      console.error("[bills-reminder-email] missing smtp env vars");
      return new Response("Missing SMTP_USER or SMTP_PASS", { status: 500 });
    }

    const body = (await req.json()) as RequestBody;
    console.debug?.("[bills-reminder-email] request body received", {
      reminderDate: body?.reminderDate,
      dueBills_count: Array.isArray(body?.dueBills) ? body.dueBills.length : null,
      // Don't log full dueBills if it could include sensitive content
      // dueBills: body?.dueBills
    });

    const reminderDate = body.reminderDate;
    const dueBills = body.dueBills ?? [];

    if (!reminderDate || !Array.isArray(dueBills) || dueBills.length === 0) {
      console.info("[bills-reminder-email] no due bills to send", {
        reminderDate,
        dueBills_len: dueBills.length,
      });
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    console.info("[bills-reminder-email] db url presence", {
      SUPABASE_DB_URL_set: !!dbUrl,
    });

    const sql = postgres(dbUrl!);

    console.log("[bills-reminder-email] fetching editor emails...");
    const editorEmails = await sql/*sql*/`
      select distinct u.email as email
      from public.role_members rm
      join public.app_roles r on r.id = rm.role_id
      join auth.users u on u.id = rm.user_id
      where r.name = 'editor'
        and u.email is not null
        and u.email like '%@%'
        and u.email <> ''
    `;

    const emails = (editorEmails as any[]).map((r) => r.email).filter(Boolean);
    const uniqueEmails = Array.from(new Set(emails));

    console.info("[bills-reminder-email] editor emails resolved", {
      totalEmails: emails.length,
      uniqueEmails: uniqueEmails.length,
    });

    if (uniqueEmails.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, reason: "No editor emails found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[bills-reminder-email] building email html...");
    const rowsHtml = dueBills
      .map((b) => {
        const id = String(b.bill_id);
        const name = escapeHtml(b.bill_name ?? id);
        const dl = escapeHtml(b.due_date ?? "");
        const sum = (b.sum ?? 0);
        return `<tr>
        <td style="padding:8px 12px;border:1px solid #eee;">${name}</td>
        <td style="padding:8px 12px;border:1px solid #eee;">${dl}</td>
        <td style="padding:8px 12px;border:1px solid #eee;">${sum}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="margin: 0 0 12px;">Rachunki do zapłacenia na ${escapeHtml(reminderDate)}</h2>
        <p style="margin: 0 0 16px; color:#444;">Automatyczne przypomnienie z bazy danych.</p>
        <p style="margin: 0 0 16px; color:#444;">
      Aby zobaczyć szczegóły i rachunki, przejdź na stronę logowania:
    </p>
    <p style="margin: 0 0 20px;">
      <a href="${escapeHtml(APP_LOGIN_URL)}"
         style="display:inline-block;background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;">
        Zaloguj się
      </a>
    </p>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding:8px 12px;border:1px solid #eee;background:#fafafa;text-align:left;">Rachunek</th>
              <th style="padding:8px 12px;border:1px solid #eee;background:#fafafa;text-align:left;">Do</th>
              <th style="padding:8px 12px;border:1px solid #eee;background:#fafafa;text-align:left;">Kwota</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    const subject = `Rachunki do zapłacenia na dzień ${reminderDate}`;

    console.log("[bills-reminder-email] creating nodemailer transporter...");
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      // Optional but very helpful:
      logger: true,
      debug: true,
    });

    console.log("[bills-reminder-email] sending email...", {
      to_count: uniqueEmails.length,
      subject,
    });

    const mailInfo = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: uniqueEmails,
      subject,
      html,
    });

    console.info("[bills-reminder-email] send success", {
      messageId: mailInfo?.messageId,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        sent: uniqueEmails.length,
        messageId: mailInfo?.messageId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[bills-reminder-email] error", e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});