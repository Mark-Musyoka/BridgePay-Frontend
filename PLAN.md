# BridgePay — Frontend Plan

**Backend status: all 6 phases complete and tested** — see
[BridgePay-Backend's README](https://github.com/Mark-Musyoka/BridgePay-Backend/blob/main/README.md)
for verified endpoint behavior. The API contract below is stable to build
against.

## 1. What this is
The client for BridgePay — a learning-project payments platform (PayPal-style)
built by Abednego, Mark & Antony (see README.md's Team section for roles).
This app talks to the FastAPI backend
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
  request via a shared fetch wrapper. Store both `access_token` and
  `refresh_token` from login/refresh; when a request gets a `401`, call
  `POST /api/v1/auth/refresh` once with the stored refresh token and retry —
  if that also fails, treat it as a real logout (redirect to `/login`).
- **Deploy target:** Vercel

## 3. Pages / routes (v1)
- `/register` — create account
- `/login` — log in, receive JWT
- `/verify-email` — confirms the token from the (mocked) verification
  email link; calls `POST /api/v1/auth/verify-email`
- `/forgot-password` — email input, calls `POST /api/v1/auth/password-reset-request`
- `/reset-password` — token + new password form (token comes from the
  reset link's query param), calls `POST /api/v1/auth/password-reset-confirm`
- `/dashboard` — balance + recent transactions
- `/transfer` — send money to another user (email lookup + amount). Should
  handle the `403` (unverified) case distinctly — e.g. a banner prompting
  the user to verify their email, not a generic error toast
- `/transactions` — full paginated transaction history
- `/admin` — (later) view all transactions, flag suspicious ones — mirrors
  the backend's `/admin/transactions` and `/admin/audit-logs` endpoints

## 3a. Backend API contract (as built)
Exact request/response shapes to build `lib/api.ts` against. **All paths
below are prefixed with `/api/v1`** (e.g. base URL
`https://bridgepay-backend.onrender.com/api/v1`) — the only unversioned
route on the backend is the root health check (`GET /`), which the
frontend has no reason to call directly.

```
POST /api/v1/auth/register
  body: { email, password, full_name }
  201: { id, email, full_name, is_active, created_at }
  400: email already registered

POST /api/v1/auth/login
  body (form-urlencoded): username=<email>&password=<password>
  200: { access_token, refresh_token, token_type: "bearer" }
  401: incorrect credentials

POST /api/v1/auth/refresh
  body: { refresh_token }
  200: { access_token, refresh_token, token_type: "bearer" }  (both are NEW — old refresh_token is single-use)
  401: invalid/expired, OR reuse detected (in which case ALL of that user's
       refresh tokens are revoked server-side — every device gets logged out)

POST /api/v1/auth/logout
  body: { refresh_token }
  204: no content

POST /api/v1/auth/verify-email
  body: { token }
  204: no content
  400: invalid/expired/already-used token
  Note: registration no longer means the account can immediately send
  money (see the 403 case on /transfers below) — a mocked verification
  email is queued at registration containing this token. There's no
  "resend verification email" endpoint yet.

POST /api/v1/auth/password-reset-request
  body: { email }
  204: no content, ALWAYS — whether or not the email is registered (this
  is deliberate, prevents an attacker from probing which emails exist;
  don't treat a 204 here as confirmation the email exists)

POST /api/v1/auth/password-reset-confirm
  body: { token, new_password }
  204: no content
  400: invalid/expired/already-used token
  Note: this revokes ALL of the user's refresh tokens server-side — after
  a successful reset, any other logged-in device/tab is signed out too.

GET /api/v1/users/me                    (Authorization: Bearer <token>)
GET /api/v1/accounts/me                 (Authorization: Bearer <token>)
  200: { id, balance, currency, created_at }

POST /api/v1/transfers                  (Authorization: Bearer <token>)
  body: { to_email, amount, reference_note? }
  201: { id, from_account_id, to_account_id, amount, currency, status, type, reference_note, created_at }
  400: insufficient funds / self-transfer, 404: recipient not found
  403: sender's email isn't verified yet — surface this distinctly from
       the 400/404 cases (e.g. "verify your email to send money" rather
       than a generic error), since it's a different kind of blocker

GET /api/v1/transactions?page=1&page_size=20   (Authorization: Bearer <token>)
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
