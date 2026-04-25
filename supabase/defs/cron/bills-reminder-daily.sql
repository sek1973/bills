select net.http_post(
  url := 'https://lwkggrtpwnypcvnhizov.supabase.co/functions/v1/bills-reminder-email',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer sb_publishable_FQM_4lSTdWz14TL8rwuuxw_KUwR6iWZ',
    'apikey', 'sb_publishable_FQM_4lSTdWz14TL8rwuuxw_KUwR6iWZ'
  ),
  body :=(
  select jsonb_build_object(
    'reminderDate', current_date:: text,
    'dueBills', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'bill_id', b.id,
          'bill_name', b.name,
          'due_date', b.due_date,
          'sum', b.sum
        )
          order by b.id
      ),
      '[]':: jsonb
    )
  ):: jsonb
    from public.due_bills b
)
) as request_id;