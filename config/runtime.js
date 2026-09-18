import dotenv from 'dotenv';

dotenv.config();
export const demoMode = process.env.DEMO_MODE === 'true';
export const production = process.env.NODE_ENV === 'production';
export const clientOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5174';

export function validateRuntime() {
  for (const name of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']) {
    if (!process.env[name] || process.env[name].length < 32) {
      throw new Error(`${name} must contain at least 32 random characters`);
    }
  }
  const origin = new URL(clientOrigin);
  if (production && (!demoMode || origin.protocol !== 'https:' || !process.env.DEMO_PROXY_SECRET || process.env.DEMO_PROXY_SECRET.length < 32)) {
    throw new Error('Public deployment requires DEMO_MODE, HTTPS CLIENT_ORIGIN and a DEMO_PROXY_SECRET of at least 32 characters');
  }
}
