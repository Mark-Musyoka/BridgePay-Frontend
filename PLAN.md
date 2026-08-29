# BridgePay — Frontend Plan

**Backend status: all 6 phases complete and tested** — see
[BridgePay-Backend's README](https://github.com/Mark-Musyoka/BridgePay-Backend/blob/main/README.md)
for verified endpoint behavior. The API contract below is stable to build
against.

## 1. What this is
The client for BridgePay — a learning-project payments platform (PayPal-style)
built by Abednego & Mark. This app talks to the FastAPI backend
([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend)) to
let a user register, log in, view their balance, send money to another user,
and see their transaction history.

## 2. Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data fetching:** native `fetch` against the FastAPI backend, wrapped in a
  small typed API client (`lib/api.ts`)
- **Auth state:** JWT from the backend stored client-side (httpOnly cookie
  preferred over localStorage — see Security notes below), read on each
  request via a shared fetch wrapper
- **Deploy target:** Vercel

## 3. Pages / routes (v1)
- `/register` — create account
- `/login` — log in, receive JWT
- `/dashboard` — balance + recent transactions
- `/transfer` — send money to another user (email lookup + amount)
- `/transactions` — full paginated transaction history
- `/admin` — (later) view all transactions, flag suspicious ones — mirrors
  the backend's `/admin/transactions` and `/admin/audit-logs` endpoints

## 3a. Backend API contract (as built)
Exact request/response shapes to build `lib/api.ts` against:

```
POST /auth/register
  body: { email, password, full_name }
  201: { id, email, full_name, is_active, created_at }
  400: email already registered

POST /auth/login
  body (form-urlencoded): username=<email>&password=<password>
  200: { access_token, token_type: "bearer" }
  401: incorrect credentials

GET /users/me                    (Authorization: Bearer <token>)
GET /accounts/me                 (Authorization: Bearer <token>)
  200: { id, balance, currency, created_at }

POST /transfers                  (Authorization: Bearer <token>)
  body: { to_email, amount, reference_note? }
  201: { id, from_account_id, to_account_id, amount, currency, status, type, reference_note, created_at }
  400: insufficient funds / self-transfer, 404: recipient not found

GET /transactions?page=1&page_size=20   (Authorization: Bearer <token>)
  200: { items: [...], total, page, page_size }
```

Rate limits apply (register 5/min, login 10/min, transfers 20/min, all
IP-keyed) — handle `429` responses in the API client.

## 4. Security notes (frontend side)
- Store the JWT in an httpOnly cookie set by a Next.js route handler, not in
  `localStorage` — keeps it inaccessible to JS/XSS.
- Validate all form input client-side (amount > 0, valid email) as a UX nicety,
  but never trust it — the backend re-validates everything regardless.
- No sensitive data (full account numbers, tokens) ever logged to the browser
  console in production builds.

## 5. Build order (phased, one small task at a time)
1. **Scaffolding** — `create-next-app` with TypeScript + Tailwind, folder
   structure, `.env.local.example` pointing at the backend's base URL
2. **API client** — typed wrapper around `fetch` for register/login/me/
   transfer/transactions, matching the backend's actual response shapes
3. **Auth pages** — `/register` and `/login`, wired to the backend, JWT
   stored via an httpOnly cookie route handler
4. **Protected layout** — redirect to `/login` if not authenticated; a shared
   nav/header showing the logged-in user
5. **Dashboard** — show balance (`GET /accounts/me` once that exists on the
   backend) and a short list of recent transactions
6. **Transfer flow** — form to send money, calls `POST /transfers`, shows
   success/error clearly (this is the core interaction to get right)
7. **Transaction history page** — paginated list, calls
   `GET /transactions`
8. **Polish pass** — loading states, empty states, error boundaries,
   responsive layout

## 6. Explicitly out of scope for now
- Real payment method UI (card entry, bank linking) — sandbox/mock only later
- Admin dashboard beyond a basic read-only list
- Mobile app — web only for now

## 7. Folder structure (proposed)
```
frontend/
  app/
    login/
      page.tsx
    register/
      page.tsx
    dashboard/
      page.tsx
    transfer/
      page.tsx
    transactions/
      page.tsx
    api/
      auth/
        route.ts      # sets the httpOnly cookie after login
    layout.tsx
    page.tsx           # landing / redirect
  components/
    ui/                # shared buttons, inputs, cards
    layout/            # nav, header
  lib/
    api.ts             # typed backend API client
    auth.ts            # cookie helpers
  types/
    index.ts            # shared TS types matching backend schemas
  .env.local.example
  PLAN.md
```
