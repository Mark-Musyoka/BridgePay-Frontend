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
is fully built and tested — all auth, account, transfer, deposit, payout
(M-Pesa, Stripe, Airtel Money, bank account), notification, admin, and
Google OAuth endpoints are live and stable, including multi-currency
conversion on deposits/payouts. See PLAN.md section 3a for the exact
request/response shapes to build against.

## Status
Every page's existing implementation has been cleared (see PLAN.md
section 5) so each one gets rebuilt against the backend's current, full
surface (which now includes Airtel Money
and bank-account payouts, neither of which existed when the pages
below were first built) rather than patched incrementally. This table
tracks the rebuild; see PLAN.md section 3 for the full page-by-page
spec each one needs to satisfy.

| Page | Status |
|---|---|
| `/login` | Not started |
| `/register` | Not started |
| `/verify-email` | Not started |
| `/forgot-password` | Not started |
| `/reset-password` | Not started |
| `/auth/google/complete` | Not started |
| `/dashboard` | Not started |
| `/transfer` | Not started |
| `/deposit` | Not started |
| `/payout` | Not started |
| `/profile` | Not started |
| `/notifications` | Not started |
| `/transactions`, `/transactions/[id]` | Not started |
| `/admin` | Not started |

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
├── lib/                          # api.ts, auth.ts, utils.ts
└── types/                        # TypeScript interfaces
```

## Related repo
This is the frontend only. The backend API lives in a separate repo:
[BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)

```bash
git clone https://github.com/Mark-Musyoka/BridgePay-Backend.git
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
