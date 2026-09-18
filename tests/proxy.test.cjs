const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const load = () => import(`data:text/javascript;base64,${fs.readFileSync('functions/api/[[path]].js').toString('base64')}`);

test('Pages proxy preserves session cookies and replaces spoofed trust headers', async () => {
  const { onRequest } = await load();
  const originalFetch = global.fetch;
  let received;
  global.fetch = async (url, options) => {
    received = { url: String(url), options };
    return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'jid=demo; HttpOnly; Secure; SameSite=Lax; Path=/api/auth' } });
  };
  try {
    const response = await onRequest({ env: { API_ORIGIN: 'https://vaxx-api.onrender.com', DEMO_PROXY_SECRET: 'server-secret' }, request: new Request('https://vaxx-app-demo.pages.dev/api/auth/refresh_token', { method: 'POST', body: '{}', headers: {
      Origin: 'https://vaxx-app-demo.pages.dev', Cookie: 'jid=demo', Authorization: 'Bearer demo',
      'CF-Connecting-IP': '192.0.2.1', 'X-Demo-Client-IP': 'forged', 'X-Demo-Proxy-Secret': 'forged',
    } }) });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure/);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(received.url, 'https://vaxx-api.onrender.com/api/auth/refresh_token');
    assert.equal(received.options.headers.get('X-Demo-Client-IP'), '192.0.2.1');
    assert.equal(received.options.headers.get('X-Demo-Proxy-Secret'), 'server-secret');
    assert.equal(received.options.headers.get('Cookie'), 'jid=demo');
    assert.equal(received.options.redirect, 'manual');
  } finally { global.fetch = originalFetch; }
});

test('Pages proxy fails closed on missing config, foreign origins, and oversized requests', async () => {
  const { onRequest } = await load();
  const env = { API_ORIGIN: 'https://vaxx-api.onrender.com', DEMO_PROXY_SECRET: 'server-secret' };
  assert.equal((await onRequest({env:{},request:new Request('https://demo.pages.dev/api/events')})).status,503);
  assert.equal((await onRequest({env,request:new Request('https://demo.pages.dev/api/demo/session',{method:'POST',headers:{Origin:'https://other.example'}})})).status,403);
  assert.equal((await onRequest({env,request:new Request('https://demo.pages.dev/api/demo/session',{method:'POST',headers:{Origin:'https://demo.pages.dev','Content-Length':'17000'}})})).status,413);
  assert.equal((await onRequest({env:{...env,API_ORIGIN:'http://localhost:5000'},request:new Request('https://demo.pages.dev/api/events')})).status,503);
});
