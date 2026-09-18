import jwt from 'jsonwebtoken';
import { fetchUserByAuth } from '../services/user';
import { production } from '../config/runtime';

export const createAccessToken = ({ userData }) => jwt.sign(
  { id: userData.id, name: userData.name, jwtVersion: userData.jwtVersion },
  process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: '15m' }
);
export const createRefreshToken = ({ userData }) => jwt.sign(
  { userId: userData.id, jwtVersion: userData.jwtVersion },
  process.env.REFRESH_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: '24h' }
);
export const sendRefreshToken = (res, token) => {
  const options = { httpOnly: true, secure: production, sameSite: 'lax', path: '/api/auth' };
  if (token) res.cookie('jid', token, { ...options, maxAge: 24 * 60 * 60 * 1000 });
  else res.clearCookie('jid', options);
};
export const updateAccessToken = async (req, res, next, connection) => {
  const empty = { ok: false, accessToken: '' };
  if (!req.cookies.jid) return empty;
  let payload;
  try { payload = jwt.verify(req.cookies.jid, process.env.REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] }); }
  catch { sendRefreshToken(res, ''); return empty; }
  const user = await fetchUserByAuth({ userId: payload.userId, connection });
  if (!user || user.jwtVersion !== payload.jwtVersion || (user.demoExpiresAt && user.demoExpiresAt <= new Date())) {
    sendRefreshToken(res, ''); return empty;
  }
  sendRefreshToken(res, createRefreshToken({ userData: user }));
  return { ok: true, accessToken: createAccessToken({ userData: user }), user: {
    id: user.id, name: user.name, email: user.email, reminders: user.reminders,
  } };
};
