# BridgePay — Frontend

Next.js client for BridgePay — a PayPal-style payments
platform (auth, dashboard, transfers, transaction history). See
[PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
| Name | GitHub | Role |
|---|---|---|
| Mark Musyoka | [@Mark-Musyoka](https://github.com/Mark-Musyoka) | Owner |
| Abednego Ndimu | [@abednegoingplaces](https://github.com/abednegoingplaces) | Collaborator |
| Franklin Tumaini | [@Antony-debug-jpg](https://github.com/Antony-debug-jpg) | Collaborator — database and frontend |

## Tech stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + Glassmorphism Dark Theme |
| State management | React Context (`AuthContext`, `ToastContext`) |
| API client | Typed `fetch` wrapper (`lib/api.ts`) calling this app's own internal `/api/*` proxy routes, which read the httpOnly cookie server-side and forward to the FastAPI backend — never a client-side token. A few methods (`topUpAccount`, `flagTransaction`) currently throw a clear error rather than pretend to work, since the backend has no real endpoint behind them yet. |
| Backend | [BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend) (FastAPI + Postgres) |

## Timeline
Started as a learning project with no fixed deadline — now targeting a
launch by **Friday, September 18, 2026**. See PLAN.md section 8 for the
day-by-day task breakdown between now and then.

## Backend readiness
The backend ([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend))
is fully built and tested — all auth, account, transfer, and admin endpoints
are live and stable. See PLAN.md section 3a for the exact request/response
shapes to build against.

## Status
The backend is fully built and tested (see BridgePay-Backend's README) —
this table shows what the frontend actually does with it so far. See
PLAN.md section 3 for the full page-by-page breakdown.

| Area | Status | Notes |
|---|---|---|
| Auth pages (`/login`, `/register`) | Built | Wired to `httpOnly` cookie route handlers |
| Protected layout | Built | Responsive sidebar, header, live balance |
| Dashboard | Built | Balance, stats, recent transactions |
| Transfer flow (`/transfer`) | Built | Multi-step, review modal, receipt |
| Transaction history | Built | Pagination, CSV export |
| `/topup` | UI-only | Sandbox mock — the real `/deposits/stripe` and `/deposits/mpesa` aren't called yet |
| `/profile` | UI-only | Hardcoded placeholder data — no `GET/PATCH /users/me` or change-password calls yet |
| `/admin` flagging | UI-only | The backend has no `is_flagged` concept to persist it against |
| Country dropdown | Not started | Now a required backend field on registration |
| Sign in with Google | Not started | |
| Linked payment methods | Not started | Stripe card / M-Pesa number |
| Real external payouts (`/payout`) | Not started | |
| Notifications page + unread badge | Not started | |
| Resend-verification action | Not started | |

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
│   │   ├── topup/page.tsx       # /topup (Mock sandbox deposit — not wired to real backend)
│   │   ├── profile/page.tsx     # /profile (UI skeleton — hardcoded data, not wired yet)
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
