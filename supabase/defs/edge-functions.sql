-- Ensure pg_cron is available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Optional: create the function that the cron job will call
-- Replace the body with your real reminder logic.
CREATE OR REPLACE FUNCTION public.bills_reminder_daily()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- TODO: implement your daily bills reminder logic here
  -- Example:
  -- PERFORM public.send_bills_reminders();
  RAISE NOTICE 'Running bills_reminder_daily()';
END;
$$;

-- If the job already exists, unschedule it first (prevents duplicate jobs)
SELECT cron.unschedule('bills-reminder-daily');

-- Schedule the job to run daily at 09:00
SELECT cron.schedule(
  'bills-reminder-daily',
  '0 9 * * *',
  'SELECT public.bills_reminder_daily();'
);

-- Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function the cron job will execute
-- Replace the body with your real report-generation code.
CREATE OR REPLACE FUNCTION public.monthly_bills_payments_report()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- TODO: implement your monthly bills payments report logic here
  -- Example:
  -- PERFORM public.generate_monthly_bills_payments_report();
  RAISE NOTICE 'Running monthly_bills_payments_report()';
END;
$$;

-- Prevent duplicates (unschedule if it already exists)
SELECT cron.unschedule('monthly-bills-payments-report');

-- Schedule monthly: 09:00 on day 1 of every month
SELECT cron.schedule(
  'monthly-bills-payments-report',
  '0 9 1 * *',
  'SELECT public.monthly_bills_payments_report();'
);

