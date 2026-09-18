# Isolated portfolio deployment

Status: implementation verified locally; live deployment in progress. Do not advertise the intended URL until the public smoke test passes.

| Resource | Parent | App resource |
| --- | --- | --- |
| Cloudflare Pages Free | `msiric-public-demos`, account `f8fd075624b85e729e46d15d374e59ed` | intended `vaxx-app-demo` |
| Render Free | `msiric-public-demos`, workspace `tea-damk99ajnfac73b07010` | project `prj-damk9pn40ujc73b90ei0`, environment `evm-damk9pn40ujc73b90ej0` |
| Neon Free | `msiric-public-demos`, org `org-damp-glade-19263338` | project `autumn-tooth-00495173`, database `vaxx_demo`, PostgreSQL 16, Frankfurt |

## Deploy

- Backend: use the public repository's `codex/restore-public-demo` branch, settings in `render.yaml`, and the **existing new demo project's Demo environment**. `plan: free` is mandatory. No Render database, disk, cron, or paid upgrade is needed. Build compiles the server once. Startup runs explicit migrations, then starts HTTP only after the database is ready.
- Render environment: `DEMO_MODE=true`, `NODE_ENV=production`, `CLIENT_ORIGIN` equal to the actual Pages production origin, `PG_DB_URL` from the isolated Neon project, and `DATABASE_HOST_EXPECTED` equal to that exact host. Use independent random access/refresh secrets and a shared random `DEMO_PROXY_SECRET`.
- Frontend: `npm --prefix client ci && npm run build:client`, then `wrangler pages deploy client/build --project-name vaxx-app-demo --branch main`. The explicit account ID in `wrangler.jsonc` must match the table above. The root `functions/` directory is deployed by Wrangler.
- Pages secrets: `API_ORIGIN` is the new Render service's HTTPS origin; `DEMO_PROXY_SECRET` must match Render. Redeploy after setting/changing secrets. Never use `VITE_` for secrets or embed database credentials in frontend code.
- Smoke test: sample calendar/list, start live clinic, add/delete appointment, refresh browser, logout, invalid/cross-user requests, and direct Render API rejection. Confirm cookies are Secure, HttpOnly, SameSite=Lax and restricted to `/api/auth`.

Cloudflare routes only `/api/*` through Functions; static sample browsing does not consume function requests or wake Render/Neon. Direct calls to Render require the proxy secret, while mutating calls also require the exact frontend Origin. Health checks do not query PostgreSQL.

## Cost and operation

Target recurring cost: $0 within the provider allowances. Render's three demos share its workspace's free instance hours, build minutes, and bandwidth. Do not add keep-alive pings; sleep and quota exhaustion are acceptable for this portfolio. Neon suspends idle compute. All application data is synthetic and disposable. No backups or always-on guarantees are promised.

Cloudflare/Render have no payment method; Render's build spending limit is $0. Keep the Neon organization on Free. Do not attach existing paid projects, change other accounts, or enable billing to solve a quota error.

Database schema synchronization is disabled. Versioned migrations are the only deployment schema changes; the configuration rejects a wrong database name or unexpected remote host and verifies TLS certificates. Roll back code by redeploying a previous tested commit. Do not drop/reseed a database as a startup action.

Secrets stay in provider secrets/environment settings and ignored local files. Do not commit them. Synthetic sessions expire after 24 hours and are physically pruned on subsequent session creation. A restart resets per-process request counters; storage caps remain database-enforced.
