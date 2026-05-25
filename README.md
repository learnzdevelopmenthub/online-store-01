# online-store-01

[![CI](https://github.com/learnzdevelopmenthub/online-store-01/actions/workflows/ci.yml/badge.svg)](https://github.com/learnzdevelopmenthub/online-store-01/actions/workflows/ci.yml)
[![E2E](https://github.com/learnzdevelopmenthub/online-store-01/actions/workflows/e2e.yml/badge.svg)](https://github.com/learnzdevelopmenthub/online-store-01/actions/workflows/e2e.yml)

Digital PDF bookstore — npm-workspaces monorepo:

- `backend/` — Express 5 + Mongoose API
- `buyer-app/` — React 19 + Vite SPA for customers
- `admin-app/` — React 19 + Vite SPA for the single store owner
- `e2e/` — Playwright tests driving both frontends

Node `24.15.0` is pinned via `.nvmrc`.

## Docs

The specification is the source of truth — code is built to match it.

- [SRS](docs/SRS.md) — functional + non-functional requirements
- [Milestones](docs/MILESTONES.md) — M0–M12 work breakdown
- [Issues](docs/ISSUES.md) — milestones decomposed into per-area issues

## Quick start

Requires Docker Desktop, or Docker Engine + Compose plugin v2.

```bash
cp .env.docker.example .env.docker
docker compose up --build -d
```

| Service | URL | Notes |
|---|---|---|
| Buyer app | http://localhost:3000 | nginx-served Vite build |
| Admin app | http://localhost:3001 | nginx-served Vite build |
| Backend API | http://localhost:5000 | `GET /health` → `{"status":"ok"}` |
| MongoDB | — | internal to the compose network, no host port |

Stop everything:

```bash
docker compose down        # keep Mongo data
docker compose down -v     # also wipe the mongo-data volume
```

### Dev mode vs prod mode

`docker compose up` auto-loads `docker-compose.override.yml`, which:

- Builds the backend to its `builder` stage (devDeps included) and runs `nodemon`
- Mounts `backend/src/` so editing a `.ts` file restarts the server in ~2s
- Sets `CHOKIDAR_USEPOLLING=true` because inotify events don't cross WSL2 bind mounts on Docker Desktop for Windows

To run the production-style build (no override, no hot-reload):

```bash
docker compose -f docker-compose.yml up --build -d
```

**Always pass `--build` when switching between modes.** Compose tags the backend image under the same name for both, so without `--build` you'll run the old mode's image with the new mode's command and the backend will crash-loop.

### Working on the frontends

Compose runs the production nginx build for both SPAs — there is no in-compose hot-reload for the frontends. For Vite HMR, run dev natively on the host:

```bash
npm run dev --workspace=@store/buyer-app    # http://localhost:5173
npm run dev --workspace=@store/admin-app    # http://localhost:5173
```

Both default to port 5173 — run one at a time, or pass `--port 5174` to the second. The backend can stay running in compose; the host-side Vite still reaches it at `http://localhost:5000` (the API URL is baked into the bundle at build time).

### `.env.docker`

`.env.docker.example` documents the full env-var surface in groups: runtime, database, JWT keys, Google OAuth, Razorpay, Cloudflare R2, SMTP, admin seed, CORS. Only the database URI is needed to bring the stack up today — the third-party credentials stay empty until their respective milestones (M5–M12). `.env.docker` is gitignored; never commit real secrets.
