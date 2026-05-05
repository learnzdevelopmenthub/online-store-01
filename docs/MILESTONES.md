# Product Development Milestones

## Digital PDF Bookstore — MERN Stack

| Field | Detail |
|---|---|
| Version | 1.0.0 |
| Date | April 24, 2026 |
| Repo | `online-store-01` (monorepo) |
| Apps | `backend` · `buyer-app` · `admin-app` · `e2e` |

Each milestone below is written as a self-contained GitHub Issue. Copy the body directly into a GitHub Issue, assign it to the matching milestone, and use the task checklist to track progress.

---

## Milestone Index

| # | Title | Type | Depends On |
|---|---|---|---|
| [M0](#m0-monorepo-scaffold--test-suite-setup) | Monorepo Scaffold + Test Suite Setup | Infrastructure | — |
| [M1](#m1-ci-pipeline--github-actions) | CI Pipeline — GitHub Actions | Infrastructure | M0 |
| [M2](#m2-docker--local-compose) | Docker + Local Compose | Infrastructure | M0 |
| [M3](#m3-cloudclusters-vps-deployment) | CloudClusters VPS Deployment | Infrastructure | M2 |
| [M4](#m4-domain-mapping--ssl-staging) | Domain Mapping + SSL — Staging | Infrastructure | M3 |
| [M5](#m5-authentication--user-sessions) | Authentication + User Sessions | Feature | M0 |
| [M6](#m6-book-catalogue--admin-book-management) | Book Catalogue + Admin Book Management | Feature | M5 |
| [M7](#m7-cart--wishlist) | Cart + Wishlist | Feature | M6 |
| [M8](#m8-checkout--razorpay-payment) | Checkout + Razorpay Payment | Feature | M7 |
| [M9](#m9-my-library--secure-pdf-download) | My Library + Secure PDF Download | Feature | M8 |
| [M10](#m10-reviews--ratings) | Reviews + Ratings | Feature | M9 |
| [M11](#m11-admin-dashboard-orders--customer-management) | Admin Dashboard, Orders + Customer Management | Feature | M8 |
| [M12](#m12-email-notifications--contact-support) | Email Notifications + Contact/Support | Feature | M8 |

---

## M0: Monorepo Scaffold + Test Suite Setup

**Type:** Infrastructure
**Goal:** Every app in the monorepo is initialised, TypeScript compiles cleanly, and the full test suite (unit, integration, and e2e) can be run from the root with a single command.

### Context

This is the foundation all other milestones depend on. No feature work begins until every app boots, lints, and has at least one passing test in each layer. The monorepo uses a shared root `package.json` with workspaces pointing to `backend/`, `buyer-app/`, `admin-app/`, and `e2e/`.

### Tasks

**Monorepo root**
- [ ] Initialise root `package.json` with npm workspaces for `backend`, `buyer-app`, `admin-app`, `e2e`
- [ ] Add root-level scripts: `test`, `test:backend`, `test:buyer`, `test:admin`, `test:e2e`, `lint`, `build`
- [ ] Add `.nvmrc` / `.node-version` pinned to Node.js v24
- [ ] Configure root ESLint (`eslint.config.ts`) with TypeScript rules shared across all apps
- [ ] Configure root Prettier (`.prettierrc`) with a single style baseline
- [ ] Add `.gitignore` covering `node_modules`, `dist`, `.env`, coverage reports, Playwright reports

**Backend (`backend/`)**
- [ ] Initialise `package.json` with all backend dependencies (see SRS §7.2)
- [ ] Configure `tsconfig.json` targeting Node 24 with strict mode
- [ ] Scaffold folder structure: `src/config`, `src/controllers`, `src/middleware`, `src/models`, `src/routes`, `src/services`, `src/schemas`, `src/utils`
- [ ] Create `src/app.ts` (Express app, no routes yet — just health check `GET /health`)
- [ ] Create `src/index.ts` (server entry point — binds port, calls `connectDB()`)
- [ ] Add `.env.example` with all required keys documented (see SRS §16)
- [ ] Configure Vitest (`vitest.config.ts`) with `environment: 'node'`, coverage via `@vitest/coverage-v8`
- [ ] Write one passing smoke test: `GET /health` returns `{ status: 'ok' }` using Supertest

**Buyer App (`buyer-app/`)**
- [ ] Scaffold Vite + React 19 + TypeScript project
- [ ] Install all frontend dependencies (see SRS §7.3)
- [ ] Configure Tailwind v4 + DaisyUI v5
- [ ] Configure `vitest.config.ts` with `environment: 'happy-dom'` and coverage
- [ ] Set up MSW: create `src/mocks/handlers.ts` and `src/mocks/server.ts`
- [ ] Write one passing smoke test: renders `<App />` without crashing
- [ ] Add `.env.example` documenting `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_RAZORPAY_KEY`

**Admin App (`admin-app/`)**
- [ ] Scaffold Vite + React 19 + TypeScript project (same baseline as buyer-app)
- [ ] Install all frontend dependencies including admin-specific packages (see SRS §7.4)
- [ ] Configure Tailwind v4 + DaisyUI v5
- [ ] Configure `vitest.config.ts` with `environment: 'happy-dom'` and coverage
- [ ] Set up MSW handlers and server
- [ ] Write one passing smoke test: renders `<App />` without crashing
- [ ] Add `.env.example`

**E2E (`e2e/`)**
- [ ] Initialise `package.json` with `@playwright/test`
- [ ] Configure `playwright.config.ts`: Chromium + Firefox + Safari (WebKit), base URL from env
- [ ] Create folder structure: `e2e/buyer/`, `e2e/admin/`
- [ ] Write one passing smoke test: navigate to `VITE_APP_URL`, assert page title is not empty

### Acceptance Criteria

- [ ] `npm run build` succeeds in all three apps with zero TypeScript errors
- [ ] `npm run lint` passes across all apps with zero errors
- [ ] `npm run test:backend` runs and reports ≥ 1 passing test
- [ ] `npm run test:buyer` runs and reports ≥ 1 passing test
- [ ] `npm run test:admin` runs and reports ≥ 1 passing test
- [ ] `npm run test:e2e` runs and reports ≥ 1 passing test
- [ ] `npm test` from the root triggers all of the above sequentially
- [ ] Coverage reports are generated in each app's `coverage/` folder
- [ ] No hardcoded secrets — all config via `.env.example` files

**Dependencies:** None — this is the root milestone.

---

## M1: CI Pipeline — GitHub Actions

**Type:** Infrastructure
**Goal:** Every push and every pull request targeting `main` automatically runs linting and the full test suite. A failing test or lint error blocks the merge.

### Context

CI is set up before any real features are built so that every subsequent milestone is covered automatically. This milestone creates two workflow files: a fast **lint + unit/integration** check that runs on every push, and a heavier **e2e** check that runs on PRs to `main`.

### Tasks

**Lint + Unit/Integration Workflow (`.github/workflows/ci.yml`)**
- [ ] Trigger on: `push` to all branches, `pull_request` targeting `main`
- [ ] Use `actions/checkout@v4` and `actions/setup-node@v4` with `node-version-file: '.nvmrc'`
- [ ] Cache `node_modules` using `actions/cache` keyed on `package-lock.json` hash
- [ ] Run `npm ci` at workspace root
- [ ] Job: `lint` — run `npm run lint` across all apps
- [ ] Job: `test-backend` — run `npm run test:backend` with coverage
- [ ] Job: `test-buyer` — run `npm run test:buyer` with coverage
- [ ] Job: `test-admin` — run `npm run test:admin` with coverage
- [ ] Upload coverage reports as workflow artifacts (retain 14 days)
- [ ] Jobs `test-backend`, `test-buyer`, `test-admin` run in parallel; `lint` runs independently

**E2E Workflow (`.github/workflows/e2e.yml`)**
- [ ] Trigger on: `pull_request` targeting `main` only
- [ ] Spin up a MongoDB service container (`mongo:8`) for the duration of the job
- [ ] Build all three apps and start backend + both frontends using the test `.env` values stored as GitHub Secrets
- [ ] Install Playwright browsers via `npx playwright install --with-deps`
- [ ] Run `npm run test:e2e`
- [ ] Upload Playwright HTML report as a workflow artifact on failure

**GitHub Repository Settings**
- [ ] Set `main` as the protected branch
- [ ] Require all CI jobs to pass before merge is allowed
- [ ] Add CI status badge to root `README.md`

### Acceptance Criteria

- [ ] A passing commit on any branch shows green checks for lint, test-backend, test-buyer, test-admin
- [ ] A PR to `main` additionally runs the e2e workflow
- [ ] A deliberately broken test (introduce a `expect(1).toBe(2)`) causes the pipeline to fail and blocks merge
- [ ] Coverage artifacts are downloadable from the Actions run summary
- [ ] The status badge in `README.md` reflects the current `main` build state

**Dependencies:** M0

---

## M2: Docker + Local Compose

**Type:** Infrastructure
**Goal:** The entire application stack (backend, buyer-app, admin-app, MongoDB) runs locally via `docker compose up` with a single command and is accessible in the browser.

### Context

Docker images built here are reused verbatim for the VPS deployment in M3. The local compose environment uses a `.env.docker` file that mirrors the production `.env` structure so there are no surprises when deploying.

### Tasks

**Backend Dockerfile (`backend/Dockerfile`)**
- [ ] Use multi-stage build: `node:24-alpine` as builder, final image from `node:24-alpine`
- [ ] Stage 1 (`builder`): copy `package*.json`, run `npm ci`, copy source, run `npm run build` (outputs to `dist/`)
- [ ] Stage 2 (`runner`): copy only `node_modules` (production) and `dist/` from builder
- [ ] Expose port `5000`
- [ ] `CMD ["node", "dist/index.js"]`
- [ ] Add `.dockerignore` excluding `node_modules`, `__tests__`, `.env`, `coverage`

**Buyer App Dockerfile (`buyer-app/Dockerfile`)**
- [ ] Stage 1 (`builder`): `node:24-alpine`, `npm ci`, `npm run build` (outputs to `dist/`)
- [ ] Stage 2 (`runner`): `nginx:alpine`, copy `dist/` to `/usr/share/nginx/html`
- [ ] Copy `nginx.conf` that rewrites all paths to `index.html` (SPA fallback)
- [ ] Expose port `80`

**Admin App Dockerfile (`admin-app/Dockerfile`)**
- [ ] Same pattern as buyer-app Dockerfile
- [ ] Expose port `80`

**Docker Compose (`docker-compose.yml` at repo root)**
- [ ] Service `mongo`: `mongo:8`, named volume `mongo-data`, no exposed ports externally
- [ ] Service `backend`: build from `./backend`, env from `.env.docker`, depends on `mongo`, port `5000:5000`
- [ ] Service `buyer-app`: build from `./buyer-app`, port `3000:80`, depends on `backend`
- [ ] Service `admin-app`: build from `./admin-app`, port `3001:80`, depends on `backend`
- [ ] All services on a shared `app-network` bridge network

**Configuration**
- [ ] Create `.env.docker.example` at root with all required environment variables documented
- [ ] Add `docker-compose.override.yml` for development (mounts source for hot-reload via `nodemon`)
- [ ] Document `docker compose up --build` flow in `README.md`

### Acceptance Criteria

- [ ] `docker compose up --build` completes without errors on a clean machine
- [ ] `GET http://localhost:5000/health` returns `{ "status": "ok" }`
- [ ] `http://localhost:3000` loads the buyer-app home page
- [ ] `http://localhost:3001` loads the admin-app login page
- [ ] `docker compose down -v` cleanly removes all containers and volumes
- [ ] No environment secrets are baked into any Docker image layer (verified via `docker history`)

**Dependencies:** M0

---

## M3: CloudClusters VPS Deployment

**Type:** Infrastructure
**Goal:** Docker images from M2 are deployed and running on the CloudClusters VPS. All three apps are accessible over HTTP on the VPS public IP address.

### Context

CloudClusters provides a managed VPS. The deployment uses the same `docker-compose.yml` from M2 with a production-specific `.env` file. This milestone establishes the staging server; HTTPS and a real domain come in M4.

### Tasks

**VPS Initial Setup**
- [ ] SSH into the CloudClusters VPS and confirm root/sudo access
- [ ] Update system packages: `apt update && apt upgrade -y`
- [ ] Install Docker Engine (official Docker repo, not `apt` default)
- [ ] Install Docker Compose plugin (`docker compose` v2)
- [ ] Create a non-root deploy user (`deploy`) and add to `docker` group
- [ ] Set up SSH key authentication for the `deploy` user; disable password SSH login

**Repository & Configuration on VPS**
- [ ] Clone the repository into `/home/deploy/online-store-01` on the VPS
- [ ] Create `/home/deploy/online-store-01/.env.production` with all production secrets (never commit this file)
- [ ] Set file permissions: `chmod 600 .env.production`

**Deployment**
- [ ] On VPS: `docker compose -f docker-compose.yml --env-file .env.production up -d --build`
- [ ] Confirm all four containers (`mongo`, `backend`, `buyer-app`, `admin-app`) are running via `docker compose ps`
- [ ] Configure UFW firewall: allow SSH (22), HTTP (80), ports 3000, 3001, 5000; deny everything else

**CI/CD Deployment Job (`.github/workflows/deploy.yml`)**
- [ ] Trigger on: push to `main` only (after CI passes)
- [ ] Use GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- [ ] Job: SSH into VPS via `appleboy/ssh-action`, run `git pull && docker compose up -d --build`
- [ ] Add a smoke-test step: `curl --fail http://<VPS_IP>:5000/health` after deploy

### Acceptance Criteria

- [ ] `curl http://<VPS_IP>:5000/health` returns `{ "status": "ok" }` from an external machine
- [ ] `http://<VPS_IP>:3000` loads the buyer-app home page in a browser
- [ ] `http://<VPS_IP>:3001` loads the admin-app login page in a browser
- [ ] Pushing a commit to `main` triggers the deploy workflow and the VPS is updated automatically
- [ ] `docker compose logs backend` shows no fatal errors
- [ ] No production secrets are stored in the repository or in any Docker image

**Dependencies:** M2

---

## M4: Domain Mapping + SSL — Staging

**Type:** Infrastructure
**Goal:** The staging server is accessible via a real domain over HTTPS. HTTP traffic is automatically redirected to HTTPS. SSL certificate auto-renews.

### Context

Uses Nginx as a reverse proxy (or Caddy as an alternative — choose one) running inside Docker alongside the app containers. Let's Encrypt issues the SSL certificate via Certbot (Nginx) or the Caddy ACME client. Staging subdomains are used so production DNS can be set up independently later.

Suggested subdomains:
- `api.staging.yourdomain.com` → backend (port 5000)
- `staging.yourdomain.com` → buyer-app (port 3000)
- `admin.staging.yourdomain.com` → admin-app (port 3001)

### Tasks

**DNS**
- [ ] Log into domain registrar and create three A records pointing to the VPS IP:
  - `staging.yourdomain.com`
  - `api.staging.yourdomain.com`
  - `admin.staging.yourdomain.com`
- [ ] Verify DNS propagation: `nslookup staging.yourdomain.com` resolves to VPS IP

**Nginx + Certbot (inside Docker)**
- [ ] Add `nginx` service to `docker-compose.yml`: `nginx:alpine`, ports `80:80` and `443:443`
- [ ] Add `certbot` service: `certbot/certbot`, mounts shared volumes for certs and webroot
- [ ] Write `nginx/conf.d/staging.conf`:
  - HTTP server block on port 80 serving `/.well-known/acme-challenge/` for Certbot, redirect all other traffic to HTTPS
  - HTTPS server block on port 443 with SSL cert paths, proxy pass to `buyer-app:80`
  - Repeat for `api.staging` → `backend:5000` and `admin.staging` → `admin-app:80`
- [ ] Remove direct port exposure for `backend`, `buyer-app`, `admin-app` (traffic only via Nginx)
- [ ] Update UFW: close ports 3000, 3001, 5000 externally; keep 80 and 443 open

**Certificate Issuance**
- [ ] Run initial Certbot challenge: `docker compose run certbot certonly --webroot ...` for all three subdomains
- [ ] Confirm certs are issued and stored in the shared volume
- [ ] Reload Nginx to pick up certs: `docker compose exec nginx nginx -s reload`
- [ ] Add cron job on VPS: `0 3 * * * docker compose run certbot renew && docker compose exec nginx nginx -s reload`

**Update App Configuration**
- [ ] Update `VITE_API_URL` in buyer-app and admin-app production `.env` to use `https://api.staging.yourdomain.com`
- [ ] Update `CORS_ORIGIN` in backend `.env` to allow `https://staging.yourdomain.com` and `https://admin.staging.yourdomain.com`
- [ ] Rebuild and redeploy: `docker compose up -d --build`

### Acceptance Criteria

- [ ] `https://staging.yourdomain.com` loads the buyer-app with a valid SSL certificate (no browser warning)
- [ ] `https://admin.staging.yourdomain.com` loads the admin-app login page over HTTPS
- [ ] `https://api.staging.yourdomain.com/health` returns `{ "status": "ok" }` over HTTPS
- [ ] `http://staging.yourdomain.com` (HTTP) automatically redirects to `https://staging.yourdomain.com`
- [ ] SSL Labs test scores A or better for all three subdomains
- [ ] Certificate expiry is ≥ 60 days from issuance date
- [ ] Certbot renewal cron is confirmed via `crontab -l` on the VPS

**Dependencies:** M3

---

## M5: Authentication + User Sessions

**Type:** Feature
**Goal:** Buyers can register, log in (email/password and Google One Tap), and stay logged in across page refreshes. The admin account is seeded. JWT access/refresh token flow is fully implemented.

### Context

Covers SRS requirements: FR-B-01 through FR-B-06 (buyer auth) and the implicit admin login requirement. This milestone ships the auth infrastructure used by every subsequent feature — complete it before any other feature milestone.

Backend routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/refresh`, `POST /api/auth/logout`.

Middleware created here: `auth.middleware.ts` (JWT verification), `admin.middleware.ts` (role guard).

### Tasks

**Backend**
- [ ] Create `User` Mongoose model (see SRS §10.1): `fullName`, `email`, `passwordHash`, `googleId`, `avatar`, `role`, `isActive`, `refreshToken`, `createdAt`, `updatedAt`
- [ ] Add MongoDB indexes: `email` (unique), `googleId` (sparse)
- [ ] Implement `POST /api/auth/register`: validate with Zod, hash password with Argon2id, save user, send verification email stub (actual email in M12), return 201
- [ ] Implement `POST /api/auth/login`: validate credentials, compare Argon2id hash, issue RS256 JWT access token (15 min) + refresh token (7 days) stored in `httpOnly` cookie
- [ ] Implement `POST /api/auth/google`: verify Google ID token via `google-auth-library`, find-or-create user, issue same JWT pair
- [ ] Implement `POST /api/auth/refresh`: read `httpOnly` cookie, verify hashed refresh token in DB, issue new access token
- [ ] Implement `POST /api/auth/logout`: clear cookie, nullify refresh token in DB
- [ ] Implement `GET /api/auth/me`: return current user profile (requires auth middleware)
- [ ] Implement `PATCH /api/users/profile`: update `fullName`, `avatar` (FR-B-06)
- [ ] Implement `PATCH /api/users/password`: verify current password, hash new password (FR-B-06)
- [ ] Create `auth.middleware.ts`: extract Bearer token, verify RS256 signature, attach `req.user`
- [ ] Create `admin.middleware.ts`: check `req.user.role === 'admin'`, return 403 otherwise
- [ ] Apply `express-rate-limit` to all `/api/auth/*` routes (max 10 req/15 min per IP)
- [ ] Seed script: create default admin user from env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`

**Buyer App**
- [ ] Create Redux `authSlice`: state shape `{ user, accessToken, status }`, actions `setCredentials`, `clearCredentials`
- [ ] Create `authApi` (RTK Query): `register`, `login`, `googleLogin`, `logout`, `getMe` endpoints
- [ ] Create Axios instance in `src/lib/axios.ts`: attaches `Authorization: Bearer <token>` header, response interceptor calls `POST /api/auth/refresh` on 401 and retries original request
- [ ] Implement `Register.tsx` page: form with `react-hook-form` + Zod, fields: full name, email, password (min 8 chars), confirm password; show toast on success/error
- [ ] Implement `Login.tsx` page: email/password form + Google One Tap prompt via `@react-oauth/google`
- [ ] Implement `Profile.tsx` page: show current user info, update name/avatar form, change password form
- [ ] Add `ProtectedRoute` wrapper component: redirects unauthenticated users to `/login`
- [ ] Persist `accessToken` in Redux memory (not localStorage); re-fetch on app mount via `getMe`

**Admin App**
- [ ] Create Redux `authSlice` (same pattern as buyer-app)
- [ ] Implement admin `Login.tsx`: email/password only (no Google One Tap)
- [ ] Add `AdminRoute` wrapper: blocks non-admin users

### Tests

**Backend (Vitest + Supertest)**
- [ ] `POST /api/auth/register` — happy path, duplicate email (409), weak password (400)
- [ ] `POST /api/auth/login` — valid credentials, wrong password (generic error), inactive account (403)
- [ ] `POST /api/auth/google` — valid Google token (mock `google-auth-library`), invalid token (401)
- [ ] `POST /api/auth/refresh` — valid cookie, expired/missing cookie (401)
- [ ] `POST /api/auth/logout` — clears cookie, refresh token nullified
- [ ] `auth.middleware.ts` — valid token passes, missing token 401, expired token 401, tampered token 401
- [ ] `admin.middleware.ts` — admin role passes, buyer role 403

**Buyer App (Vitest + RTK)**
- [ ] `authSlice` — `setCredentials` stores user + token, `clearCredentials` resets state
- [ ] `Register.tsx` — renders fields, shows validation errors, calls register mutation on valid submit
- [ ] `Login.tsx` — email/password submit dispatches login, Google One Tap triggers `googleLogin`
- [ ] Axios interceptor — on 401 response, calls refresh endpoint and retries

### Acceptance Criteria

- [ ] A new user can register and immediately log in
- [ ] A logged-in user remains authenticated after a full page refresh (token is silently refreshed)
- [ ] Google One Tap login creates a new user or signs into existing user correctly
- [ ] Attempting to access a protected page while unauthenticated redirects to `/login`
- [ ] Admin login with correct credentials reaches the admin dashboard; buyer credentials are rejected
- [ ] All backend auth route tests pass with ≥ 80% coverage on `auth.controller.ts`
- [ ] Rate limiter returns 429 after 10 failed login attempts within 15 minutes

**Dependencies:** M0

---

## M6: Book Catalogue + Admin Book Management

**Type:** Feature
**Goal:** Buyers can browse, search, filter, and view books. Admins can add, edit, delete, publish/unpublish books and upload PDFs and cover images to Cloudflare R2.

### Context

Covers SRS FR-B-07 through FR-B-10 (buyer discovery) and FR-A-03 through FR-A-07 (admin book management). This milestone creates the core data of the store — without books, no other feature has anything to act on.

Backend routes: `GET /api/books`, `GET /api/books/:id`, `GET /api/books/search`, `POST /api/admin/books`, `PATCH /api/admin/books/:id`, `DELETE /api/admin/books/:id`, `PATCH /api/admin/books/:id/publish`.

### Tasks

**Backend**
- [ ] Create `Book` Mongoose model (see SRS §10.2) with all fields and indexes (`category`, `isPublished`, `price`)
- [ ] Implement `r2.service.ts`: `uploadFile(key, buffer, contentType)`, `deleteFile(key)`, `getPresignedGetUrl(key, expiresInSeconds)` using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] Implement `image.service.ts`: resize cover image to 400×600px WebP using `sharp`
- [ ] Implement `GET /api/books`: paginated list (12/page), filter by `category`, `minPrice`, `maxPrice`, `minRating`, sort by `createdAt` desc; published books only
- [ ] Implement `GET /api/books/:id`: full book detail; returns public R2 URL for cover image
- [ ] Implement `GET /api/books/search?q=`: full-text search across `title`, `author`, `description` (MongoDB text index); supports same filters as listing
- [ ] Implement `GET /api/books/featured`: returns top 8 books by `totalSales`
- [ ] Implement `GET /api/books/new-releases`: returns 8 most recently published books
- [ ] Implement `POST /api/admin/books` (admin only): accepts `multipart/form-data` via Multer, validates fields via Zod, resizes cover via Sharp, uploads cover to public R2 bucket, uploads PDF to private R2 bucket, saves book with `isPublished: false`
- [ ] Implement `PATCH /api/admin/books/:id` (admin only): partial update; re-upload files only if new ones are provided; delete old R2 files if replaced
- [ ] Implement `DELETE /api/admin/books/:id` (admin only): soft-delete if orders exist, hard-delete + R2 cleanup if no orders
- [ ] Implement `PATCH /api/admin/books/:id/publish` (admin only): toggle `isPublished`; confirm prompt logic enforced at API level (returns 409 with warning if toggling off a book with orders)
- [ ] Implement `POST /api/admin/books/bulk` (admin only): accepts `{ ids: string[], action: 'publish' | 'unpublish' | 'delete' }`

**Buyer App**
- [ ] Implement `booksApi` (RTK Query): `getBooks`, `getBook`, `searchBooks`, `getFeatured`, `getNewReleases`, `getByCategory`
- [ ] Implement `Home.tsx`: three sections (Featured, New Releases, Bestsellers) each showing 8 `BookCard` components
- [ ] Implement `BookCard.tsx`: cover image, title, author, price, average rating stars
- [ ] Implement `BookGrid.tsx`: responsive grid layout
- [ ] Implement `Search.tsx`: search bar (debounced 300ms), filter sidebar (price range slider, category checkboxes, minimum rating), paginated results
- [ ] Implement `Category.tsx`: books filtered by category with pagination
- [ ] Implement `BookDetail.tsx`: cover image, title, author, description, price, rating, review count, "Already in your library" badge, related books section, sample preview section (PDF viewer if `samplePdfKey` exists)
- [ ] Navbar search bar triggers navigation to `/search?q=`

**Admin App**
- [ ] Implement `Books.tsx`: paginated list with `DataTable` (TanStack Table), columns: cover, title, category, price, published status, created date, actions; bulk selection with checkboxes
- [ ] Implement `BookForm.tsx`: add/edit form using `react-hook-form` + Zod; cover image dropzone (react-dropzone), PDF dropzone, sample PDF dropzone; preview cover image before upload
- [ ] Implement bulk action toolbar: Publish / Unpublish / Delete buttons; disabled when no rows selected
- [ ] Implement publish/unpublish toggle in row actions with confirmation dialog

### Tests

**Backend**
- [ ] `GET /api/books` — pagination, category filter, price filter, only published books returned
- [ ] `GET /api/books/search` — matches title, author, description; pagination; excludes unpublished
- [ ] `POST /api/admin/books` — happy path (mock R2 upload, mock Sharp), missing required field (400), non-admin (403)
- [ ] `DELETE /api/admin/books/:id` — soft delete when orders exist, hard delete when no orders (mock R2 `deleteFile`)
- [ ] `r2.service.ts` — unit test upload, delete, presigned URL generation (mock `@aws-sdk/client-s3`)
- [ ] `image.service.ts` — unit test resize output dimensions and format (mock `sharp`)

**Buyer App**
- [ ] `BookCard` renders title, author, price, rating
- [ ] `Search` page debounces input and passes filters to `searchBooks` query
- [ ] `BookDetail` shows "Already in your library" badge when book is in user's orders (mock RTK Query)

### Acceptance Criteria

- [ ] Home page displays three book sections with real data from the backend
- [ ] Search returns relevant results; filters narrow results correctly
- [ ] Admin can add a new book with PDF + cover image; it appears in the admin list as unpublished
- [ ] Admin can publish the book; it immediately appears in the buyer-app home page
- [ ] Admin bulk-delete removes multiple books in one action
- [ ] Cover images are served from the Cloudflare R2 public bucket URL (not from the backend)
- [ ] Backend unit tests for R2 and image service pass without real R2 credentials

**Dependencies:** M5

---

## M7: Cart + Wishlist

**Type:** Feature
**Goal:** Buyers can add books to a client-side cart and a database-persisted wishlist. Items can be moved between wishlist and cart. Duplicate and already-owned books are blocked.

### Context

Covers SRS FR-B-11 (cart) and FR-B-12 (wishlist). The cart lives only in Redux client state — it is not persisted in the database. The wishlist is persisted per user in the database and synced on login.

Backend routes (wishlist only): `GET /api/wishlist`, `POST /api/wishlist/:bookId`, `DELETE /api/wishlist/:bookId`.

### Tasks

**Backend**
- [ ] Create `Wishlist` Mongoose model (see SRS §10.5): `userId` (ref User), `books` (array of ObjectId refs to Book)
- [ ] Implement `GET /api/wishlist` (auth required): returns populated wishlist for current user
- [ ] Implement `POST /api/wishlist/:bookId` (auth required): adds book to wishlist; returns 409 if already present
- [ ] Implement `DELETE /api/wishlist/:bookId` (auth required): removes book from wishlist

**Buyer App**
- [ ] Create Redux `cartSlice`: state `{ items: CartItem[] }`, actions `addToCart`, `removeFromCart`, `clearCart`; guard logic: no duplicates, no already-owned books (cross-reference `authSlice` user's order history)
- [ ] Create `wishlistApi` (RTK Query): `getWishlist`, `addToWishlist`, `removeFromWishlist`
- [ ] Implement `CartDrawer.tsx`: slide-in drawer showing cart items (cover, title, price), remove button per item, total price, "Proceed to Checkout" button
- [ ] Implement wishlist toggle button on `BookCard` and `BookDetail` (filled/unfilled heart icon)
- [ ] Wishlist page: list of wishlisted books, "Add to Cart" button per item that dispatches `addToCart` and calls `removeFromWishlist`
- [ ] Show Sonner toast: "Added to cart", "Removed from wishlist", "Already in your library" (when blocked)
- [ ] Cart count badge on Navbar cart icon (derived from `cartSlice.items.length`)
- [ ] On login, dispatch `getWishlist` to sync wishlist from backend

### Tests

**Backend**
- [ ] `GET /api/wishlist` — returns empty list for new user, returns items for existing
- [ ] `POST /api/wishlist/:bookId` — adds book, 409 on duplicate, 404 on invalid bookId
- [ ] `DELETE /api/wishlist/:bookId` — removes book, 404 if not in wishlist

**Buyer App**
- [ ] `cartSlice` — `addToCart` adds item, duplicate add is ignored, owned book is blocked
- [ ] `cartSlice` — `removeFromCart` removes correct item
- [ ] `CartDrawer` renders cart items, remove button calls `removeFromCart`

### Acceptance Criteria

- [ ] Adding a book to the cart shows it in the CartDrawer with the correct price and a cart badge count
- [ ] Adding the same book twice does not create a duplicate cart entry
- [ ] An already-purchased book shows "Already in your library" and cannot be added to the cart
- [ ] Wishlisted books persist after page refresh and across devices (logged-in user)
- [ ] "Move to Cart" from wishlist adds to cart and removes from wishlist atomically in the UI

**Dependencies:** M6

---

## M8: Checkout + Razorpay Payment

**Type:** Feature
**Goal:** A buyer can check out, pay via the Razorpay widget, and receive an order record. The payment webhook verifies the transaction server-side. A failed or duplicate webhook is handled idempotently.

### Context

Covers SRS FR-B-13, FR-B-14 and SRS §14 (Payment Flow). This is the most critical business logic in the system. The payment flow is:

1. `POST /api/orders/create` → backend creates Razorpay Order, saves pending `Order` in MongoDB
2. Frontend opens Razorpay checkout widget with the Order ID
3. Buyer completes payment in the widget
4. Razorpay sends `payment.captured` webhook to `POST /api/orders/webhook`
5. Backend verifies HMAC signature, updates Order status to `paid`, triggers confirmation email (M12)

Backend routes: `POST /api/orders/create`, `POST /api/orders/webhook`, `GET /api/orders` (order history).

### Tasks

**Backend**
- [ ] Create `Order` Mongoose model (see SRS §10.3): `buyerId`, `books` (array with `bookId`, `priceAtPurchase`, `downloadCount`), `totalAmount`, `razorpayOrderId`, `razorpayPaymentId`, `status` (pending/paid/failed/refunded), `createdAt`
- [ ] Add unique index on `razorpayOrderId`
- [ ] Implement `razorpay.service.ts`: `createOrder(amountInPaise, currency)`, `verifyWebhookSignature(body, signature, secret)`, `createRefund(paymentId, amount)`
- [ ] Implement `POST /api/orders/create` (auth required): validate cart (all books exist and are published), calculate total, call `razorpay.service.createOrder`, save `Order` with `status: 'pending'`, return `{ razorpayOrderId, amount, currency, keyId }`
- [ ] Implement `POST /api/orders/webhook` (no auth — public endpoint): verify HMAC signature using `X-Razorpay-Signature` header; on valid `payment.captured` event: find Order by `razorpayOrderId`, update `status: 'paid'` and `razorpayPaymentId`; idempotency guard: if order already `paid`, return 200 immediately without reprocessing; queue confirmation email
- [ ] Implement `GET /api/orders` (auth required): return all orders for current user, paginated

**Buyer App**
- [ ] Create `ordersApi` (RTK Query): `createOrder`, `getOrderHistory`
- [ ] Implement `Checkout.tsx`: displays cart items, total price, "Pay Now" button
- [ ] On "Pay Now" click: call `createOrder` mutation, on success dynamically load Razorpay checkout script, open widget with returned `razorpayOrderId` and `keyId`
- [ ] Handle Razorpay widget `onSuccess`: show "Payment successful" toast, clear cart (`clearCart`), navigate to `/library`
- [ ] Handle Razorpay widget `onDismiss` / `onError`: show error toast, keep cart intact
- [ ] Implement `OrderHistory.tsx`: list of past orders with status badge per order

### Tests

**Backend**
- [ ] `POST /api/orders/create` — happy path (mock Razorpay `createOrder`), out-of-stock or unpublished book blocked (400), unauthenticated (401)
- [ ] `POST /api/orders/webhook` — valid signature + `payment.captured` updates order to `paid`; invalid signature returns 400; duplicate event (already paid) returns 200 without side effects
- [ ] `razorpay.service.ts` — `verifyWebhookSignature` with correct HMAC passes, tampered signature fails
- [ ] Idempotency: calling webhook handler twice with same `razorpayOrderId` does not create duplicate order

### Acceptance Criteria

- [ ] The Razorpay checkout widget opens correctly on the checkout page with the correct amount
- [ ] After a successful (test-mode) payment, the order status in the database is `paid`
- [ ] A duplicate `payment.captured` webhook does not create a second order or side effects
- [ ] A webhook with a tampered HMAC signature is rejected with 400
- [ ] The buyer is redirected to `/library` after a successful payment
- [ ] Order history page shows all past orders with correct status

**Dependencies:** M7

---

## M9: My Library + Secure PDF Download

**Type:** Feature
**Goal:** A buyer can view all purchased books in "My Library" and download the PDF via a time-limited presigned R2 URL. A maximum of 5 downloads per purchase is enforced.

### Context

Covers SRS FR-B-15, FR-B-16, FR-B-17. The presigned URL is generated server-side with a 15-minute expiry and returned to the frontend — the PDF itself is never served through the backend. Download count is tracked per book per order.

Backend routes: `GET /api/library`, `GET /api/library/:bookId/download`.

### Tasks

**Backend**
- [ ] Implement `GET /api/library` (auth required): query all `paid` orders for the current user; return list of books (populated from `Order.books`) with `downloadCount` and `downloadLimit: 5`
- [ ] Implement `GET /api/library/:bookId/download` (auth required):
  - Find a `paid` order containing `bookId` for the current user; 404 if not found
  - Check `downloadCount < 5`; if exceeded, return 403 `"Download limit reached. Contact support."`
  - Call `r2.service.getPresignedGetUrl(book.pdfKey, 900)` (15 min expiry)
  - Increment `downloadCount` for this book in the order
  - Return `{ url: presignedUrl }`

**Buyer App**
- [ ] Create `libraryApi` (RTK Query): `getLibrary`, `getDownloadUrl`
- [ ] Implement `Library.tsx`: grid of purchased books showing cover, title, author, download count remaining (`5 - downloadCount`), "Download PDF" button
- [ ] On "Download PDF" click: call `getDownloadUrl` mutation, on success open returned URL in a new tab
- [ ] Show "Download limit reached" toast (with support contact link) if 403 is returned
- [ ] Optimistically decrement remaining downloads in UI after successful download

### Tests

**Backend**
- [ ] `GET /api/library` — returns only books from `paid` orders for the requesting user; excludes other users' orders
- [ ] `GET /api/library/:bookId/download` — happy path returns presigned URL and increments `downloadCount`
- [ ] Download limit: 5th download succeeds; 6th returns 403
- [ ] Unauthenticated request returns 401
- [ ] Book not in user's library returns 404

**Buyer App**
- [ ] `Library.tsx` renders purchased books list (mock RTK Query)
- [ ] Download button calls `getDownloadUrl`; on success opens new tab (mock `window.open`)
- [ ] 403 response shows "Download limit reached" toast

### Acceptance Criteria

- [ ] "My Library" shows all books from paid orders and nothing else
- [ ] "Download PDF" generates a working presigned URL that opens the PDF in a new tab
- [ ] The download count for a book increments correctly after each download
- [ ] The 6th download attempt returns a 403 with the correct error message
- [ ] A buyer cannot download a book from another buyer's order

**Dependencies:** M8

---

## M10: Reviews + Ratings

**Type:** Feature
**Goal:** A buyer who has purchased a book can submit a star rating and review. All approved reviews are visible on the book detail page. Admins can moderate flagged reviews.

### Context

Covers SRS FR-B-18 through FR-B-20 (buyer reviews) and FR-A-14 (admin moderation). Submitting a review recalculates `averageRating` and `reviewCount` on the `Book` document. Only one review per buyer per book is allowed — re-submitting replaces the existing review.

Backend routes: `POST /api/reviews/:bookId`, `GET /api/reviews/:bookId`, `POST /api/reviews/:reviewId/flag`, `GET /api/admin/reviews/flagged`, `PATCH /api/admin/reviews/:reviewId`.

### Tasks

**Backend**
- [ ] Create `Review` Mongoose model (see SRS §10.4): `bookId`, `buyerId`, `rating` (1–5), `text` (optional), `isFlagged`, `isApproved`, `createdAt`
- [ ] Add compound unique index on `{ bookId, buyerId }`
- [ ] Implement `POST /api/reviews/:bookId` (auth required): verify buyer has a `paid` order containing the book (403 if not); upsert review (replace existing if re-submitting); recalculate `Book.averageRating` and `Book.reviewCount` using MongoDB aggregation
- [ ] Implement `GET /api/reviews/:bookId` (public): return all approved, non-flagged reviews sorted by `createdAt` desc; include average rating and count
- [ ] Implement `POST /api/reviews/:reviewId/flag` (auth required): set `isFlagged: true` on review
- [ ] Implement `GET /api/admin/reviews/flagged` (admin only): return all reviews where `isFlagged: true`
- [ ] Implement `PATCH /api/admin/reviews/:reviewId` (admin only): body `{ action: 'approve' | 'remove' }`; approve sets `isApproved: true, isFlagged: false`; remove deletes the review and recalculates book ratings

**Buyer App**
- [ ] Create `reviewsApi` (RTK Query): `getReviews`, `submitReview`, `flagReview`
- [ ] Implement `ReviewList.tsx`: list of reviews with star rating, buyer name, date, text, and flag icon button
- [ ] Implement `RatingStars.tsx`: reusable star display (read-only and interactive variants)
- [ ] Add review submission form to `BookDetail.tsx`: shown only to buyers who have purchased the book (check library); 1–5 star selector + optional text area; submit calls `submitReview`; pre-populates form if existing review found

**Admin App**
- [ ] Implement `Reviews.tsx` (moderation queue): table of flagged reviews with buyer name, book title, review text, rating, flag count; Approve and Remove action buttons per row

### Tests

**Backend**
- [ ] `POST /api/reviews/:bookId` — happy path, buyer has not purchased book (403), re-submit replaces review, `averageRating` recalculated correctly
- [ ] `GET /api/reviews/:bookId` — returns only approved + non-flagged reviews; correct average rating
- [ ] `POST /api/reviews/:reviewId/flag` — sets `isFlagged: true`
- [ ] Admin approve review — sets `isApproved: true`, removed from flagged queue
- [ ] Admin remove review — deletes review, `averageRating` and `reviewCount` recalculated

**Buyer App**
- [ ] `ReviewList` renders reviews with correct star count
- [ ] Review form is hidden when book is not purchased; visible and pre-populated when buyer has reviewed before

### Acceptance Criteria

- [ ] A buyer who has purchased a book can submit a star rating and review on the book detail page
- [ ] A buyer who has not purchased the book cannot see the review submission form
- [ ] The average rating on the book detail page updates after a new review is submitted
- [ ] Re-submitting a review replaces the previous one (no duplicates)
- [ ] A flagged review is hidden from the public book detail page and appears in the admin moderation queue
- [ ] Admin can approve or remove flagged reviews; approved reviews reappear publicly

**Dependencies:** M9

---

## M11: Admin Dashboard, Orders + Customer Management

**Type:** Feature
**Goal:** The admin dashboard shows sales stats and recent orders. Admins can manage all orders (view, search, refund) and all customer accounts (view, search, suspend/ban).

### Context

Covers SRS FR-A-01, FR-A-02 (dashboard), FR-A-08 through FR-A-10 (orders), FR-A-11 through FR-A-13 (customers), FR-A-15 through FR-A-17 (settings). The Razorpay refund flow calls `razorpay.service.createRefund()` implemented in M8.

Backend routes: `GET /api/admin/dashboard`, `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `POST /api/admin/orders/:id/refund`, `GET /api/admin/customers`, `GET /api/admin/customers/:id`, `PATCH /api/admin/customers/:id/suspend`, `GET /api/admin/settings`, `PATCH /api/admin/settings`.

### Tasks

**Backend**
- [ ] Implement `GET /api/admin/dashboard`: aggregate total revenue, today's revenue, this month's revenue, total orders, today's orders, top 5 books by revenue using MongoDB aggregation pipeline
- [ ] Implement `GET /api/admin/orders`: paginated (20/page), filters by `status`, `dateRange`, search by buyer email; populate buyer name and books
- [ ] Implement `GET /api/admin/orders/:id`: full order detail with buyer info, books, payment ID, download counts per book
- [ ] Implement `POST /api/admin/orders/:id/refund` (admin only): call `razorpay.service.createRefund`, update order `status: 'refunded'`, reset `downloadCount` to prevent further downloads
- [ ] Implement `GET /api/admin/customers`: paginated, searchable by name/email; aggregate `totalOrders` and `totalSpend` per customer
- [ ] Implement `GET /api/admin/customers/:id`: full profile + complete purchase history
- [ ] Implement `PATCH /api/admin/customers/:id/suspend`: set `user.isActive: false` — login returns 403 with suspension message
- [ ] Create `StoreSettings` model: `storeName`, `storeLogo`, `contactEmail`, `emailTemplate`
- [ ] Implement `GET /api/admin/settings` and `PATCH /api/admin/settings`

**Admin App**
- [ ] Implement `Dashboard.tsx`: stat cards (total revenue, today revenue, month revenue, total orders), top 5 books table, recent orders feed (last 10 rows)
- [ ] Implement `Orders.tsx`: filterable/searchable `DataTable`, status filter chips, date range picker, pagination
- [ ] Implement `OrderDetail.tsx`: full order view with buyer info, book list, download counts, refund button (confirmation dialog before triggering)
- [ ] Implement `Customers.tsx`: searchable `DataTable` with name, email, registration date, total orders, total spend, suspend button
- [ ] Implement `CustomerDetail.tsx`: profile info + full order history table
- [ ] Implement `Settings.tsx`: form for store name, logo upload, contact email, email template text area, Razorpay webhook URL display

### Tests

**Backend**
- [ ] `GET /api/admin/dashboard` — correct revenue aggregation with test orders
- [ ] `GET /api/admin/orders` — pagination, status filter, date range filter
- [ ] `POST /api/admin/orders/:id/refund` — calls Razorpay mock, updates order status, blocks downloads
- [ ] `PATCH /api/admin/customers/:id/suspend` — sets `isActive: false`; subsequent login returns 403

**Admin App**
- [ ] `Dashboard` renders stat cards with values from mock RTK Query response
- [ ] Refund button shows confirmation dialog; confirms before dispatching mutation

### Acceptance Criteria

- [ ] Admin dashboard shows accurate revenue and order counts (verified against test data seeded in DB)
- [ ] Order list can be filtered by status and date range; results are correct
- [ ] Admin can trigger a refund; the order status updates to `refunded` and the buyer can no longer download PDFs from that order
- [ ] Suspending a customer account causes their next login attempt to fail with the suspension message
- [ ] Settings page saves store name and email template; changes persist across page refresh

**Dependencies:** M8

---

## M12: Email Notifications + Contact/Support

**Type:** Feature
**Goal:** Buyers receive an order confirmation email after a successful payment. The contact form sends a message to the store's admin email. Email templates are configurable in admin settings.

### Context

Covers SRS FR-B-14 (order confirmation), FR-B-21 (contact form), FR-B-22 (FAQ). The `email.service.ts` stub created in M5 is fully implemented here. Nodemailer is configured with SMTP credentials from environment variables.

### Tasks

**Backend**
- [ ] Implement `email.service.ts` fully: `sendOrderConfirmation(buyer, order, books)` and `sendContactMessage(name, email, subject, message)`
- [ ] `sendOrderConfirmation`: HTML email containing order ID, list of purchased books (title + price), total amount, link to `https://staging.yourdomain.com/library`; uses the store's `emailTemplate` text from `StoreSettings`
- [ ] Connect order confirmation trigger: after webhook marks order as `paid`, call `email.service.sendOrderConfirmation` (fire-and-forget with error logging — do not fail the webhook response if email fails)
- [ ] Implement `POST /api/contact` (public): validate body (name, email, subject, message) via Zod, call `email.service.sendContactMessage`, return 200

**Buyer App**
- [ ] Implement `Contact.tsx`: form with name, email, subject (select dropdown), message textarea; submit calls `POST /api/contact`; show "Message sent" toast on success
- [ ] Implement `FAQ.tsx`: static accordion page with 8–10 common questions and answers (download limits, refund policy, supported formats, account creation, etc.)

### Tests

**Backend**
- [ ] `email.service.ts` — `sendOrderConfirmation` calls Nodemailer `transporter.sendMail` with correct `to`, `subject`, and HTML body containing order ID (mock Nodemailer transporter)
- [ ] `email.service.ts` — `sendContactMessage` sends to configured admin email
- [ ] `POST /api/contact` — valid body triggers `sendContactMessage`, invalid body returns 400
- [ ] Webhook handler: email failure does not cause webhook to return non-200

### Acceptance Criteria

- [ ] After a successful test-mode Razorpay payment, the buyer's email address receives an order confirmation (verified in a staging mailbox such as Mailtrap)
- [ ] The confirmation email contains the order ID, list of books, total amount, and a valid link to `/library`
- [ ] Submitting the contact form sends an email to the configured admin address (verified in Mailtrap)
- [ ] An email service failure (mock SMTP error) does not cause the payment webhook to return an error
- [ ] Admin can update the email body template in Settings and the next order confirmation uses the new text

**Dependencies:** M8, M11

---

## Appendix: Environment Variables Reference

| Variable | Used By | Description |
|---|---|---|
| `NODE_ENV` | Backend | `development` / `production` |
| `PORT` | Backend | HTTP port (default `5000`) |
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `JWT_PRIVATE_KEY` | Backend | RS256 private key (PEM) for signing access tokens |
| `JWT_PUBLIC_KEY` | Backend | RS256 public key (PEM) for verifying access tokens |
| `REFRESH_TOKEN_SECRET` | Backend | HMAC secret for hashing refresh tokens |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth client ID |
| `RAZORPAY_KEY_ID` | Backend | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | HMAC secret for verifying Razorpay webhooks |
| `R2_ACCOUNT_ID` | Backend | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Backend | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Backend | Cloudflare R2 secret key |
| `R2_PUBLIC_BUCKET` | Backend | R2 bucket name for public assets (covers) |
| `R2_PRIVATE_BUCKET` | Backend | R2 bucket name for private assets (PDFs) |
| `R2_PUBLIC_URL` | Backend | CDN base URL for public bucket |
| `SMTP_HOST` | Backend | SMTP server hostname |
| `SMTP_PORT` | Backend | SMTP port (587 for TLS) |
| `SMTP_USER` | Backend | SMTP username |
| `SMTP_PASS` | Backend | SMTP password |
| `ADMIN_EMAIL` | Backend | Default admin account email (seeding) |
| `ADMIN_PASSWORD` | Backend | Default admin account password (seeding) |
| `CORS_ORIGIN` | Backend | Comma-separated allowed origins |
| `VITE_API_URL` | Buyer App, Admin App | Backend base URL |
| `VITE_GOOGLE_CLIENT_ID` | Buyer App | Google OAuth client ID |
| `VITE_RAZORPAY_KEY` | Buyer App | Razorpay public key (safe to expose) |

---

## Appendix: Test Coverage Targets

| App | Scope | Target |
|---|---|---|
| Backend | Route handlers | ≥ 70% |
| Backend | Services (payment, storage, email) | ≥ 80% |
| Backend | Auth middleware | ≥ 90% |
| Buyer App | Components | ≥ 60% |
| Buyer App | Redux slices | ≥ 85% |
| Admin App | Components | ≥ 60% |

---

## Appendix: Critical E2E Scenarios (Playwright)

These scenarios must be green before any milestone is considered deployable to staging:

| # | Scenario | Milestone |
|---|---|---|
| E1 | Buyer registration → email verification → login → browse home page | M5 |
| E2 | Google One Tap login → authenticated session persists on refresh | M5 |
| E3 | Search "javascript" → filter by price → open book detail | M6 |
| E4 | Add book to cart → open cart drawer → remove book → re-add | M7 |
| E5 | Add book to wishlist → move to cart from wishlist page | M7 |
| E6 | Full checkout: cart → pay with Razorpay test card → order confirmation | M8 |
| E7 | My Library: purchased book visible → click Download → PDF opens | M9 |
| E8 | 6th download attempt blocked with correct error message | M9 |
| E9 | Buyer submits review → appears on book detail page | M10 |
| E10 | Admin login → add new book with PDF + cover → publish | M6 |
| E11 | Admin view orders → open order → trigger refund | M11 |
| E12 | Admin suspend buyer → buyer login fails with suspension message | M11 |
