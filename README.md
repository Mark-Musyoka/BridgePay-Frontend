# BridgePay — Frontend

Next.js client for BridgePay — a learning-project PayPal-style payments
platform (auth, dashboard, transfers, transaction history). See
[PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
- **Mark Musyoka** ([@Mark-Musyoka](https://github.com/Mark-Musyoka)) — owner
- **Abednego Ndimu** ([@abednegoingplaces](https://github.com/abednegoingplaces)) — collaborator
- **Antony** ([@Antony-debug-jpg](https://github.com/Antony-debug-jpg)) — collaborator, handling the database and frontend

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Deployed on Vercel
- Talks to [BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)
  (FastAPI + Postgres)

## Timeline
This is a learning project, not a race to launch — no fixed deadline. Built
incrementally in phases (see PLAN.md), picked up as time allows.

## Backend readiness
The backend ([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend))
is fully built and tested — all auth, account, transfer, and admin endpoints
are live and stable. See PLAN.md section 3a for the exact request/response
shapes to build against.

## Status: Phase 1 — Scaffolding
- [x] Plan drafted
- [x] Next.js scaffolding (TypeScript + Tailwind, App Router)
- [ ] API client
- [ ] Auth pages
- [ ] Dashboard
- [ ] Transfer flow
- [ ] Transaction history

## Related repo
This is the frontend only. The backend API lives in a separate repo:
[BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)

```bash
git clone https://github.com/Mark-Musyoka/BridgePay-Backend.git
```

## Setup

```bash
git clone https://github.com/Mark-Musyoka/BridgePay-Frontend.git
cd BridgePay-Frontend/frontend
npm install
```

## Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

