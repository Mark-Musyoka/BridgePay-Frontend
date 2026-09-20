# BridgePay — Frontend

Next.js client for BridgePay — an advanced payments
platform (auth, dashboard, transfers, transaction history). See
[PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
| Name | GitHub | Role |
|---|---|---|
| Mark Musyoka | [@Mark-Musyoka](https://github.com/Mark-Musyoka) | Owner |
| Abednego Ndimu | [@abednegoingplaces](https://github.com/abednegoingplaces) | Backend, Frontend & Database|
| Frankline Tumaini | [@Antony-debug-jpg](https://github.com/Antony-debug-jpg) | Collaborator-Backend,  database and frontend |

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
is fully built and tested — all auth, account, transfer, deposit, payout
(M-Pesa, Stripe, Airtel Money, bank account), notification, admin, and
Google OAuth endpoints are live and stable, including multi-currency
conversion on deposits/payouts. See PLAN.md section 3a for the exact
request/response shapes to build against.

## Status
9 pages are built and wired to real backend calls. The remaining 6
(dashboard, transfer, deposit, payout, profile, transactions +
transaction list) have a Lovable-built design to translate — that
design is on a different framework (TanStack Start, not Next.js) so
it's a reference to port, not code to merge; see PLAN.md section 5 for
detail. Section 3 there has the full page-by-page spec each one needs
to satisfy.

| Page | Status |
|---|---|
| `/login` | Built |
| `/register` | Built |
| `/verify-email` | Built |
| `/forgot-password` | Built |
| `/reset-password` | Built |
| `/auth/google/complete` | Built |
| `/dashboard` | Not started — Lovable design to port |
| `/transfer` | Not started — Lovable design to port |
| `/deposit` | Not started — Lovable design to port |
| `/payout` | Not started — Lovable design to port |
| `/profile` | Not started — Lovable design to port |
| `/notifications` | Built |
| `/transactions`, `/transactions/[id]` | List not started — Lovable design to port; detail view Built |
| `/admin` | Built |

## App Structure

```
src/
├── app/
│   ├── (auth)/                  # Isolated auth card layout
│   │   ├── login/page.tsx       # /login
│   │   ├── register/page.tsx    # /register
│   │   ├── verify-email/page.tsx        # /verify-email
│   │   ├── forgot-password/page.tsx     # /forgot-password
│   │   ├── reset-password/page.tsx      # /reset-password
│   │   └── auth/google/complete/page.tsx  # /auth/google/complete
│   ├── (dashboard)/             # Authenticated workspace shell
│   │   ├── dashboard/page.tsx   # /dashboard
│   │   ├── transfer/page.tsx    # /transfer
│   │   ├── deposit/page.tsx     # /deposit (Stripe card, M-Pesa, Airtel Money)
│   │   ├── payout/page.tsx      # /payout (M-Pesa, Stripe card, bank account, Airtel Money)
│   │   ├── notifications/page.tsx  # /notifications
│   │   ├── transactions/
│   │   │   ├── page.tsx         # /transactions
│   │   │   └── [id]/page.tsx    # /transactions/[id]
│   │   ├── profile/page.tsx     # /profile
│   │   └── admin/page.tsx       # /admin
│   ├── api/                     # Next.js Route handlers (proxy to the backend)
│   ├── page.tsx                 # Landing page
│   ├── loading.tsx              # Global loading suspense
│   ├── error.tsx                # Error boundary
│   └── not-found.tsx            # Custom 404 page
├── components/
│   ├── ui/                      # Button, Input, Card, Badge, Modal, Skeleton, Icons
│   ├── layout/                  # Sidebar, Header, BottomNav
│   └── *.tsx                    # Feature components, flat (BalanceCard, StatCards,
│                                 # RecentTransactions, TransactionTable, TransactionFilters, etc.)
├── hooks/                        # useAuth, useToast
├── context/                      # AuthContext, ToastContext (hooks/ re-exports these)
├── lib/                          # api.ts, auth.ts, navigation.ts, utils.ts
└── types/                        # TypeScript interfaces
```

## Related repos
This is the app only — login, dashboard, transfers, deposits/payouts,
admin. Two other repos:
- [BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend) — the FastAPI backend
- [BridgePay-Web](https://github.com/Mark-Musyoka/BridgePay-Web) — the marketing/introduction site on BridgePay's main domain; this app is intended to live on a subdomain alongside it

```bash
git clone https://github.com/Mark-Musyoka/BridgePay-Backend.git
git clone https://github.com/Mark-Musyoka/BridgePay-Web.git
```

## Setup & Running Locally

```bash
cd BridgePay-Frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

## CI & Deployment
`.github/workflows/ci.yml` runs `npm run build` and `npm run lint` on
every push to `main` and every PR.

For deploying to Vercel, pick one path, not both:
- **Vercel's own GitHub integration** — "Import Project" on vercel.com,
  point it at this repo. Zero setup here, deploys on every push
  automatically.
- **`.github/workflows/deploy.yml`** — a GitHub Actions workflow that
  only deploys after CI passes (via a `workflow_run` trigger), rather
  than deploying unconditionally. See the comment at the top of that
  file for the three secrets it needs.
