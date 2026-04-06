Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const method = req.method;
    const headers: Record<string, string> = {};
    for (const [k, v] of req.headers) headers[k] = v;
    let body: any = null;
    try { body = await req.json(); } catch (e) { /* not json */ }
    const resp = {
      message: 'Public function reachable',
      method,
      headers_present: Object.keys(headers),
      headers,
      body,
      query: Object.fromEntries(url.searchParams.entries())
    };
    console.log('test');
    return new Response(JSON.stringify(resp), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});