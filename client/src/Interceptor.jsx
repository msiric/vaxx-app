import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import App from './App';
import { useUserStore } from './contexts/user';
import { sampleData } from '../../common/demo-data';

const raw = axios.create({ timeout: 90000, withCredentials: true });
const sample = sampleData('00000000-0000-4000-8000-000000000000');
const networkAdapter = axios.getAdapter(axios.defaults.adapter);
export const ax = axios.create({ timeout: 25000, withCredentials: true, adapter: async config => {
  if (useUserStore.getState().mode !== 'sample') return networkAdapter(config);
  let data;
  if (config.method !== 'get') throw Object.assign(new Error('Start the live demo to make changes.'), { config });
  if (config.url === '/api/events') data = { events: sample.events };
  else if (config.url === '/api/patients') data = { patients: sample.patients };
  else if (config.url === '/api/all') data = sample.patients.map(patient => ({
    ...patient, vaxxed: 1, events: sample.events.filter(e => e.patient.id === patient.id).map(e => ({ date: e.date, event: 'prvi', identifier: e.identifier })),
  }));
  else throw Object.assign(new Error('Start the live demo to use this feature.'), { config });
  return { data, status: 200, statusText: 'OK', headers: {}, config };
} });
ax.interceptors.request.use(config => {
  const { mode, token } = useUserStore.getState();
  if (mode === 'live' && token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshPromise;
ax.interceptors.response.use(value => value, async error => {
  if (error.response?.status !== 401 || error.config?._retried) throw error;
  if (!refreshPromise) refreshPromise = raw.post('/api/auth/refresh_token', {}).finally(() => { refreshPromise = null; });
  const { data } = await refreshPromise;
  if (!data.user) throw new Error('Your demo session expired. Start a new live demo.');
  useUserStore.setState({ token: data.accessToken });
  return ax.request({ ...error.config, _retried: true });
});
function useSample() {
  sessionStorage.removeItem('vaxx-live');
  useUserStore.setState({ mode: 'sample', authenticated: true, token: 'sample', id: 'sample', name: 'Sample clinic', email: 'demo@example.invalid', reminders: 'disabled', loading: false });
}
function useLive(data) {
  sessionStorage.setItem('vaxx-live', 'true');
  useUserStore.setState({ mode: 'live', ...data.user, token: data.accessToken, authenticated: true, loading: false });
}
export default function Interceptor() {
  const mode = useUserStore(state => state.mode);
  const id = useUserStore(state => state.id);
  const loading = useUserStore(state => state.loading);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const interceptor = ax.interceptors.response.use(value => value, error => {
      enqueueSnackbar(error.response?.data?.error || error.message || 'The demo API could not be reached.', { variant: 'error' });
      return Promise.reject(error);
    });
    let mounted = true;
    if (sessionStorage.getItem('vaxx-live')) {
      setStarting(true);
      raw.post('/api/auth/refresh_token', {}).then(({ data }) => {
        if (!mounted) return;
        if (data.user) useLive(data); else useSample();
      }).catch(() => { if (mounted) { useSample(); setMessage('The live API is unavailable. You are viewing the read-only sample.'); } })
        .finally(() => { if (mounted) setStarting(false); });
    } else useSample();
    return () => { mounted = false; ax.interceptors.response.eject(interceptor); };
  }, []);
  async function startLive() {
    setStarting(true); setMessage('');
    try { const { data } = await raw.post('/api/demo/session', {}); useLive(data); }
    catch (error) { setMessage(error.response?.data?.error || 'The live API could not start. The sample remains available; please retry shortly.'); }
    finally { setStarting(false); }
  }
  return <>
    <Box component="aside" style={{ background: '#eef4fc', padding: '16px 24px', borderBottom: '1px solid #b8c9dd' }}>
      <Typography variant="h6">Vaxx · Portfolio demo</Typography>
      <Typography variant="body2">{mode === 'live' ? 'Live demo: your own temporary clinic. Changes expire after 24 hours.' : 'Read-only sample: browse the calendar and patient list instantly.'} All patients are fictional. Do not enter real patient information. Historical scheduling rules are shown for demonstration only.</Typography>
      <Box style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="contained" color="primary" disabled={starting} onClick={startLive}>{starting ? 'Starting live demo…' : mode === 'live' ? 'Start a new live demo' : 'Start live demo'}</Button>
        {mode === 'live' && <Button disabled={starting} onClick={useSample}>View sample</Button>}
        <Typography variant="body2">{starting ? 'Free hosting may take about a minute to wake up.' : 'No signup. No email is sent.'}</Typography>
      </Box>
      {message && <Typography role="status" style={{ marginTop: 8 }}>{message}</Typography>}
    </Box>
    {!loading && <App key={`${mode}:${id}`} />}
  </>;
}
