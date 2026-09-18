// Explicit test-only utility: requires an EMPTY disposable local database.
require('dotenv').config();
const assert = require('node:assert/strict');
const { connectDatabase } = require('../dist/config/database');
(async () => {
  const url = new URL(process.env.PG_DB_URL);
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname));
  assert.equal(url.pathname, '/vaxx_demo');
  const db = await connectDatabase();
  try {
    await db.runMigrations();
    assert.equal(await db.getRepository('User').count(), 0, 'Refusing to revert a populated database');
    await db.undoLastMigration();
    assert.equal(await db.showMigrations(), true);
    await db.runMigrations();
    assert.equal(await db.showMigrations(), false);
    const changes = await db.driver.createSchemaBuilder().log();
    assert.equal(changes.upQueries.length, 0);
    console.log('Migration up/down/up passed with zero schema drift');
  } finally { await db.destroy(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
