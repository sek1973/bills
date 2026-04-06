select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema in ('public','extensions','private','storage','vault','graphql','graphql_public')
  and table_type in ('BASE TABLE','VIEW')
order by table_schema, table_type, table_name;

select
  n.nspname as schema,
  c.relname as name,
  c.relkind
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname not in ('pg_catalog','information_schema')
  and c.relkind in ('m','f','p') -- matview, foreign table, partitioned table
order by 1,2;

select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname not in ('pg_catalog','information_schema')
order by 1,2;

select
  schemaname,
  tablename
from pg_catalog.pg_tables t
join pg_catalog.pg_class c
  on c.relname = t.tablename
join pg_catalog.pg_namespace n
  on n.oid = c.relnamespace
where n.nspname in ('public')
and c.relrowsecurity = true
order by 1,2;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
order by 1,2,3;

create or replace view extensions.pg_stat_statements as  SELECT userid,
    dbid,
    toplevel,
    queryid,
    query,
    plans,
    total_plan_time,
    min_plan_time,
    max_plan_time,
    mean_plan_time,
    stddev_plan_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    local_blks_hit,
    local_blks_read,
    local_blks_dirtied,
    local_blks_written,
    temp_blks_read,
    temp_blks_written,
    shared_blk_read_time,
    shared_blk_write_time,
    local_blk_read_time,
    local_blk_write_time,
    temp_blk_read_time,
    temp_blk_write_time,
    wal_records,
    wal_fpi,
    wal_bytes,
    jit_functions,
    jit_generation_time,
    jit_inlining_count,
    jit_inlining_time,
    jit_optimization_count,
    jit_optimization_time,
    jit_emission_count,
    jit_emission_time,
    jit_deform_count,
    jit_deform_time,
    stats_since,
    minmax_stats_since
   FROM pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, stats_since, minmax_stats_since);;

create or replace view extensions.pg_stat_statements_info as  SELECT dealloc,
    stats_reset
   FROM pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset);;

create or replace view public.bill_payments as  WITH due_candidates AS (
         SELECT p.bill_id,
            p.deadline AS due_date,
            p.sum
           FROM payments p
          WHERE p.paid_date IS NULL
        ), ranked AS (
         SELECT due_candidates.bill_id,
            due_candidates.due_date,
            due_candidates.sum,
            row_number() OVER (PARTITION BY due_candidates.bill_id ORDER BY due_candidates.due_date) AS rn
           FROM due_candidates
        )
 SELECT bill_id,
    due_date,
    sum
   FROM ranked
  WHERE rn = 1;;

create or replace view public.bills_overview as  SELECT b.id,
    b."position",
    b.name,
    b.description,
    b.active,
    b.url,
    b.login,
    s.due_date,
    s.sum
   FROM bills b
     LEFT JOIN bill_payments s ON b.id = s.bill_id
  ORDER BY s.due_date, b."position";;

create or replace view public.due_bill_payments as  WITH due_candidates AS (
         SELECT p.bill_id,
                CASE
                    WHEN p.reminder IS NOT NULL THEN p.reminder
                    ELSE p.deadline
                END AS due_date,
            p.sum
           FROM payments p
          WHERE p.paid_date IS NULL AND (p.reminder IS NOT NULL AND p.reminder <= CURRENT_DATE OR p.reminder IS NULL AND p.deadline <= (CURRENT_DATE + '7 days'::interval))
        ), ranked AS (
         SELECT due_candidates.bill_id,
            due_candidates.due_date,
            due_candidates.sum,
            row_number() OVER (PARTITION BY due_candidates.bill_id ORDER BY due_candidates.due_date) AS rn
           FROM due_candidates
        )
 SELECT bill_id,
    due_date,
    sum
   FROM ranked
  WHERE rn = 1;;

create or replace view public.due_bills as  SELECT b.id,
    b."position",
    b.name,
    b.active,
    s.due_date,
    s.sum
   FROM due_bill_payments s
     JOIN bills b ON b.id = s.bill_id
  WHERE b.active = true
  ORDER BY s.due_date DESC, b."position";;

create or replace view public.payments_overview as  SELECT id,
    created_at,
    bill_id,
    deadline,
    sum,
    paid_date,
    remarks,
    reminder
   FROM payments p
  ORDER BY (paid_date IS NOT NULL), (
        CASE
            WHEN paid_date IS NULL THEN deadline
            ELSE NULL::date
        END), (
        CASE
            WHEN paid_date IS NOT NULL THEN paid_date
            ELSE NULL::date
        END), (
        CASE
            WHEN paid_date IS NOT NULL THEN deadline
            ELSE NULL::date
        END) DESC;;

create or replace view vault.decrypted_secrets as  SELECT id,
    name,
    description,
    secret,
    convert_from(vault._crypto_aead_det_decrypt(message => decode(secret, 'base64'::text), additional => convert_to(id::text, 'utf8'::name), key_id => 0::bigint, context => '\x7067736f6469756d'::bytea, nonce => nonce), 'utf8'::name) AS decrypted_secret,
    key_id,
    nonce,
    created_at,
    updated_at
   FROM vault.secrets s;;

create policy cron_job_policy on cron.job for ALL to public' using ((username = CURRENT_USER))'NULL;

create policy cron_job_run_details_policy on cron.job_run_details for ALL to public' using ((username = CURRENT_USER))'NULL;

create policy app_roles_delete_by_role on public.app_roles for DELETE to authenticated' using (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'NULL;

create policy app_roles_insert_by_role on public.app_roles for INSERT to authenticatedNULL' with check (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))';

create policy app_roles_select_by_role on public.app_roles for SELECT to anon, authenticated' using (true)'NULL;

create policy app_roles_update_by_role on public.app_roles for UPDATE to authenticated' using (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'' with check (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'

create policy bills_delete_by_role on public.bills for DELETE to authenticated' using (( SELECT private.user_has_permission(''can_delete''::text) AS user_has_permission))'NULL

create policy bills_insert_by_role on public.bills for INSERT to authenticatedNULL' with check (( SELECT private.user_has_permission(''can_insert''::text) AS user_has_permission))'

create policy bills_select_by_role on public.bills for SELECT to authenticated' using (( SELECT private.user_has_permission(''can_read''::text) AS user_has_permission))'NULL

create policy bills_update_by_role on public.bills for UPDATE to authenticated' using (( SELECT private.user_has_permission(''can_update''::text) AS user_has_permission))'' with check (( SELECT private.user_has_permission(''can_update''::text) AS user_has_permission))'

create policy payments_delete_by_role on public.payments for DELETE to authenticated' using (( SELECT private.user_has_permission(''can_delete''::text) AS user_has_permission))'NULL

create policy payments_insert_by_role on public.payments for INSERT to authenticatedNULL' with check (( SELECT private.user_has_permission(''can_insert''::text) AS user_has_permission))'

create policy payments_select_by_role on public.payments for SELECT to authenticated' using (( SELECT private.user_has_permission(''can_read''::text) AS user_has_permission))'NULL

create policy payments_update_by_role on public.payments for UPDATE to authenticated' using (( SELECT private.user_has_permission(''can_update''::text) AS user_has_permission))'' with check (( SELECT private.user_has_permission(''can_update''::text) AS user_has_permission))'

create policy role_members_delete_by_role on public.role_members for DELETE to authenticated' using (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'NULL

create policy role_members_insert_by_role on public.role_members for INSERT to authenticatedNULL' with check (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'

create policy role_members_select_by_role on public.role_members for SELECT to authenticated' using (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission)))'NULL

create policy role_members_update_by_role on public.role_members for UPDATE to authenticated' using (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'' with check (( SELECT private.user_has_permission(''is_admin''::text) AS user_has_permission))'

create table public.app_roles (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  can_read boolean not null default false,
  can_insert boolean not null default false,
  can_update boolean not null default false,
  can_delete boolean not null default false,
  is_admin boolean not null default false,
  constraint app_roles_pkey primary key (id),
  constraint app_roles_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_app_roles_permissions on public.app_roles using btree (can_read, can_insert, can_update, can_delete) TABLESPACE pg_default;

create table public.bills (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone null default now(),
  position integer not null,
  name text not null default 'Nowy rachunek'::text,
  description text null,
  active boolean null default true,
  url text null,
  login text null,
  sum numeric(10, 2) null default 0,
  repeat integer null default 1,
  unit smallint null default 1,
  owner_id uuid null,
  account text null,
  constraint bills_pkey primary key (id),
  constraint bills_owner_id_fkey foreign KEY (owner_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_bills_owner_id on public.bills using btree (owner_id) TABLESPACE pg_default;

create index IF not exists idx_bills_position on public.bills using btree ("position") TABLESPACE pg_default;

create unique INDEX IF not exists uq_bills_lp on public.bills using btree ("position") TABLESPACE pg_default;

create trigger bills_set_default_position BEFORE INSERT on bills for EACH row when (new."position" is null)
execute FUNCTION set_position_before_insert ();

create table public.bills (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone null default now(),
  position integer not null,
  name text not null default 'Nowy rachunek'::text,
  description text null,
  active boolean null default true,
  url text null,
  login text null,
  sum numeric(10, 2) null default 0,
  repeat integer null default 1,
  unit smallint null default 1,
  owner_id uuid null,
  account text null,
  constraint bills_pkey primary key (id),
  constraint bills_owner_id_fkey foreign KEY (owner_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_bills_owner_id on public.bills using btree (owner_id) TABLESPACE pg_default;

create index IF not exists idx_bills_position on public.bills using btree ("position") TABLESPACE pg_default;

create unique INDEX IF not exists uq_bills_lp on public.bills using btree ("position") TABLESPACE pg_default;

create trigger bills_set_default_position BEFORE INSERT on bills for EACH row when (new."position" is null)
execute FUNCTION set_position_before_insert ();

create table public.role_members (
  role_id uuid not null,
  user_id uuid not null,
  constraint role_members_pkey primary key (role_id, user_id),
  constraint role_members_role_id_fkey foreign KEY (role_id) references app_roles (id) on delete CASCADE,
  constraint role_members_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_role_members_user on public.role_members using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_role_members_role on public.role_members using btree (role_id) TABLESPACE pg_default;

create index IF not exists idx_role_members_user_role on public.role_members using btree (user_id, role_id) TABLESPACE pg_default;


