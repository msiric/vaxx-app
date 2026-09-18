# Vaxx

[Open the live portfolio demo](https://vaxx-app-demo.pages.dev).

A portfolio demonstration of a vaccination appointment calendar originally built to help Croatian healthcare workers organize patients and first/second appointments during the COVID-19 pandemic.

The restored demo preserves the Croatian calendar, patient list, booking validation, and reminder preferences. It uses fictional patients only. The historical vaccine rules are part of the software demonstration, not current medical guidance.

## Demo behavior

- **Read-only sample:** opens immediately with six fictional patients and appointments in the current week. Browsing does not contact the API.
- **Live demo:** creates a separate clinic for each visitor, using the real API and PostgreSQL transactions. Sessions expire after 24 hours. Expired rows are pruned when the next session starts.
- **Reminders:** a visible preview in settings; no emails are sent. Signup and password login are disabled in the public demo.
- **Limits:** 100 simultaneous clinics, 200 appointments per clinic, five session starts and 120 API requests per IP per minute, twelve in-flight API requests. A full or sleeping API leaves the sample available.

The old Heroku deployment and shared test password are retired. Deployment details and the verified live URL are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

## Local development

Use Node 22.13 or later in the Node 22 release line and PostgreSQL 16. Create an isolated database named `vaxx_demo`; never point the demo at a real clinic database.

1. Copy `.env.example` to `.env`, set your local database URL, and generate independent random access-token, refresh-token, and proxy secrets (at least 32 characters each).
2. Run `npm ci` and `npm --prefix client ci`.
3. Run `npm run build && npm run migrate`.
4. Start `npm start` and, in another terminal, `npm --prefix client start`.
5. Open `http://127.0.0.1:5174`. The API listens on port 5074.

`npm test` runs integration tests against the disposable local database in `.env`. It refuses non-local databases and deletes only the sessions it creates. `node scripts/migration-roundtrip.cjs` verifies migration up/down/up on an **empty** local database. `npm run build:client` builds the static frontend. GitHub Actions runs these API/proxy tests, the migration roundtrip and a clean frontend build with disposable PostgreSQL on pull requests and pushes to `main`.

## Architecture

```mermaid
flowchart LR
  Visitor --> Pages[Cloudflare Pages: React sample and UI]
  Pages -->|Live actions: same-origin /api| Proxy[Pages Function]
  Proxy -->|Authenticated proxy request| API[Render Free: Express]
  API --> DB[Neon Free: isolated vaxx_demo]
```

Backend: Express 5, TypeORM migrations, PostgreSQL, short-lived JWTs and secure HttpOnly refresh cookies. Frontend: React 17, Material UI 4, FullCalendar 6 and Vite. The older UI framework remains to preserve the original app; the obsolete CRA build chain has been removed.

## License

MIT

## Hosting documentation

- [Deploy and maintain this app](DEPLOYMENT.md).
- [Portfolio ownership, costs, recovery and maintenance](https://github.com/msiric/feasible-route-mapping/blob/master/docs/PORTFOLIO_HOSTING.md).
- [Host a future project for $0](https://github.com/msiric/feasible-route-mapping/blob/master/docs/FREE_DEMO_HOSTING.md) and [copy its deployment record template](https://github.com/msiric/feasible-route-mapping/blob/master/docs/PROJECT_HOSTING_TEMPLATE.md).
