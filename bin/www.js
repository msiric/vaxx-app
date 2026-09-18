#!/usr/bin/env node
import http from 'http';
import app from '../app';
import { connectDatabase } from '../config/database';
import { validateRuntime } from '../config/runtime';

(async () => {
  validateRuntime();
  const db = await connectDatabase();
  if (await db.showMigrations()) {
    await db.destroy();
    throw new Error('Run npm run migrate before starting this server');
  }
  const server = http.createServer(app);
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.listen(Number(process.env.PORT || 5074), '0.0.0.0', () => console.log('Vaxx API ready'));
  const stop = () => server.close(() => db.destroy().then(() => process.exit(0)));
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
})().catch(err => {
  console.error('Vaxx startup failed:', err.message?.includes('password') ? 'database connection error' : err.message);
  process.exitCode = 1;
});
