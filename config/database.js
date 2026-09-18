import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';
import { demoMode } from './runtime';

export function databaseOptions() {
  const raw = process.env.PG_DB_URL;
  if (!raw) throw new Error('PG_DB_URL is required');
  const url = new URL(raw);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  if (!local && url.hostname !== process.env.DATABASE_HOST_EXPECTED) {
    throw new Error('Database host does not match DATABASE_HOST_EXPECTED');
  }
  if (demoMode && decodeURIComponent(url.pathname.slice(1)) !== 'vaxx_demo') {
    throw new Error('Demo deployments may only use the isolated vaxx_demo database');
  }
  // pg connection-string SSL options can silently override explicit TLS options.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  return {
    type: 'postgres',
    url: url.toString(),
    entities: [path.join(__dirname, '../entities/*.js')],
    migrations: [path.join(__dirname, '../migrations/*.js')],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    ssl: local ? false : { rejectUnauthorized: true },
    extra: { max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 20000, statement_timeout: 15000 },
  };
}

let database;
export const connectDatabase = async () => {
  database = new DataSource(databaseOptions());
  return database.initialize();
};
export const getConnection = () => {
  if (!database?.isInitialized) throw new Error('Database is not ready');
  return database;
};
