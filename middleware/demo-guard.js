import crypto from 'crypto';
import { clientOrigin, production } from '../config/runtime';

const requests = new Map();
let active = 0;
export function demoGuard(req, res, next) {
  if (production) {
    const expected = Buffer.from(process.env.DEMO_PROXY_SECRET || '');
    const supplied = Buffer.from(req.get('X-Demo-Proxy-Secret') || '');
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(expected, supplied)) {
      return res.status(403).json({ error: 'Use the public demo website to access this API.' });
    }
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('Origin') !== clientOrigin) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }
  const now = Date.now();
  for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
  const key = production ? req.get('X-Demo-Client-IP') || 'unknown' : req.ip;
  if (!requests.has(key) && requests.size >= 2048) return res.status(503).json({ error: 'Demo is busy. Please try again shortly.' });
  const bucket = requests.get(key) || { count: 0, starts: 0, until: now + 60000 };
  bucket.count++;
  if (req.path === '/demo/session') bucket.starts++;
  requests.set(key, bucket);
  if (bucket.count > 120 || bucket.starts > 5) {
    res.set('Retry-After', '60');
    return res.status(429).json({ error: 'Demo request limit reached. Please try again in a minute.' });
  }
  if (active >= 12) return res.status(503).json({ error: 'Demo is busy. Please retry shortly.' });
  active++;
  let released = false;
  const release = () => { if (!released) { active--; released = true; } };
  res.once('finish', release); res.once('close', release);
  res.set('Cache-Control', 'no-store');
  next();
}
