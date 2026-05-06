# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A digital PDF bookstore — npm-workspaces monorepo with four packages:

- `backend/` — Express 5 + Mongoose API (single shared backend)
- `buyer-app/` — React 19 + Vite SPA for customers
- `admin-app/` — React 19 + Vite SPA for the single store owner
- `e2e/` — Playwright tests that drive both frontends

Node `24.15.0` is pinned via `.nvmrc` / `.node-version`. The root `package.json` declares the workspaces; per-app `package.json` files dispatch their own scripts.

## Spec is in `docs/`

These three documents are the source of truth — read the relevant sections before planning a feature. Code is built to match the spec, not the other way around.

- [docs/SRS.md](docs/SRS.md) — full functional + non-functional requirements, data models (§10), API surface (§11), security rules (§12), file/payment/auth flows (§13–15)
- [docs/MILESTONES.md](docs/MILESTONES.md) — M0–M12 work breakdown with acceptance criteria; the env-var reference is in the appendix
- [docs/ISSUES.md](docs/ISSUES.md) — milestones decomposed into per-area GitHub issues (M0-1, M5-2, etc.); commit messages reference these IDs (see `bc34e1a M0-1`)

## Current scaffold state

Only **M0-1** (monorepo root) is done. Each workspace `package.json` is a placeholder with no `scripts`, `dependencies`, or source. When working on M0-2…M0-5, you are *creating* the app from scratch per the SRS §9 layout — there is no existing code to follow yet. Don't invent files outside the SRS layout; if the spec doesn't cover it, ask.

## Common commands

Run from repo root unless noted. `--if-present` makes the root-level scripts safe to run before all workspaces are scaffolded.

```bash
npm install                  # installs all workspaces

npm run lint                 # eslint . (root flat config covers all workspaces)
npm run format               # prettier --write .
npm run format:check         # prettier --check .
npm run build                # build --workspaces --if-present

npm test                     # test --workspaces --if-present
npm run test:backend         # vitest in backend
npm run test:buyer           # vitest in buyer-app
npm run test:admin           # vitest in admin-app
npm run test:e2e             # playwright in e2e
```

Single test (once workspaces have Vitest installed): `npm test --workspace backend -- path/to/file.test.ts -t "test name"`. Playwright: `npm test --workspace e2e -- path/to/spec.ts --grep "name"`.

## Architecture and invariants

Knowing these saves rereading the spec:

- **Single backend, two frontends.** Both SPAs talk only to `backend` over REST. They share no code (no shared package); duplicate types live in each app.
- **Auth.** RS256 JWT access token (15 min, in Redux memory only — never localStorage) + refresh token in `httpOnly; Secure; SameSite=Strict` cookie (7 days, Argon2id-hashed in `User.refreshToken`). `jwt.verify()` must explicitly pin `algorithms: ['RS256']` to block alg-confusion. Refresh rotates on every `/auth/refresh`. Passwords use Argon2id with 64MB / 3 iterations. Login errors are generic (no user enumeration).
- **Money is integer paise.** `Order.totalAmount`, `Book.price`, and `Order.books[].price` are all `Number` in INR paise. Never use floats for currency.
- **Razorpay webhook is the source of truth for `paid`** — not the client success callback. The handler verifies the HMAC-SHA256 `X-Razorpay-Signature` header *before* any DB read/write, and is idempotent on `razorpayOrderId` (a duplicate `payment.captured` returns 200 with no side effect). The webhook is public — do NOT put it behind JWT auth.
- **PDFs live in a *private* R2 bucket.** They are never served through the backend and never have a public URL. Downloads return a presigned `GetObject` URL (15-min expiry) only after ownership + download-count checks. Cover images live in a *public* bucket served via Cloudflare CDN.
- **Download limit is 5 per book per order**, tracked in `Order.books[].downloadCount`. Refunding an order must reset/block downloads (see M11).
- **Cart vs wishlist.** Cart is **client-only** (Redux `cartSlice` in buyer-app) — never persisted. Wishlist **is** persisted (`Wishlist` collection, one per user). Already-owned books cannot be added to either.
- **Book deletion.** Soft-delete (`isDeleted: true`) if any orders reference the book — existing buyers keep download access. Hard-delete + R2 cleanup only when no orders exist.
- **Validation boundary.** All request bodies pass through Zod schemas before reaching controllers. Mongoose ODM only — no raw query string interpolation.
- **Single admin.** Seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars; no admin registration UI. Admin app has no Google One Tap.
- **Currency is fixed to INR**, payment is fixed to Razorpay, format is fixed to PDF — these are out-of-scope to change.

## Code style

- TypeScript across all workspaces, strict mode, ESM (`"type": "module"`).
- Prettier: single quotes, semicolons, trailing commas (`all`), 100-char width, 2-space indent, LF line endings.
- ESLint flat config at root ([eslint.config.ts](eslint.config.ts)) — `js.configs.recommended` + `tseslint.configs.recommended`. The `mock_ui/`, `docs/`, `.cursor/`, `.claude/` paths are ignored.

## Things that look real but aren't

- **`mock_ui/`** is plain static HTML/JS used as a visual reference for the buyer-app pages. It is not built, not linted, not deployed. Don't import from it; treat it as a wireframe only.
- **`.cursor/skills/ui-ux-pro-max/`** is a local design-system tool (Python-based, requires `python3`) and is gitignored. Safe to ignore unless explicitly invoked.
