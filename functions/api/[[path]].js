// Cloudflare Pages: only /api/* invokes this function. Static browsing is free of API calls.
export async function onRequest({ request, env }) {
  const json = (status, error) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!env.API_ORIGIN || !env.DEMO_PROXY_SECRET) return json(503, 'The live demo is not configured. The sample remains available.');
  const incoming = new URL(request.url);
  const backend = new URL(env.API_ORIGIN);
  if (backend.protocol !== 'https:' || !backend.hostname.endsWith('.onrender.com') || backend.username || backend.password || backend.pathname !== '/') return json(503, 'Invalid demo API configuration.');
  if (!['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'].includes(request.method)) return json(405, 'Method not allowed');
  if (Number(request.headers.get('Content-Length') || 0) > 16384) return json(413, 'Request is too large');
  if (!['GET', 'OPTIONS'].includes(request.method) && request.headers.get('Origin') !== incoming.origin) return json(403, 'Invalid request origin');
  backend.pathname = incoming.pathname;
  backend.search = incoming.search;
  const headers = new Headers();
  for (const name of ['Accept', 'Content-Type', 'Authorization', 'Cookie', 'Origin']) {
    const value = request.headers.get(name); if (value) headers.set(name, value);
  }
  headers.set('X-Demo-Proxy-Secret', env.DEMO_PROXY_SECRET);
  headers.set('X-Demo-Client-IP', request.headers.get('CF-Connecting-IP') || 'unknown');
  try {
    const response = await fetch(backend, { method: request.method, headers,
      body: ['GET', 'OPTIONS'].includes(request.method) ? undefined : request.body,
      redirect: 'manual', signal: AbortSignal.timeout(85000) });
    const output = new Response(response.body, response);
    output.headers.set('Cache-Control', 'no-store');
    output.headers.set('X-Content-Type-Options', 'nosniff');
    return output;
  } catch { return json(503, 'The live demo is waking up or unavailable. Please retry shortly.'); }
}
