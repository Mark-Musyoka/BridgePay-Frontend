# BridgePay — Frontend

Next.js client for BridgePay, a learning-project payments platform (PayPal-style).
See [PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
- **Abednego Ndimu** ([@abednegoingplaces](https://github.com/abednegoingplaces)) — collaborator
- **Mark Musyoka** ([@Mark-Musyoka](https://github.com/Mark-Musyoka)) — owner

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Deployed on Vercel
- Talks to [BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)
  (FastAPI + Postgres)

## Timeline
This is a learning project, not a race to launch — no fixed deadline. Built
incrementally in phases (see PLAN.md), picked up as time allows.

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

