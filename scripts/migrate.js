import { connectDatabase } from '../config/database';

(async () => {
  const db = await connectDatabase();
  try {
    await db.runMigrations({ transaction: 'all' });
    console.log('Vaxx migrations complete');
  } finally { await db.destroy(); }
})().catch(() => { console.error('Database migration failed; check the target and migration history'); process.exitCode = 1; });
