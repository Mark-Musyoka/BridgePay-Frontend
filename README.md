# BridgePay — Frontend

Next.js client for BridgePay — an advanced payments
platform (auth, dashboard, transfers, transaction history). See
[PLAN.md](./PLAN.md) for the full architecture and phased build order.

## Team
| Name | GitHub | Role |
|---|---|---|
| Mark Musyoka | [@Mark-Musyoka](https://github.com/Mark-Musyoka) | Owner(Deployments & Hosting)|
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
Started as a learning project with no fixed deadline. The original
target launch date, Friday, September 18, 2026, has passed, but the
frontend rebuild it was tracking is now complete — see Status below.
PLAN.md section 8 has the original day-by-day breakdown, kept as a
historical record.

## Backend readiness
The backend ([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend))
is fully built and tested — all auth, account, transfer, deposit, payout
(M-Pesa, Stripe, Airtel Money, bank account), notification, admin, and
Google OAuth endpoints are live and stable, including multi-currency
conversion on deposits/payouts. See PLAN.md section 3a for the exact
request/response shapes to build against.

## Status
All pages are built by hand against Tailwind CSS (no Lovable/Stitch
export used) and wired to real backend calls. See PLAN.md section 3
for the full page-by-page spec each one satisfies.

| Page | Status |
|---|---|
| `/` (landing/marketing home) | Built — distinct navy/marigold visual identity |
| `/login` | Built |
| `/register` | Built |
| `/verify-email` | Built |
| `/forgot-password` | Built |
| `/reset-password` | Built |
| `/auth/google/complete` | Built |
| `/dashboard` | Built |
| `/transfer` | Built |
| `/deposit` | Built |
| `/payout` | Built |
| `/topup` | Built — redirects to `/deposit`, kept only so the old link doesn't break |
| `/profile` | Built — change-password and linked-payment-methods sections are real UI, not yet wired (no backend endpoint yet) |
| `/notifications` | Built |
| `/transactions`, `/transactions/[id]` | Built |
| `/admin` | Built |

The rest of the app still uses the original Material-style blue/teal
tokens from `globals.css`; bringing it visually in line with the new
`/` redesign is open (PLAN.md section 6, item 12).

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

## Test accounts (for exploring the built pages)
The home page's "Try the live demo" button, and `AuthContext`'s
`demoLogin()` it calls, log in as one of two fixed accounts —
`demo-user@bridgepay.dev` / `demo-admin@bridgepay.dev`, both password
`DemoPass123!`. Neither exists until you create them once against your
own local backend:

1. Run BridgePay-Backend locally (Postgres + Redis + the API +
   `celery -A celery_app worker --loglevel=info` in a separate
   terminal — verification emails are mocked as a log line from this
   worker, so it has to be running to see them). See that repo's
   README for the full setup.
2. Register both accounts (via `/register` here, or `curl`):
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"demo-user@bridgepay.dev","password":"DemoPass123!","full_name":"Demo User","country":"KE"}'

   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"demo-admin@bridgepay.dev","password":"DemoPass123!","full_name":"Demo Admin","country":"KE"}'
   ```
3. Each registration queues a verification email — find the raw token
   in the Celery worker's log output (`Verification email to ... —
   token: ...`) and confirm it:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token":"<raw token from the worker log>"}'
   ```
4. Flag the second account as admin directly in the database (see
   BridgePay-Backend's README, Phase 6):
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'demo-admin@bridgepay.dev';
   ```

After that, "Try the live demo" (or the demo account's real
credentials on `/login`) works against your local backend like any
other account — it's not a special bypass, just a fixed pair of real
credentials.

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
