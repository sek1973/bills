import { createClient } from "npm:@supabase/supabase-js@2.32.0";

interface Body { token?: string; password?: string }

// Edge Function entrypoint
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });

  let body: Body = {} as Body;
  try {
    body = await req.json();
  } catch (err) {
    // ignore invalid JSON; we'll attempt to read from headers
  }

  // Try to extract token from Authorization header if present
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  let tokenFromHeader: string | undefined;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    tokenFromHeader = authHeader.slice(7).trim();
  }

  const token = body?.token || tokenFromHeader;
  const password = body?.password;

  if (!token || !password) {
    return new Response(JSON.stringify({ error: 'token and password are required (token can be passed in JSON body as `token` or as Authorization: Bearer <token>)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Create a supabase client using the anon key (safe here because we use the provided token when updating)
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { 'x-client-info': 'edge-function-token-reset' } } });

  try {
    // Call updateUser passing the recovery token as the accessToken
    const { data, error } = await supabase.auth.updateUser({ password }, { accessToken: token });
    if (error) {
      return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'unexpected_error', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});