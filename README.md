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
