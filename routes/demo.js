import express from 'express';
import crypto from 'crypto';
import { getConnection } from '../config/database';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Event } from '../entities/Event';
import { createAccessToken, createRefreshToken, sendRefreshToken } from '../utils/auth';
import { isAuthenticated } from '../utils/helpers';
import { sampleData } from '../common/demo-data';

const router = express.Router();
router.get('/config', (req, res) => res.json({ demo: true, lifetimeHours: 24, email: 'simulated' }));
router.post('/session', async (req, res, next) => {
  try {
    const user = await getConnection().transaction(async manager => {
      // Serialize creation and pruning across requests/processes to enforce the storage cap.
      await manager.query('SELECT pg_advisory_xact_lock(742001)');
      await manager.createQueryBuilder().delete().from(User).where('"demoExpiresAt" < NOW()').execute();
      if (await manager.getRepository(User).count() >= 100) {
        const error = new Error('The live demo is at capacity. Please use the sample demo and try again later.');
        error.status = 503; throw error;
      }
      const id = crypto.randomUUID();
      const user = await manager.getRepository(User).save({
        id, name: `demo_${id.slice(0, 12)}`, email: `${id}@example.invalid`,
        password: 'demo-session-login-disabled', reminders: 'disabled',
        demoExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const { patients, events } = sampleData(id);
      await manager.getRepository(Patient).save(patients.map(p => ({ ...p, doctor: { id } })));
      await manager.getRepository(Event).save(events.map(e => ({ ...e, doctor: { id }, patient: { id: e.patient.id } })));
      return user;
    });
    sendRefreshToken(res, createRefreshToken({ userData: user }));
    res.json({ accessToken: createAccessToken({ userData: user }), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/outbox', isAuthenticated, async (req, res, next) => {
  try {
    const events = await getConnection().getRepository(Event).find({ where: { doctor: { id: res.locals.user.id } }, relations: { patient: true }, order: { date: 'ASC' } });
    res.json({ simulated: true, messages: events.map(event => ({
      id: event.id, to: 'demo-clinic@example.invalid', subject: 'Sample appointment reminder',
      text: `${event.patient.name} — ${event.date.toISOString()} (${event.type === 'first' ? 'first' : 'second'} appointment)`,
    })) });
  } catch (err) { next(err); }
});

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, reminders: user.reminders };
}
export default router;
