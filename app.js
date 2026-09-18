import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import api from './routes/api';
import demo from './routes/demo';
import { clientOrigin, demoMode } from './config/runtime';
import { demoGuard } from './middleware/demo-guard';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.get('/healthz', (req, res) => res.json({ status: 'ok', app: 'vaxx-app', demo: demoMode }));
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
app.use('/api', demoGuard);
if (demoMode) app.use('/api/demo', demo);
app.use('/api', api);
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.name === 'ValidationError' ? 400 : err.status || 500;
  if (status >= 500) console.error('Request failed:', err.name || 'Error');
  res.status(status).json({ error: status >= 500 ? 'Demo is temporarily unavailable. Please try again.' : err.message });
});
export default app;
