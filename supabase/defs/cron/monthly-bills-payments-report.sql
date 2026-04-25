select net.http_post(
  url := 'https://lwkggrtpwnypcvnhizov.supabase.co/functions/v1/monthly-bills-payments-report',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer sb_publishable_FQM_4lSTdWz14TL8rwuuxw_KUwR6iWZ',
    'apikey', 'sb_publishable_FQM_4lSTdWz14TL8rwuuxw_KUwR6iWZ'
  ),
  body := '{}'::jsonb
) as request_id;