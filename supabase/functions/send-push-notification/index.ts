import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  // Verify caller is authenticated
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  let payload: { user_id: string; title: string; body?: string; url?: string; tag?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
  }

  const { user_id, title, body, url, tag } = payload;
  if (!user_id || !title) {
    return new Response(JSON.stringify({ error: 'user_id and title are required' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: subs, error: fetchError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user_id);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: corsHeaders });
  }

  const notification = JSON.stringify({ title, body: body ?? '', url: url ?? '/', tag: tag ?? 'bills-notification' });

  webpush.setVapidDetails('mailto:bills@app.local', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const results = await Promise.allSettled(
    (subs ?? []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notification,
      ),
    ),
  );

  // Remove stale subscriptions (HTTP 410 Gone)
  const staleEndpoints = results
    .map((r, i) => ({ r, endpoint: subs![i].endpoint }))
    .filter(({ r }) => r.status === 'rejected' && (r as PromiseRejectedResult).reason?.statusCode === 410)
    .map(({ endpoint }) => endpoint);

  if (staleEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
