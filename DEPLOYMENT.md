# Isolated portfolio deployment

Shared references: [portfolio operations](https://github.com/msiric/feasible-route-mapping/blob/master/docs/PORTFOLIO_HOSTING.md), [future-project playbook](https://github.com/msiric/feasible-route-mapping/blob/master/docs/FREE_DEMO_HOSTING.md), [deployment record template](https://github.com/msiric/feasible-route-mapping/blob/master/docs/PROJECT_HOSTING_TEMPLATE.md).

Live demo: **https://vaxx-app-demo.pages.dev** (verified 18 September 2026).

Public checks passed for the sample calendar, live clinic and patient list, browser refresh, appointment creation/deletion, simulated reminder preview, cookie security, origin checks and logout revocation. Direct Render API access is rejected.

| Resource | Parent | App resource |
| --- | --- | --- |
| Cloudflare Pages Free | `msiric-public-demos`, account `f8fd075624b85e729e46d15d374e59ed` | `vaxx-app-demo` |
| Render Free | `msiric-public-demos`, workspace `tea-damk99ajnfac73b07010` | project `prj-damk9pn40ujc73b90ei0`, environment `evm-damk9pn40ujc73b90ej0`; service `srv-damm7jou01pc73aq1avg` |
| Neon Free | `msiric-public-demos`, org `org-damp-glade-19263338` | project `autumn-tooth-00495173`, database `vaxx_demo`, PostgreSQL 16, Frankfurt |

## Deploy

- Backend: use the public repository's `main` branch, settings in `render.yaml`, and the **existing new demo project's Demo environment**. `plan: free` is mandatory. No Render database, disk, cron, or paid upgrade is needed. Build compiles the server once. Startup runs explicit migrations, then starts HTTP only after the database is ready.
- Render environment: `DEMO_MODE=true`, `NODE_ENV=production`, `CLIENT_ORIGIN` equal to the actual Pages production origin, `PG_DB_URL` from the isolated Neon project, and `DATABASE_HOST_EXPECTED` equal to that exact host. Use independent random access/refresh secrets and a shared random `DEMO_PROXY_SECRET`.
- Frontend: follow the explicit build/upload commands below from the repository root. Pages rejects `account_id` in its config; every Wrangler call needs the correct account and isolated CLI profile. Wrangler includes the root `functions/` directory.
- Pages secrets: `API_ORIGIN` is the new Render service's HTTPS origin; `DEMO_PROXY_SECRET` must match Render. Redeploy after setting/changing secrets. Never use `VITE_` for secrets or embed database credentials in frontend code.
- Smoke test: sample calendar/list, start live clinic, add/delete appointment, refresh browser, logout, invalid/cross-user requests, and direct Render API rejection. Confirm cookies are Secure, HttpOnly, SameSite=Lax and restricted to `/api/auth`.

Cloudflare routes only `/api/*` through Functions; static sample browsing does not consume function requests or wake Render/Neon. Direct calls to Render require the proxy secret, while mutating calls also require the exact frontend Origin. Health checks do not query PostgreSQL.

## Cost and operation

Target recurring cost: $0 within the provider allowances. Render's three demos share its workspace's free instance hours, build minutes, and bandwidth. Do not add keep-alive pings; sleep and quota exhaustion are acceptable for this portfolio. Neon suspends idle compute. All application data is synthetic and disposable. No backups or always-on guarantees are promised.

Cloudflare/Render have no payment method; Render's build spending limit is $0. Keep the Neon organization on Free. Do not attach existing paid projects, change other accounts, or enable billing to solve a quota error.

Database schema synchronization is disabled. Versioned migrations are the only deployment schema changes; the configuration rejects a wrong database name or unexpected remote host and verifies TLS certificates. Roll back code by redeploying a previous tested commit. Do not drop/reseed a database as a startup action.

Secrets stay in provider secrets/environment settings and ignored local files. Do not commit them. Synthetic sessions expire after 24 hours and are physically pruned on subsequent session creation. A restart resets per-process request counters; storage caps remain database-enforced.

## Source and release branches

The restoration is merged into GitHub `main`. The existing Render service and `render.yaml` now both select `main`; auto-deploy and PR previews remain Off. Manually deploy a tested commit from this branch. Merging source alone does not deploy it. The old restoration branch is retained for history, and no duplicate service is needed. The branch alignment changed the source selector, not the currently running API version.

Pages uses Direct Upload and its production label is **`main`**, independently of the source checkout. Another `--branch` can create only a preview. Verify the root public URL and its asset names after upload. Markdown-only updates require no hosting deployment.

## Frontend commands

Replace the profile placeholder with the existing private demo CLI directory. Authenticate and confirm the exact account there before publishing.

```sh
export CLOUDFLARE_ACCOUNT_ID=f8fd075624b85e729e46d15d374e59ed
export XDG_CONFIG_HOME='<absolute-path-to-isolated-demo-cli-profile>'
npm ci
npm --prefix client ci
npm run build:client
wrangler pages deploy client/build --project-name vaxx-app-demo --branch main
```

The verified production Pages deployment was `daa75d78`; API commit `2a991070935184b486b3df1933432e74855dfa6e`. A real session after prolonged idle completed in 32.7 seconds on 18 September 2026; this is a measurement, not a guarantee. Current source contains the tests and documentation in addition to deployed runtime code.

## Continuous validation

The GitHub Actions workflow runs the existing API/proxy tests, migration up/down/up with schema-drift verification, and a clean frontend build on pull requests and pushes to `main`. PostgreSQL is a disposable CI service with test-only credentials; jobs have read-only repository permission, no production secrets, and no deployment access. Standard public runners are used without artifact uploads or persistent caches. Passing CI does not deploy the app.
