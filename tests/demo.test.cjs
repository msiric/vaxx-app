const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
require('dotenv').config();
process.env.DEMO_MODE = 'true';
const { connectDatabase, databaseOptions } = require('../dist/config/database');
const app = require('../dist/app').default;
const origin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5174';

test('demo API: real PostgreSQL transactions, isolation, expiry and revocation', async t => {
  const url = new URL(process.env.PG_DB_URL);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'Tests must use a disposable local database');
  assert.equal(url.pathname, '/vaxx_demo');
  const db = await connectDatabase();
  await db.runMigrations();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const users = [];
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    for (const id of users) await db.getRepository('User').delete({ id });
    await db.destroy();
  });
  async function call(path, { method = 'GET', token, body, cookie, requestOrigin = origin } = {}) {
    const response = await fetch(`${base}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(requestOrigin && { Origin: requestOrigin }),
        ...(token && { Authorization: `Bearer ${token}` }), ...(cookie && { Cookie: cookie }) },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie') };
  }
  async function session() {
    const response = await call('/api/demo/session', { method: 'POST', body: {} });
    assert.equal(response.status, 200, JSON.stringify(response.data));
    users.push(response.data.user.id);
    return { ...response.data, cookie: response.cookie.split(';')[0] };
  }
  const a = await session(); const b = await session();
  await t.test('fresh clinics are seeded independently and require authentication', async () => {
    assert.equal((await call('/api/events')).status, 401);
    const ar = await call('/api/events', { token: a.accessToken });
    const br = await call('/api/events', { token: b.accessToken });
    assert.equal(ar.status, 200); assert.equal(ar.data.events.length, 6);
    assert.equal(br.data.events.length, 6);
    assert.notEqual(ar.data.events[0].id, br.data.events[0].id);
    assert.equal((await call('/api/patients', { token: a.accessToken })).data.patients.length, 6);
    assert.equal((await call(`/api/events?userId=${b.user.id}`, { token: a.accessToken })).data.events[0].id, ar.data.events[0].id);
    assert.ok(!JSON.stringify(a.user).includes('password'));
  });
  const body = { patientName: 'Demo Test Patient', patientDOB: '1990-01-01', patientMBO: 'DEMO00099', patientVaxxed: 'first', patientVaccine: 'moderna', vaccineIdentifier: 'DEMO-TEST', patientDate: '2030-01-07T10:00:00.000Z', userId: b.user.id };
  let first, second;
  await t.test('booking creates patient and event atomically; collisions are rejected', async () => {
    const r = await call('/api/events', { method: 'POST', token: a.accessToken, body });
    assert.equal(r.status, 200, JSON.stringify(r.data)); first = r.data.payload;
    assert.equal(first.event.doctorId, a.user.id); assert.equal(first.patient.doctorId, a.user.id);
    const conflicts = await Promise.all(['Demo Conflict A', 'Demo Conflict B'].map(patientName => call('/api/events', {
      method: 'POST', token: a.accessToken, body: { ...body, patientName, patientDate: '2030-01-07T10:30:00.000Z' },
    })));
    assert.deepEqual(conflicts.map(r => r.status).sort(), [200, 400]);
    assert.equal((await call('/api/patients', { token: a.accessToken })).data.patients.length, 8);
  });
  await t.test('other visitors cannot mutate records or preferences', async () => {
    assert.equal((await call(`/api/events/${first.event.id}`, { method: 'DELETE', token: b.accessToken })).status, 400);
    assert.equal((await call(`/api/patients/${first.patient.id}`, { method: 'PATCH', token: b.accessToken, body: { name: 'Demo Intruder' } })).status, 404);
    assert.equal((await call(`/api/patients/${first.patient.id}`, { method: 'PATCH', token: a.accessToken, body: { doctorId: b.user.id } })).status, 400);
    assert.equal((await call(`/api/users/${a.user.id}/preferences`, { method: 'PATCH', token: b.accessToken, body: { userReminders: 'enabled' } })).status, 403);
    const result = await call(`/api/users/${a.user.id}/preferences`, { method: 'PATCH', token: a.accessToken, body: { userId: b.user.id, userReminders: 'enabled' } });
    assert.equal(result.status, 200);
    assert.equal((await db.getRepository('User').findOneBy({ id: b.user.id })).reminders, 'disabled');
  });
  await t.test('second doses enforce ordering and retain patient on second-dose deletion', async () => {
    const r = await call('/api/events', { method: 'POST', token: a.accessToken, body: { ...body, patientVaxxed: 'second', patientDate: '2030-02-07T10:00:00.000Z' } });
    assert.equal(r.status, 200, JSON.stringify(r.data)); second = r.data.payload;
    assert.equal((await call(`/api/events/${first.event.id}`, { method: 'DELETE', token: a.accessToken })).status, 400);
    assert.equal((await call(`/api/events/${second.event.id}`, { method: 'DELETE', token: a.accessToken })).status, 200);
    assert.equal((await db.getRepository('Patient').findOneBy({ id: first.patient.id })).vaxxed, 'first');
    assert.equal((await call(`/api/events/${first.event.id}`, { method: 'DELETE', token: a.accessToken })).status, 200);
    assert.equal(await db.getRepository('Patient').findOneBy({ id: first.patient.id }), null);
  });
  await t.test('list, simulated reminders and invalid inputs', async () => {
    const list = await call('/api/all', { token: a.accessToken });
    assert.equal(list.status, 200); assert.equal(list.data.length, 7);
    assert.equal((await call('/api/all?rangeFrom=bad', { token: a.accessToken })).status, 400);
    const outbox = await call('/api/demo/outbox', { token: a.accessToken });
    assert.equal(outbox.data.simulated, true); assert.equal(outbox.data.messages.length, 7);
    assert.equal((await call('/api/events/cron')).status, 404);
    assert.equal((await call('/api/auth/signup', { method: 'POST', body: {} })).status, 403);
    assert.equal((await call('/api/demo/session', { method: 'POST', body: {}, requestOrigin: 'https://untrusted.example' })).status, 403);
    assert.equal((await call('/api/events', { method: 'POST', token: a.accessToken, body: { ...body, patientVaccine: 'invalidmoderna' } })).status, 400);
  });
  await t.test('refresh works; logout and expired sessions invalidate both token types', async () => {
    const refresh = await call('/api/auth/refresh_token', { method: 'POST', body: {}, cookie: a.cookie });
    assert.equal(refresh.data.user.id, a.user.id);
    assert.match(refresh.cookie, /HttpOnly/); assert.match(refresh.cookie, /SameSite=Lax/); assert.match(refresh.cookie, /Path=\/api\/auth/);
    assert.equal((await call('/api/auth/logout', { method: 'POST', token: a.accessToken })).status, 200);
    assert.equal((await call('/api/events', { token: a.accessToken })).status, 401);
    assert.equal((await call('/api/auth/refresh_token', { method: 'POST', cookie: a.cookie })).data.ok, false);
    await db.getRepository('User').update({ id: b.user.id }, { demoExpiresAt: new Date(0) });
    assert.equal((await call('/api/events', { token: b.accessToken })).status, 401);
    assert.equal((await call('/api/auth/refresh_token', { method: 'POST', cookie: b.cookie })).data.ok, false);
  });
  await t.test('migration schema matches entity metadata', async () => {
    const changes = await db.driver.createSchemaBuilder().log();
    assert.deepEqual(changes.upQueries.map(q => q.query), []);
  });
});

test('database guard refuses wrong targets and preserves verified TLS', () => {
  const original = process.env.PG_DB_URL, expected = process.env.DATABASE_HOST_EXPECTED;
  try {
    process.env.PG_DB_URL = 'postgresql://demo:unused@other.example/vaxx_demo?sslmode=disable';
    process.env.DATABASE_HOST_EXPECTED = 'isolated.example';
    assert.throws(databaseOptions, /does not match/);
    process.env.DATABASE_HOST_EXPECTED = 'other.example';
    const options = databaseOptions();
    assert.deepEqual(options.ssl, { rejectUnauthorized: true });
    assert.equal(new URL(options.url).searchParams.has('sslmode'), false);
    process.env.PG_DB_URL = 'postgresql://demo:unused@other.example/existing_product';
    assert.throws(databaseOptions, /isolated vaxx_demo/);
  } finally { process.env.PG_DB_URL = original; if (expected === undefined) delete process.env.DATABASE_HOST_EXPECTED; else process.env.DATABASE_HOST_EXPECTED = expected; }
});
