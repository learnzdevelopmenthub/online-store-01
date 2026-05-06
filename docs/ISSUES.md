# GitHub Issues — Decomposed from Milestones

## Digital PDF Bookstore — MERN Stack

| Field | Detail |
|---|---|
| Version | 1.0.0 |
| Date | May 5, 2026 |
| Source | [MILESTONES.md](MILESTONES.md) |
| Strategy | Decomposition by app/area (Strategy A) |

Each entry below is a self-contained GitHub Issue. Copy the body into a new issue, attach the listed labels, assign it to the matching milestone, and link the listed dependencies. Acceptance criteria for the *whole* milestone live in [MILESTONES.md](MILESTONES.md); each issue lists only the slice it owns.

### Label scheme

| Group | Values |
|---|---|
| Area | `area:backend`, `area:buyer-app`, `area:admin-app`, `area:e2e`, `area:infra`, `area:devops` |
| Type | `type:feature`, `type:infra`, `type:test`, `type:docs` |
| Priority | `priority:p0` (blocker), `priority:p1` (must-have) |

---

## Issue Index

| # | Title | Milestone | Labels |
|---|---|---|---|
| [M0-1](#m0-1-monorepo-root-setup) | Monorepo root setup | M0 | infra, p0 |
| [M0-2](#m0-2-backend-scaffold--smoke-test) | Backend scaffold + smoke test | M0 | backend, infra, p0 |
| [M0-3](#m0-3-buyer-app-scaffold--smoke-test) | Buyer App scaffold + smoke test | M0 | buyer-app, infra, p0 |
| [M0-4](#m0-4-admin-app-scaffold--smoke-test) | Admin App scaffold + smoke test | M0 | admin-app, infra, p0 |
| [M0-5](#m0-5-e2e-scaffold--smoke-test) | E2E scaffold + smoke test | M0 | e2e, infra, p0 |
| [M1-1](#m1-1-ci-lint--unitintegration-workflow) | CI lint + unit/integration workflow | M1 | devops, p0 |
| [M1-2](#m1-2-ci-e2e-workflow) | CI E2E workflow | M1 | devops, e2e, p0 |
| [M1-3](#m1-3-branch-protection--ci-status-badge) | Branch protection + CI status badge | M1 | devops, p1 |
| [M2-1](#m2-1-backend-dockerfile) | Backend Dockerfile | M2 | backend, devops, p0 |
| [M2-2](#m2-2-buyer-app-dockerfile--nginx-config) | Buyer App Dockerfile + nginx config | M2 | buyer-app, devops, p0 |
| [M2-3](#m2-3-admin-app-dockerfile--nginx-config) | Admin App Dockerfile + nginx config | M2 | admin-app, devops, p0 |
| [M2-4](#m2-4-docker-compose--env-templates) | docker-compose.yml + env templates | M2 | devops, p0 |
| [M2-5](#m2-5-compose-flow-documentation) | Compose flow documentation | M2 | docs, p1 |
| [M3-1](#m3-1-vps-initial-setup) | VPS initial setup | M3 | devops, p0 |
| [M3-2](#m3-2-vps-repository--production-env) | VPS repository + production env | M3 | devops, p0 |
| [M3-3](#m3-3-vps-initial-deployment--firewall) | VPS initial deployment + firewall | M3 | devops, p0 |
| [M3-4](#m3-4-cd-deploy-workflow) | CD deploy workflow | M3 | devops, p0 |
| [M4-1](#m4-1-dns-records-for-staging-subdomains) | DNS records for staging subdomains | M4 | devops, p0 |
| [M4-2](#m4-2-nginx--certbot-services--config) | Nginx + Certbot services + config | M4 | devops, p0 |
| [M4-3](#m4-3-ssl-certificate-issuance--renewal-cron) | SSL certificate issuance + renewal cron | M4 | devops, p0 |
| [M4-4](#m4-4-app-config-for-https-staging) | App config for HTTPS staging | M4 | backend, buyer-app, admin-app, p0 |
| [M5-1](#m5-1-backend-auth-routes-models--middleware) | Backend auth routes, models + middleware | M5 | backend, feature, p0 |
| [M5-2](#m5-2-buyer-app-auth-flows--guards) | Buyer App auth flows + guards | M5 | buyer-app, feature, p0 |
| [M5-3](#m5-3-admin-app-auth-flow) | Admin App auth flow | M5 | admin-app, feature, p0 |
| [M5-4](#m5-4-auth-test-suite) | Auth test suite | M5 | test, p0 |
| [M6-1](#m6-1-backend-book-catalogue--admin-management) | Backend book catalogue + admin management | M6 | backend, feature, p0 |
| [M6-2](#m6-2-buyer-app-browse-search--detail) | Buyer App browse, search + detail | M6 | buyer-app, feature, p0 |
| [M6-3](#m6-3-admin-app-book-crud--bulk-actions) | Admin App book CRUD + bulk actions | M6 | admin-app, feature, p0 |
| [M6-4](#m6-4-catalogue-test-suite) | Catalogue test suite | M6 | test, p0 |
| [M7-1](#m7-1-backend-wishlist-api) | Backend wishlist API | M7 | backend, feature, p0 |
| [M7-2](#m7-2-buyer-app-cart--wishlist-ui) | Buyer App cart + wishlist UI | M7 | buyer-app, feature, p0 |
| [M7-3](#m7-3-cart--wishlist-test-suite) | Cart + wishlist test suite | M7 | test, p0 |
| [M8-1](#m8-1-backend-orders--razorpay-integration) | Backend orders + Razorpay integration | M8 | backend, feature, p0 |
| [M8-2](#m8-2-buyer-app-checkout--order-history) | Buyer App checkout + order history | M8 | buyer-app, feature, p0 |
| [M8-3](#m8-3-payment-test-suite) | Payment test suite | M8 | test, p0 |
| [M9-1](#m9-1-backend-library--secure-download) | Backend library + secure download | M9 | backend, feature, p0 |
| [M9-2](#m9-2-buyer-app-library-page--download) | Buyer App library page + download | M9 | buyer-app, feature, p0 |
| [M9-3](#m9-3-library-test-suite) | Library test suite | M9 | test, p0 |
| [M10-1](#m10-1-backend-reviews--admin-moderation) | Backend reviews + admin moderation | M10 | backend, feature, p0 |
| [M10-2](#m10-2-buyer-app-review-form--list) | Buyer App review form + list | M10 | buyer-app, feature, p0 |
| [M10-3](#m10-3-admin-app-moderation-queue) | Admin App moderation queue | M10 | admin-app, feature, p1 |
| [M10-4](#m10-4-reviews-test-suite) | Reviews test suite | M10 | test, p1 |
| [M11-1](#m11-1-backend-admin-dashboard-orders--customers) | Backend admin dashboard, orders + customers | M11 | backend, feature, p0 |
| [M11-2](#m11-2-admin-app-dashboard-orders-customers--settings) | Admin App dashboard, orders, customers + settings | M11 | admin-app, feature, p0 |
| [M11-3](#m11-3-admin-management-test-suite) | Admin management test suite | M11 | test, p0 |
| [M12-1](#m12-1-backend-email-service--contact-route) | Backend email service + contact route | M12 | backend, feature, p0 |
| [M12-2](#m12-2-buyer-app-contact--faq-pages) | Buyer App contact + FAQ pages | M12 | buyer-app, feature, p1 |
| [M12-3](#m12-3-email-test-suite) | Email test suite | M12 | test, p1 |

---

## Milestone M0 — Monorepo Scaffold + Test Suite Setup

### M0-1: Monorepo root setup

**Labels:** `area:infra`, `type:infra`, `priority:p0`
**Milestone:** M0
**Depends on:** —

**Tasks**
- [ ] Initialise root `package.json` with npm workspaces for `backend`, `buyer-app`, `admin-app`, `e2e`
- [ ] Add root-level scripts: `test`, `test:backend`, `test:buyer`, `test:admin`, `test:e2e`, `lint`, `build`
- [ ] Add `.nvmrc` / `.node-version` pinned to Node.js v24
- [ ] Configure root ESLint (`eslint.config.ts`) with TypeScript rules shared across all apps
- [ ] Configure root Prettier (`.prettierrc`) with a single style baseline
- [ ] Update `.gitignore` to also cover `dist`, `coverage`, Playwright reports (the existing one already covers `node_modules` and `.env`)

**Done when**
- Root `npm test` and `npm run lint` are wired and dispatch to all workspaces.

---

### M0-2: Backend scaffold + smoke test

**Labels:** `area:backend`, `type:infra`, `priority:p0`
**Milestone:** M0
**Depends on:** M0-1

**Tasks**
- [ ] Initialise `backend/package.json` with all backend dependencies (see SRS §7.2)
- [ ] Configure `tsconfig.json` targeting Node 24 with strict mode
- [ ] Scaffold folder structure: `src/config`, `src/controllers`, `src/middleware`, `src/models`, `src/routes`, `src/services`, `src/schemas`, `src/utils`
- [ ] Create `src/app.ts` (Express app, no routes yet — just health check `GET /health`)
- [ ] Create `src/index.ts` (server entry — binds port, calls `connectDB()`)
- [ ] Add `.env.example` with all required keys documented (see SRS §16)
- [ ] Configure Vitest (`vitest.config.ts`) with `environment: 'node'`, coverage via `@vitest/coverage-v8`
- [ ] Write smoke test: `GET /health` returns `{ status: 'ok' }` using Supertest

**Done when**
- `npm run build` and `npm run test:backend` from root both pass with 1+ green test.

---

### M0-3: Buyer App scaffold + smoke test

**Labels:** `area:buyer-app`, `type:infra`, `priority:p0`
**Milestone:** M0
**Depends on:** M0-1

**Tasks**
- [ ] Scaffold Vite + React 19 + TypeScript project in `buyer-app/`
- [ ] Install all frontend dependencies (see SRS §7.3)
- [ ] Configure Tailwind v4 + DaisyUI v5
- [ ] Configure `vitest.config.ts` with `environment: 'happy-dom'` and coverage
- [ ] Set up MSW: `src/mocks/handlers.ts` and `src/mocks/server.ts`
- [ ] Write smoke test: renders `<App />` without crashing
- [ ] Add `.env.example` documenting `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_RAZORPAY_KEY`

**Done when**
- `npm run build` and `npm run test:buyer` pass with 1+ green test.

---

### M0-4: Admin App scaffold + smoke test

**Labels:** `area:admin-app`, `type:infra`, `priority:p0`
**Milestone:** M0
**Depends on:** M0-1

**Tasks**
- [ ] Scaffold Vite + React 19 + TypeScript project in `admin-app/` (same baseline as buyer-app)
- [ ] Install frontend dependencies including admin-specific packages (see SRS §7.4)
- [ ] Configure Tailwind v4 + DaisyUI v5
- [ ] Configure `vitest.config.ts` with `environment: 'happy-dom'` and coverage
- [ ] Set up MSW handlers and server
- [ ] Write smoke test: renders `<App />` without crashing
- [ ] Add `.env.example`

**Done when**
- `npm run build` and `npm run test:admin` pass with 1+ green test.

---

### M0-5: E2E scaffold + smoke test

**Labels:** `area:e2e`, `type:infra`, `priority:p0`
**Milestone:** M0
**Depends on:** M0-3, M0-4

**Tasks**
- [ ] Initialise `e2e/package.json` with `@playwright/test`
- [ ] Configure `playwright.config.ts`: Chromium + Firefox + Safari (WebKit), base URL from env
- [ ] Create folder structure: `e2e/buyer/`, `e2e/admin/`
- [ ] Write smoke test: navigate to `VITE_APP_URL`, assert page title is not empty

**Done when**
- `npm run test:e2e` runs and reports 1+ green test.

---

## Milestone M1 — CI Pipeline (GitHub Actions)

### M1-1: CI lint + unit/integration workflow

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M1
**Depends on:** M0-1, M0-2, M0-3, M0-4

**Tasks**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Trigger on `push` to all branches and `pull_request` targeting `main`
- [ ] Use `actions/checkout@v4` and `actions/setup-node@v4` with `node-version-file: '.nvmrc'`
- [ ] Cache `node_modules` via `actions/cache` keyed on `package-lock.json` hash
- [ ] `npm ci` at workspace root
- [ ] Job `lint` — `npm run lint`
- [ ] Job `test-backend` — `npm run test:backend` with coverage
- [ ] Job `test-buyer` — `npm run test:buyer` with coverage
- [ ] Job `test-admin` — `npm run test:admin` with coverage
- [ ] Test jobs run in parallel; `lint` runs independently
- [ ] Upload coverage reports as workflow artifacts (retain 14 days)

**Done when**
- A push to any branch triggers the workflow with all jobs visible in Actions.

---

### M1-2: CI E2E workflow

**Labels:** `area:devops`, `area:e2e`, `type:infra`, `priority:p0`
**Milestone:** M1
**Depends on:** M0-5, M1-1

**Tasks**
- [ ] Create `.github/workflows/e2e.yml`
- [ ] Trigger on `pull_request` targeting `main` only
- [ ] Spin up `mongo:8` service container
- [ ] Build all three apps and start backend + both frontends with test `.env` from GitHub Secrets
- [ ] `npx playwright install --with-deps`
- [ ] Run `npm run test:e2e`
- [ ] Upload Playwright HTML report as artifact on failure

**Done when**
- A test PR to `main` runs the e2e workflow and produces a downloadable Playwright report.

---

### M1-3: Branch protection + CI status badge

**Labels:** `area:devops`, `type:infra`, `priority:p1`
**Milestone:** M1
**Depends on:** M1-1, M1-2

**Tasks**
- [ ] Set `main` as protected branch
- [ ] Require all CI jobs (lint, test-backend, test-buyer, test-admin, e2e) to pass before merge
- [ ] Add CI status badge to root `README.md`

**Done when**
- A deliberately broken test on a PR to `main` blocks the merge button; badge in README reflects current build state.

---

## Milestone M2 — Docker + Local Compose

### M2-1: Backend Dockerfile

**Labels:** `area:backend`, `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M2
**Depends on:** M0-2

**Tasks**
- [ ] Multi-stage `backend/Dockerfile`: `node:24-alpine` builder, final image from `node:24-alpine`
- [ ] Stage 1 (`builder`): copy `package*.json`, `npm ci`, copy source, `npm run build` (outputs to `dist/`)
- [ ] Stage 2 (`runner`): copy production `node_modules` and `dist/` from builder
- [ ] Expose port `5000`; `CMD ["node", "dist/index.js"]`
- [ ] Add `backend/.dockerignore` excluding `node_modules`, `__tests__`, `.env`, `coverage`

**Done when**
- `docker build backend/` completes and the resulting image starts with `GET /health` returning ok.

---

### M2-2: Buyer App Dockerfile + nginx config

**Labels:** `area:buyer-app`, `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M2
**Depends on:** M0-3

**Tasks**
- [ ] Stage 1 (`builder`): `node:24-alpine`, `npm ci`, `npm run build` (outputs to `dist/`)
- [ ] Stage 2 (`runner`): `nginx:alpine`, copy `dist/` to `/usr/share/nginx/html`
- [ ] Add `buyer-app/nginx.conf` rewriting all paths to `index.html` (SPA fallback)
- [ ] Expose port `80`
- [ ] `buyer-app/.dockerignore`

**Done when**
- `docker run` of the built image serves the buyer-app and SPA deep links work.

---

### M2-3: Admin App Dockerfile + nginx config

**Labels:** `area:admin-app`, `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M2
**Depends on:** M0-4

**Tasks**
- [ ] Same multi-stage pattern as M2-2 for `admin-app/`
- [ ] `admin-app/nginx.conf` with SPA fallback
- [ ] Expose port `80`
- [ ] `admin-app/.dockerignore`

**Done when**
- Container serves the admin-app login page on port 80.

---

### M2-4: docker-compose.yml + env templates

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M2
**Depends on:** M2-1, M2-2, M2-3

**Tasks**
- [ ] Root `docker-compose.yml`:
  - `mongo`: `mongo:8`, named volume `mongo-data`, no external port
  - `backend`: build `./backend`, env from `.env.docker`, depends on `mongo`, `5000:5000`
  - `buyer-app`: build `./buyer-app`, `3000:80`, depends on `backend`
  - `admin-app`: build `./admin-app`, `3001:80`, depends on `backend`
  - All services on shared `app-network` bridge
- [ ] `.env.docker.example` at root with all variables documented
- [ ] `docker-compose.override.yml` for development with source-mount hot-reload via `nodemon`

**Done when**
- `docker compose up --build` brings up the full stack; `docker compose down -v` cleans up.

---

### M2-5: Compose flow documentation

**Labels:** `type:docs`, `priority:p1`
**Milestone:** M2
**Depends on:** M2-4

**Tasks**
- [ ] Document `docker compose up --build` flow in root `README.md`
- [ ] Document required `.env.docker` keys with example values (no secrets)
- [ ] Note ports (3000 buyer, 3001 admin, 5000 backend) and how to reach each

**Done when**
- A new dev can clone the repo, copy `.env.docker.example`, and bring up the stack purely from the README.

---

## Milestone M3 — CloudClusters VPS Deployment

### M3-1: VPS initial setup

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M3
**Depends on:** M2-4

**Tasks**
- [ ] SSH into the CloudClusters VPS; confirm root/sudo access
- [ ] `apt update && apt upgrade -y`
- [ ] Install Docker Engine from the official Docker repo (not apt default)
- [ ] Install Docker Compose plugin v2
- [ ] Create non-root `deploy` user; add to `docker` group
- [ ] Set up SSH key auth for `deploy`; disable password SSH login

**Done when**
- `ssh deploy@<VPS_IP>` works with key auth; `docker --version` and `docker compose version` succeed.

---

### M3-2: VPS repository + production env

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M3
**Depends on:** M3-1

**Tasks**
- [ ] Clone the repo into `/home/deploy/online-store-01`
- [ ] Create `/home/deploy/online-store-01/.env.production` with all production secrets (never committed)
- [ ] `chmod 600 .env.production`

**Done when**
- `.env.production` exists, owned by `deploy`, mode 600, and contains every variable from the appendix table.

---

### M3-3: VPS initial deployment + firewall

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M3
**Depends on:** M3-2

**Tasks**
- [ ] On VPS: `docker compose -f docker-compose.yml --env-file .env.production up -d --build`
- [ ] Confirm all four containers are running via `docker compose ps`
- [ ] Configure UFW: allow SSH (22), HTTP (80), 3000, 3001, 5000; deny everything else

**Done when**
- `curl http://<VPS_IP>:5000/health` returns ok from an external machine; ports 3000 and 3001 load the apps.

---

### M3-4: CD deploy workflow

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M3
**Depends on:** M3-3, M1-1

**Tasks**
- [ ] Add GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- [ ] `.github/workflows/deploy.yml`: trigger on push to `main` after CI passes
- [ ] Use `appleboy/ssh-action` to run `git pull && docker compose up -d --build` on the VPS
- [ ] Smoke step: `curl --fail http://<VPS_IP>:5000/health` after deploy

**Done when**
- A merge to `main` triggers the deploy workflow and the VPS picks up the new code automatically.

---

## Milestone M4 — Domain Mapping + SSL (Staging)

### M4-1: DNS records for staging subdomains

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M4
**Depends on:** M3-3

**Tasks**
- [ ] Create three A records pointing to the VPS IP at the registrar:
  - `staging.yourdomain.com`
  - `api.staging.yourdomain.com`
  - `admin.staging.yourdomain.com`
- [ ] Verify propagation: `nslookup staging.yourdomain.com` returns VPS IP

**Done when**
- All three subdomains resolve to the VPS IP from a public DNS resolver.

---

### M4-2: Nginx + Certbot services + config

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M4
**Depends on:** M2-4, M4-1

**Tasks**
- [ ] Add `nginx` service to `docker-compose.yml`: `nginx:alpine`, ports `80:80`, `443:443`
- [ ] Add `certbot` service: `certbot/certbot`, shared volumes for certs and webroot
- [ ] `nginx/conf.d/staging.conf`:
  - HTTP block on 80 serving `/.well-known/acme-challenge/`, redirecting all else to HTTPS
  - HTTPS block on 443 with cert paths, proxying to `buyer-app:80`
  - Same pattern for `api.staging` → `backend:5000` and `admin.staging` → `admin-app:80`
- [ ] Remove direct port exposure for `backend`, `buyer-app`, `admin-app` (traffic via Nginx only)
- [ ] Update UFW: close 3000, 3001, 5000 externally; keep 80 and 443

**Done when**
- HTTP requests redirect to HTTPS (cert handshake will fail until M4-3 issues certs).

---

### M4-3: SSL certificate issuance + renewal cron

**Labels:** `area:devops`, `type:infra`, `priority:p0`
**Milestone:** M4
**Depends on:** M4-2

**Tasks**
- [ ] Initial Certbot challenge: `docker compose run certbot certonly --webroot ...` for all three subdomains
- [ ] Confirm certs in shared volume
- [ ] Reload Nginx: `docker compose exec nginx nginx -s reload`
- [ ] Add VPS cron: `0 3 * * * docker compose run certbot renew && docker compose exec nginx nginx -s reload`

**Done when**
- All three subdomains serve a valid certificate; SSL Labs scores A or better; renewal cron is in `crontab -l`.

---

### M4-4: App config for HTTPS staging

**Labels:** `area:backend`, `area:buyer-app`, `area:admin-app`, `type:infra`, `priority:p0`
**Milestone:** M4
**Depends on:** M4-3

**Tasks**
- [ ] Update `VITE_API_URL` in buyer-app and admin-app production `.env` to `https://api.staging.yourdomain.com`
- [ ] Update `CORS_ORIGIN` in backend `.env` to allow `https://staging.yourdomain.com` and `https://admin.staging.yourdomain.com`
- [ ] Rebuild and redeploy: `docker compose up -d --build`

**Done when**
- Frontend apps successfully call the backend at `https://api.staging.yourdomain.com` with no CORS errors.

---

## Milestone M5 — Authentication + User Sessions

### M5-1: Backend auth routes, models + middleware

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M5
**Depends on:** M0-2

**Tasks**
- [ ] `User` Mongoose model (SRS §10.1) with fields and indexes (`email` unique, `googleId` sparse)
- [ ] `POST /api/auth/register` — Zod validation, Argon2id hash, send verification stub
- [ ] `POST /api/auth/login` — RS256 JWT (15min) + refresh token in `httpOnly` cookie (7d)
- [ ] `POST /api/auth/google` — verify Google ID token via `google-auth-library`, find-or-create
- [ ] `POST /api/auth/refresh` — verify hashed refresh token, issue new access token
- [ ] `POST /api/auth/logout` — clear cookie, nullify refresh token
- [ ] `GET /api/auth/me` — return current user (auth required)
- [ ] `PATCH /api/users/profile` — update `fullName`, `avatar`
- [ ] `PATCH /api/users/password` — verify current, hash new
- [ ] `auth.middleware.ts` — Bearer token, RS256 verify, attach `req.user`
- [ ] `admin.middleware.ts` — guard on `req.user.role === 'admin'`, 403 otherwise
- [ ] Apply `express-rate-limit` to `/api/auth/*` (10 req / 15 min / IP)
- [ ] Seed script: default admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

**Done when**
- All routes respond per spec via Postman; admin seed creates the default admin on first boot.

---

### M5-2: Buyer App auth flows + guards

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M5
**Depends on:** M5-1

**Tasks**
- [ ] Redux `authSlice`: state `{ user, accessToken, status }`; actions `setCredentials`, `clearCredentials`
- [ ] `authApi` (RTK Query): `register`, `login`, `googleLogin`, `logout`, `getMe`
- [ ] Axios instance in `src/lib/axios.ts`: attaches `Authorization: Bearer`, 401 interceptor calls refresh + retries
- [ ] `Register.tsx`: `react-hook-form` + Zod (full name, email, password ≥8, confirm password); toasts
- [ ] `Login.tsx`: email/password form + Google One Tap via `@react-oauth/google`
- [ ] `Profile.tsx`: show user info, update name/avatar form, change password form
- [ ] `ProtectedRoute` wrapper: redirects unauthenticated to `/login`
- [ ] `accessToken` in Redux memory only (not localStorage); re-fetch on app mount via `getMe`

**Done when**
- A new buyer can register, log in (email and Google), refresh, and stay logged in across reloads.

---

### M5-3: Admin App auth flow

**Labels:** `area:admin-app`, `type:feature`, `priority:p0`
**Milestone:** M5
**Depends on:** M5-1

**Tasks**
- [ ] Redux `authSlice` (same pattern as buyer-app)
- [ ] Admin `Login.tsx`: email/password only (no Google One Tap)
- [ ] `AdminRoute` wrapper: blocks non-admin users

**Done when**
- Admin login with admin credentials reaches the dashboard; buyer credentials are rejected.

---

### M5-4: Auth test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M5
**Depends on:** M5-1, M5-2, M5-3

**Tasks (Backend — Vitest + Supertest)**
- [ ] `POST /api/auth/register` — happy, duplicate (409), weak password (400)
- [ ] `POST /api/auth/login` — valid, wrong password (generic error), inactive (403)
- [ ] `POST /api/auth/google` — valid token (mocked), invalid (401)
- [ ] `POST /api/auth/refresh` — valid cookie, expired/missing (401)
- [ ] `POST /api/auth/logout` — clears cookie, refresh token nullified
- [ ] `auth.middleware.ts` — valid token passes; missing/expired/tampered → 401
- [ ] `admin.middleware.ts` — admin passes; buyer 403

**Tasks (Buyer App — Vitest + RTK)**
- [ ] `authSlice` — `setCredentials` / `clearCredentials` reducers
- [ ] `Register.tsx` — fields, validation, submit dispatch
- [ ] `Login.tsx` — email/password submit, Google One Tap
- [ ] Axios interceptor — 401 triggers refresh and retry

**Done when**
- ≥80% coverage on `auth.controller.ts`; rate limiter returns 429 after 10 failed logins in 15 min.

---

## Milestone M6 — Book Catalogue + Admin Book Management

### M6-1: Backend book catalogue + admin management

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M6
**Depends on:** M5-1

**Tasks**
- [ ] `Book` Mongoose model (SRS §10.2) with indexes (`category`, `isPublished`, `price`)
- [ ] `r2.service.ts`: `uploadFile`, `deleteFile`, `getPresignedGetUrl` (`@aws-sdk/client-s3` + presigner)
- [ ] `image.service.ts`: cover resize → 400×600 WebP via `sharp`
- [ ] `GET /api/books` — paginated (12/page), filters: category, price range, min rating; published only
- [ ] `GET /api/books/:id` — full detail with public R2 cover URL
- [ ] `GET /api/books/search?q=` — text index on title/author/description, supports filters
- [ ] `GET /api/books/featured` — top 8 by `totalSales`
- [ ] `GET /api/books/new-releases` — 8 most recent published
- [ ] `POST /api/admin/books` — multipart via Multer, Zod validation, Sharp resize, R2 upload (cover public, PDF private), `isPublished: false`
- [ ] `PATCH /api/admin/books/:id` — partial update, replace files only when provided, delete old R2 files when replaced
- [ ] `DELETE /api/admin/books/:id` — soft if orders exist, hard + R2 cleanup otherwise
- [ ] `PATCH /api/admin/books/:id/publish` — toggle `isPublished`; 409 with warning when unpublishing a book with orders
- [ ] `POST /api/admin/books/bulk` — `{ ids, action: 'publish' | 'unpublish' | 'delete' }`

**Done when**
- All routes respond per spec; uploads land in the correct R2 buckets; cover URL is publicly fetchable.

---

### M6-2: Buyer App browse, search + detail

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M6
**Depends on:** M6-1

**Tasks**
- [ ] `booksApi` (RTK Query): `getBooks`, `getBook`, `searchBooks`, `getFeatured`, `getNewReleases`, `getByCategory`
- [ ] `Home.tsx`: Featured / New Releases / Bestsellers, 8 cards each
- [ ] `BookCard.tsx`: cover, title, author, price, rating stars
- [ ] `BookGrid.tsx`: responsive grid
- [ ] `Search.tsx`: search bar (debounced 300ms), filter sidebar (price slider, category checkboxes, min rating), pagination
- [ ] `Category.tsx`: books filtered by category, paginated
- [ ] `BookDetail.tsx`: cover, title, author, description, price, rating + count, "Already in your library" badge, related books, sample preview (PDF viewer if `samplePdfKey`)
- [ ] Navbar search bar → `/search?q=`

**Done when**
- Home shows three sections; search + filters return correct results; book detail loads from API.

---

### M6-3: Admin App book CRUD + bulk actions

**Labels:** `area:admin-app`, `type:feature`, `priority:p0`
**Milestone:** M6
**Depends on:** M6-1

**Tasks**
- [ ] `Books.tsx`: TanStack Table — cover, title, category, price, published, created date, actions; bulk-select checkboxes
- [ ] `BookForm.tsx`: `react-hook-form` + Zod; cover dropzone (react-dropzone), PDF dropzone, sample PDF dropzone; cover preview before upload
- [ ] Bulk action toolbar: Publish / Unpublish / Delete, disabled when no rows selected
- [ ] Publish toggle in row actions with confirmation dialog

**Done when**
- Admin can add a book with PDF + cover, edit, publish/unpublish (with confirmation), bulk-delete.

---

### M6-4: Catalogue test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M6
**Depends on:** M6-1, M6-2, M6-3

**Tasks (Backend)**
- [ ] `GET /api/books` — pagination, category filter, price filter, only published returned
- [ ] `GET /api/books/search` — title/author/description match, pagination, excludes unpublished
- [ ] `POST /api/admin/books` — happy (mock R2 + Sharp), missing field (400), non-admin (403)
- [ ] `DELETE /api/admin/books/:id` — soft when orders exist, hard otherwise (mock R2 delete)
- [ ] `r2.service.ts` — upload, delete, presigned URL (mock `@aws-sdk/client-s3`)
- [ ] `image.service.ts` — output dimensions and format (mock `sharp`)

**Tasks (Buyer App)**
- [ ] `BookCard` renders title, author, price, rating
- [ ] `Search` debounces input and passes filters
- [ ] `BookDetail` shows "Already in your library" when applicable

**Done when**
- ≥80% coverage on R2 + image services; buyer/admin component tests green.

---

## Milestone M7 — Cart + Wishlist

### M7-1: Backend wishlist API

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M7
**Depends on:** M6-1

**Tasks**
- [ ] `Wishlist` Mongoose model (SRS §10.5): `userId`, `books` (array of Book refs)
- [ ] `GET /api/wishlist` (auth) — populated wishlist for current user
- [ ] `POST /api/wishlist/:bookId` (auth) — adds book; 409 if already present
- [ ] `DELETE /api/wishlist/:bookId` (auth) — removes book

**Done when**
- All three routes respond per spec; one wishlist per user persists across sessions.

---

### M7-2: Buyer App cart + wishlist UI

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M7
**Depends on:** M7-1

**Tasks**
- [ ] Redux `cartSlice`: `{ items: CartItem[] }`, actions `addToCart`, `removeFromCart`, `clearCart`; guards: no duplicates, no already-owned (cross-ref order history)
- [ ] `wishlistApi` (RTK Query): `getWishlist`, `addToWishlist`, `removeFromWishlist`
- [ ] `CartDrawer.tsx`: slide-in drawer with cover/title/price, per-item remove, total, "Proceed to Checkout"
- [ ] Wishlist toggle (heart icon) on `BookCard` + `BookDetail`
- [ ] Wishlist page: list, "Add to Cart" per item (dispatches `addToCart` and `removeFromWishlist`)
- [ ] Sonner toasts: "Added to cart", "Removed from wishlist", "Already in your library"
- [ ] Cart badge on Navbar (derived from `cartSlice.items.length`)
- [ ] On login, dispatch `getWishlist` to sync

**Done when**
- Adding/removing cart and wishlist items works as specified; duplicates and owned books are blocked.

---

### M7-3: Cart + wishlist test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M7
**Depends on:** M7-1, M7-2

**Tasks (Backend)**
- [ ] `GET /api/wishlist` — empty for new user, items for existing
- [ ] `POST /api/wishlist/:bookId` — adds, 409 duplicate, 404 invalid id
- [ ] `DELETE /api/wishlist/:bookId` — removes, 404 if missing

**Tasks (Buyer App)**
- [ ] `cartSlice` — add adds; duplicate ignored; owned blocked
- [ ] `cartSlice` — remove removes correct item
- [ ] `CartDrawer` renders items; remove button calls `removeFromCart`

**Done when**
- All listed unit/integration tests pass.

---

## Milestone M8 — Checkout + Razorpay Payment

### M8-1: Backend orders + Razorpay integration

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M8
**Depends on:** M7-1

**Tasks**
- [ ] `Order` Mongoose model (SRS §10.3): `buyerId`, `books[]` with `priceAtPurchase` and `downloadCount`, `totalAmount`, `razorpayOrderId` (unique), `razorpayPaymentId`, `status`, `createdAt`
- [ ] `razorpay.service.ts`: `createOrder(amountInPaise, currency)`, `verifyWebhookSignature`, `createRefund(paymentId, amount)`
- [ ] `POST /api/orders/create` (auth) — validate cart (exists + published), compute total, create Razorpay order, save Order pending, return `{ razorpayOrderId, amount, currency, keyId }`
- [ ] `POST /api/orders/webhook` (public) — verify HMAC `X-Razorpay-Signature`; on `payment.captured`: mark Order paid + store `razorpayPaymentId`; idempotent (return 200 if already paid); queue confirmation email (M12 stub)
- [ ] `GET /api/orders` (auth) — paginated history for current user

**Done when**
- Test-mode Razorpay payment flips an order to `paid` via webhook; duplicate webhook is a no-op; tampered HMAC returns 400.

---

### M8-2: Buyer App checkout + order history

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M8
**Depends on:** M8-1

**Tasks**
- [ ] `ordersApi` (RTK Query): `createOrder`, `getOrderHistory`
- [ ] `Checkout.tsx`: cart items, total, "Pay Now"
- [ ] On Pay Now: call `createOrder`, dynamically load Razorpay checkout script, open widget with `razorpayOrderId` + `keyId`
- [ ] Widget `onSuccess`: success toast, `clearCart`, navigate to `/library`
- [ ] Widget `onDismiss` / `onError`: error toast, keep cart intact
- [ ] `OrderHistory.tsx`: list of past orders with status badges

**Done when**
- The widget opens with the right amount; successful test payment redirects to `/library`; order history reflects status.

---

### M8-3: Payment test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M8
**Depends on:** M8-1, M8-2

**Tasks**
- [ ] `POST /api/orders/create` — happy (mock Razorpay), unpublished/missing book (400), unauth (401)
- [ ] `POST /api/orders/webhook` — valid sig + `payment.captured` flips status; invalid sig (400); duplicate event (200, no side effect)
- [ ] `razorpay.service.verifyWebhookSignature` — correct HMAC passes, tampered fails
- [ ] Idempotency: repeated webhook does not create a second `paid` event or duplicate email

**Done when**
- All listed tests green; idempotency verified by replaying a captured event twice.

---

## Milestone M9 — My Library + Secure PDF Download

### M9-1: Backend library + secure download

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M9
**Depends on:** M8-1

**Tasks**
- [ ] `GET /api/library` (auth) — all `paid` orders for the user; flatten books with `downloadCount` and `downloadLimit: 5`
- [ ] `GET /api/library/:bookId/download` (auth):
  - Find paid order containing `bookId` for current user; 404 otherwise
  - Enforce `downloadCount < 5` (403 with "Download limit reached" otherwise)
  - `r2.service.getPresignedGetUrl(book.pdfKey, 900)` (15 min)
  - Increment `downloadCount` for that book in the order
  - Return `{ url }`

**Done when**
- 5th download succeeds, 6th returns 403; presigned URL works in a browser; users cannot access other users' books.

---

### M9-2: Buyer App library page + download

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M9
**Depends on:** M9-1

**Tasks**
- [ ] `libraryApi` (RTK Query): `getLibrary`, `getDownloadUrl`
- [ ] `Library.tsx`: grid of purchased books — cover, title, author, remaining downloads (`5 - downloadCount`), Download button
- [ ] On Download: call `getDownloadUrl`, open returned URL in a new tab
- [ ] 403 → "Download limit reached" toast with support contact link
- [ ] Optimistically decrement remaining downloads in UI on success

**Done when**
- Library shows purchased books only; download opens the PDF; remaining count updates correctly.

---

### M9-3: Library test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M9
**Depends on:** M9-1, M9-2

**Tasks (Backend)**
- [ ] `GET /api/library` — only paid orders for requesting user
- [ ] `GET /api/library/:bookId/download` — happy + increments `downloadCount`
- [ ] 5th success, 6th 403
- [ ] Unauth → 401; book not in library → 404

**Tasks (Buyer App)**
- [ ] `Library.tsx` renders mocked books
- [ ] Download click calls `getDownloadUrl`, opens new tab (mock `window.open`)
- [ ] 403 shows the limit-reached toast

**Done when**
- All listed tests green.

---

## Milestone M10 — Reviews + Ratings

### M10-1: Backend reviews + admin moderation

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M10
**Depends on:** M9-1

**Tasks**
- [ ] `Review` Mongoose model (SRS §10.4) with compound unique `{ bookId, buyerId }`
- [ ] `POST /api/reviews/:bookId` (auth) — verify buyer has paid order for the book (403 otherwise); upsert review (replace on resubmit); recalculate `Book.averageRating` + `reviewCount` via aggregation
- [ ] `GET /api/reviews/:bookId` (public) — approved + non-flagged sorted by `createdAt` desc, with average and count
- [ ] `POST /api/reviews/:reviewId/flag` (auth) — set `isFlagged: true`
- [ ] `GET /api/admin/reviews/flagged` (admin) — flagged list
- [ ] `PATCH /api/admin/reviews/:reviewId` (admin) — `{ action: 'approve' | 'remove' }`; approve resets flag; remove deletes + recalculates

**Done when**
- All routes respond per spec; review submission updates book averages correctly.

---

### M10-2: Buyer App review form + list

**Labels:** `area:buyer-app`, `type:feature`, `priority:p0`
**Milestone:** M10
**Depends on:** M10-1

**Tasks**
- [ ] `reviewsApi` (RTK Query): `getReviews`, `submitReview`, `flagReview`
- [ ] `ReviewList.tsx`: stars, buyer name, date, text, flag button
- [ ] `RatingStars.tsx`: read-only and interactive variants
- [ ] Add review submission form to `BookDetail.tsx`: shown only to buyers who have purchased; 1–5 stars + optional text; pre-populated when an existing review is found

**Done when**
- A buyer who owns the book can submit / replace a review; non-owners do not see the form.

---

### M10-3: Admin App moderation queue

**Labels:** `area:admin-app`, `type:feature`, `priority:p1`
**Milestone:** M10
**Depends on:** M10-1

**Tasks**
- [ ] `Reviews.tsx`: table of flagged reviews with buyer name, book title, text, rating, flag count
- [ ] Approve and Remove action buttons per row

**Done when**
- Admin can approve or remove flagged reviews; approved ones return to the public list.

---

### M10-4: Reviews test suite

**Labels:** `type:test`, `priority:p1`
**Milestone:** M10
**Depends on:** M10-1, M10-2, M10-3

**Tasks (Backend)**
- [ ] `POST /api/reviews/:bookId` — happy, no purchase (403), resubmit replaces, average recalculated
- [ ] `GET /api/reviews/:bookId` — approved + non-flagged only; correct average
- [ ] `POST /api/reviews/:reviewId/flag` — sets flag
- [ ] Admin approve — `isApproved: true`, removed from flagged
- [ ] Admin remove — deletes, average + count recalculated

**Tasks (Buyer App)**
- [ ] `ReviewList` renders correct star count
- [ ] Form hidden when not purchased; visible + pre-populated when prior review exists

**Done when**
- All listed tests green.

---

## Milestone M11 — Admin Dashboard, Orders + Customer Management

### M11-1: Backend admin dashboard, orders + customers

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M11
**Depends on:** M8-1

**Tasks**
- [ ] `GET /api/admin/dashboard` — total revenue, today's, this month's, total orders, today's orders, top 5 books by revenue (aggregation pipeline)
- [ ] `GET /api/admin/orders` — paginated (20/page), filter by status + date range, search by buyer email, populate buyer + books
- [ ] `GET /api/admin/orders/:id` — full detail with payment id and per-book download counts
- [ ] `POST /api/admin/orders/:id/refund` — call `razorpay.service.createRefund`, set status `refunded`, reset `downloadCount` to block further downloads
- [ ] `GET /api/admin/customers` — paginated, searchable by name/email, aggregate `totalOrders` + `totalSpend`
- [ ] `GET /api/admin/customers/:id` — profile + full history
- [ ] `PATCH /api/admin/customers/:id/suspend` — set `isActive: false`; subsequent login → 403 with suspension message
- [ ] `StoreSettings` model: `storeName`, `storeLogo`, `contactEmail`, `emailTemplate`
- [ ] `GET /api/admin/settings` and `PATCH /api/admin/settings`

**Done when**
- All routes respond per spec; refund disables downloads; suspended buyer cannot log in.

---

### M11-2: Admin App dashboard, orders, customers + settings

**Labels:** `area:admin-app`, `type:feature`, `priority:p0`
**Milestone:** M11
**Depends on:** M11-1

**Tasks**
- [ ] `Dashboard.tsx`: stat cards (total revenue, today, month, total orders), top 5 books table, recent orders feed (last 10)
- [ ] `Orders.tsx`: filterable/searchable DataTable, status filter chips, date range picker, pagination
- [ ] `OrderDetail.tsx`: buyer info, books, download counts, refund button with confirmation dialog
- [ ] `Customers.tsx`: searchable DataTable — name, email, registration date, total orders, total spend, suspend button
- [ ] `CustomerDetail.tsx`: profile + full order history
- [ ] `Settings.tsx`: store name, logo upload, contact email, email template textarea, Razorpay webhook URL display

**Done when**
- All admin screens render with live data; refund and suspend actions take effect end-to-end.

---

### M11-3: Admin management test suite

**Labels:** `type:test`, `priority:p0`
**Milestone:** M11
**Depends on:** M11-1, M11-2

**Tasks (Backend)**
- [ ] `GET /api/admin/dashboard` — revenue aggregation against seeded test orders
- [ ] `GET /api/admin/orders` — pagination, status filter, date range filter
- [ ] `POST /api/admin/orders/:id/refund` — calls Razorpay mock, status updated, downloads blocked
- [ ] `PATCH /api/admin/customers/:id/suspend` — `isActive: false`; subsequent login → 403

**Tasks (Admin App)**
- [ ] `Dashboard` renders stat cards from mocked RTK Query
- [ ] Refund button shows confirmation dialog and dispatches mutation only after confirm

**Done when**
- All listed tests green.

---

## Milestone M12 — Email Notifications + Contact/Support

### M12-1: Backend email service + contact route

**Labels:** `area:backend`, `type:feature`, `priority:p0`
**Milestone:** M12
**Depends on:** M8-1, M11-1

**Tasks**
- [ ] Implement `email.service.ts` fully: `sendOrderConfirmation(buyer, order, books)` and `sendContactMessage(name, email, subject, message)`
- [ ] `sendOrderConfirmation`: HTML email with order id, books (title + price), total, link to `https://staging.yourdomain.com/library`; uses `StoreSettings.emailTemplate`
- [ ] Wire confirmation trigger: after webhook marks order paid, call `sendOrderConfirmation` fire-and-forget with error logging (do NOT fail webhook on email error)
- [ ] `POST /api/contact` (public) — Zod validate (name, email, subject, message), call `sendContactMessage`, return 200

**Done when**
- Test-mode payment delivers a confirmation email to a Mailtrap inbox; contact form delivers to admin email; email failure does not break the webhook response.

---

### M12-2: Buyer App contact + FAQ pages

**Labels:** `area:buyer-app`, `type:feature`, `priority:p1`
**Milestone:** M12
**Depends on:** M12-1

**Tasks**
- [ ] `Contact.tsx`: name, email, subject (select), message textarea; submit → `POST /api/contact`; success toast
- [ ] `FAQ.tsx`: static accordion with 8–10 questions (download limits, refund policy, formats, account creation, etc.)

**Done when**
- Contact submission triggers an email and shows success; FAQ is reachable from the footer.

---

### M12-3: Email test suite

**Labels:** `type:test`, `priority:p1`
**Milestone:** M12
**Depends on:** M12-1

**Tasks**
- [ ] `email.service.sendOrderConfirmation` — calls `transporter.sendMail` with correct `to`, `subject`, body containing order id (mock Nodemailer)
- [ ] `email.service.sendContactMessage` — sends to configured admin email
- [ ] `POST /api/contact` — valid body triggers send; invalid → 400
- [ ] Webhook handler: simulated SMTP error does not cause webhook to return non-200

**Done when**
- All listed tests green.

---

## Appendix: How to Use This Document

1. **Create labels** in GitHub matching the schema in the header table.
2. **Create the 13 milestones** matching `MILESTONES.md` (M0–M12).
3. **For each issue here**: open a new GitHub Issue, paste title + body, attach labels, assign milestone, and link dependencies via "Linked issues" or `Depends on #<number>` in the body.
4. **Suggested order**: complete all M0 issues before M1; M1 before M2; M5 before any feature milestone (M6+).
5. Use `gh` CLI for bulk creation if preferred — each section maps cleanly to one `gh issue create` invocation.
