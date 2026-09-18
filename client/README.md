# Vaxx frontend

React 17, Material UI 4, FullCalendar 6 and Vite. Start with the [application README](../README.md) for the isolated PostgreSQL/API setup and demo behavior; use [DEPLOYMENT.md](../DEPLOYMENT.md) for hosting.

From the repository root, run `npm ci` and `npm --prefix client ci`, then `npm --prefix client start`. The UI is at `http://127.0.0.1:5174`; Vite proxies `/api` to the local API on port 5074. The bundled sample does not need the API.

`npm run build:client` writes the static production site to `client/build`. Production API requests use the root Pages Function; deploy from the repository root so it is included. Secrets never belong in browser code or `VITE_*` variables. This project no longer uses Create React App, port 3000 or `eject`.
