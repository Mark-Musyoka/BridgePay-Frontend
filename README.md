# BridgePay — Frontend

Next.js client for BridgePay — a learning-project PayPal-style payments
platform (auth, dashboard, transfers, transaction history). See
[PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
- **Mark Musyoka** ([@Mark-Musyoka](https://github.com/Mark-Musyoka)) — owner
- **Abednego Ndimu** ([@abednegoingplaces](https://github.com/abednegoingplaces)) — collaborator
- **Franklin Tumaini** ([@Antony-debug-jpg](https://github.com/Antony-debug-jpg)) — collaborator, handling the database and frontend

## Tech stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphism Dark Theme
- **State Management:** React Context (`AuthContext`, `ToastContext`)
- **API Client:** Typed `fetch` wrapper with offline fallback mode (`lib/api.ts`)
- **Backend:** Talks to [BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend) (FastAPI + Postgres)

## Timeline
This is a learning project, not a race to launch — no fixed deadline. Built
incrementally in phases (see PLAN.md), picked up as time allows.

## Backend readiness
The backend ([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend))
is fully built and tested — all auth, account, transfer, and admin endpoints
are live and stable. See PLAN.md section 3a for the exact request/response
shapes to build against.

## Status: All Core Phases Implemented
- [x] Plan drafted & architecture established
- [x] Next.js scaffolding (TypeScript + Tailwind, App Router)
- [x] API client (`lib/api.ts`) with typed endpoints & mock database fallback
- [x] Auth pages (`/login`, `/register`) + `httpOnly` route handlers
- [x] Protected Layout Shell with responsive Sidebar, Header & live Balance
- [x] Dashboard (`/dashboard`) with balance card, stats, & recent transactions
- [x] Transfer flow (`/transfer`) with multi-step validation, review modal, & receipt
- [x] Transaction history (`/transactions`, `/transactions/[id]`) with pagination, search, & CSV export
- [x] Sandbox Top-up (`/topup`) to fund wallet balances for testing
- [x] User Profile & Security (`/profile`)
- [x] Admin Compliance & Suspicious Transfer Flagging (`/admin`)

## App Structure

```
frontend/
├── app/
│   ├── (auth)/                  # Isolated auth card layout
│   │   ├── login/page.tsx       # /login (Email, Password, 1-Click Demo)
│   │   └── register/page.tsx    # /register (Full name, Email, Password)
│   ├── (dashboard)/             # Authenticated workspace shell
│   │   ├── dashboard/page.tsx   # /dashboard (Balance card, quick actions, stats)
│   │   ├── transfer/page.tsx    # /transfer (Send money flow & receipt)
│   │   ├── transactions/
│   │   │   ├── page.tsx         # /transactions (Paginated table, filter, export)
│   │   │   └── [id]/page.tsx    # /transactions/[id] (Dedicated receipt view)
│   │   ├── topup/page.tsx       # /topup (Mock sandbox deposit)
│   │   ├── profile/page.tsx     # /profile (User profile & security)
│   │   └── admin/page.tsx       # /admin (Audit log & suspicious flagger)
│   ├── api/auth/                # Next.js Route handlers (login, logout, me)
│   ├── page.tsx                 # Modern Landing Page
│   ├── loading.tsx              # Global loading suspense
│   ├── error.tsx                # Error boundary
│   └── not-found.tsx            # Custom 404 page
├── components/
│   ├── ui/                      # Button, Input, Card, Badge, Modal, Skeleton, Icons
│   ├── layout/                  # Sidebar, Header, MobileNav
│   ├── dashboard/               # BalanceCard, StatCards, RecentTransactions
│   └── transactions/            # TransactionTable, TransactionFilters
├── context/                     # AuthContext, ToastContext
├── lib/                         # api.ts, auth.ts, utils.ts
└── types/                       # TypeScript interfaces
```

## Related repo
This is the frontend only. The backend API lives in a separate repo:
[BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)

```bash
git clone https://github.com/Mark-Musyoka/BridgePay-Backend.git
```

## Setup & Running Locally

```bash
cd BridgePay-Frontend/frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.
