# BridgePay — Frontend Plan

**Backend status: fully complete** — auth, wallets, transfers, real
Stripe+M-Pesa+Airtel Money payment methods/deposits, real external
payouts (M-Pesa, Stripe card, Stripe bank account, Airtel Money),
multi-currency conversion, notifications, settings, admin, and Google
OAuth are all built and tested. See
[BridgePay-Backend's README](https://github.com/Mark-Musyoka/BridgePay-Backend/blob/main/README.md)
for verified endpoint behavior. **Targeting a launch by Friday,
September 18, 2026** — the frontend is being rebuilt from scratch to
cover everything the backend now supports (see section 6 for the plan).

## 1. What this is
The client for BridgePay — a payments platform (PayPal-style) built by
Abednego, Mark & Franklin (see README.md's Team section for roles).
This app talks to the FastAPI backend
([BridgePay-Backend](https://github.com/Mark-Musyoka/BridgePay-Backend))
to let a user register (with Google or email/password), verify their
email, manage their profile and linked payment methods, deposit real
money via card, M-Pesa, or Airtel Money, send money to other BridgePay
users or pay out externally to a phone (M-Pesa/Airtel Money), card, or
bank account, see notifications, and view their
transaction history.

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

## 3. Pages / routes

| Page | Status | What it needs to do |
|---|---|---|
| `/register` | Not started | Create account. Now needs a **country dropdown** (`GET /countries`, 249 entries) — required field |
| `/login` | Not started | Email/password, plus a **"Sign in with Google"** link (a real page navigation to `GET /auth/google/login`, not a fetch) |
| `/auth/google/complete` | Not started | Reads `?code=` (success) or `?error=` from the query string after Google redirects back through the backend, calls `POST /auth/google/exchange` with the code to get real tokens, then completes login the same way `/login` does |
| `/verify-email` | Not started | Confirms the token from the (mocked) verification email link; calls `POST /auth/verify-email`. Should also offer a "Resend email" action (`POST /auth/resend-verification`) |
| `/forgot-password` | Not started | Email input, calls `POST /auth/password-reset-request` |
| `/reset-password` | Not started | Token + new password form (token comes from the reset link's query param), calls `POST /auth/password-reset-confirm` |
| `/dashboard` | Not started | Balance + recent transactions — needs an added unread notification count |
| `/transfer` | Not started | Send money to another BridgePay user (email + amount). Should handle the `403` (unverified) case distinctly — a banner prompting email verification, not a generic error toast |
| `/payout` | Not started | Send money OUT of BridgePay entirely, to a phone number (M-Pesa or Airtel Money), a card (Stripe), or a bank account (Stripe, Kenyan local or international). Requires the sender's email always (confirmation), plus a destination picker with the destination-specific fields. Stripe card path needs a card **token**; the bank-account path needs a Stripe bank-account **token** — never raw numbers (tokenized via Stripe.js/Elements before it ever reaches our backend). See section 3a. When the response includes `exchange_rate`/`converted_amount` (non-null), show both the amount the user typed and what was actually deducted in the account's currency |
| `/deposit` | Not started | Real deposit via card (Stripe Elements + PaymentIntent confirmation), M-Pesa STK Push, or Airtel Money Collections (phone number + amount, then "check your phone" messaging for both mobile-money providers). Same `exchange_rate`/`converted_amount` display note as `/payout` above |
| `/profile` | Not started | Needs `GET /users/me`, `PATCH /users/me` (changing email should show a "please re-verify" notice), `POST /users/me/change-password` (current + new), and a linked payment methods section (list, add Stripe card/M-Pesa number, remove) |
| `/notifications` | Not started | List with mark-as-read; the dashboard's unread count should link here |
| `/transactions`, `/transactions/[id]` | Not started | Full paginated transaction history |
| `/admin` | Not started | Views all transactions (`?user_email=` filter) and the full audit log (`?action=` filter) — no fraud-flagging UI, since the backend has no `is_flagged` concept to persist it against |

## 3a. Backend API contract (as built)
Exact request/response shapes to build `lib/api.ts` against. **All paths
below are prefixed with `/api/v1`** (e.g. base URL
`https://bridgepay-backend.onrender.com/api/v1`) — the only unversioned
route on the backend is the root health check (`GET /`), which the
frontend has no reason to call directly.

Rate limits apply throughout (register 5/min, login 10/min, transfers
20/min, deposits/payouts 10/min, resend-verification 3/min, all
IP-keyed) — handle `429` responses in the API client.

```
--- Auth ---

POST /auth/register
  body: { email, password, full_name, country }   <- country now REQUIRED,
        ISO 3166-1 alpha-2 code (e.g. "KE"), validated server-side.
        Get the valid list from GET /countries.
  201: { id, email, full_name, is_active, is_verified, country, created_at }
  400: email already registered
  422: invalid country code

POST /auth/login
  body (form-urlencoded): username=<email>&password=<password>
  200: { access_token, refresh_token, token_type: "bearer" }
  401: incorrect credentials, OR a Google-only account trying password login
       (indistinguishable from wrong password — this is deliberate, to
       avoid revealing which accounts exist or how they authenticate)

POST /auth/refresh
  body: { refresh_token }
  200: { access_token, refresh_token, token_type: "bearer" }  (both are NEW — old refresh_token is single-use)
  401: invalid/expired, OR reuse detected (in which case ALL of that user's
       refresh tokens are revoked server-side — every device gets logged out)

POST /auth/logout
  body: { refresh_token }
  204: no content

POST /auth/verify-email
  body: { token }
  204: no content
  400: invalid/expired/already-used token

POST /auth/resend-verification              (Authorization: Bearer <token>)
  body: none
  204: no content — a fresh token is issued and a new (mocked) email queued
  400: already verified

POST /auth/password-reset-request
  body: { email }
  204: no content, ALWAYS — whether or not the email is registered (this
  is deliberate, prevents an attacker from probing which emails exist;
  don't treat a 204 here as confirmation the email exists)

POST /auth/password-reset-confirm
  body: { token, new_password }
  204: no content
  400: invalid/expired/already-used token
  Note: this revokes ALL of the user's refresh tokens server-side — after
  a successful reset, any other logged-in device/tab is signed out too.

--- Google OAuth (Sign in with Google) ---

GET /auth/google/login
  No fetch — navigate the browser here directly (<a href> or
  window.location), e.g. from a "Sign in with Google" button. Redirects
  to Google's consent screen.

GET /auth/google/callback
  Google redirects here directly — the frontend never calls this itself.
  It in turn redirects the browser to FRONTEND_OAUTH_COMPLETE_URL (a URL
  Mark/whoever deploys the backend configures — coordinate on what this
  is) with either ?code=<handoff_code> (success) or
  ?error=<invalid_state|email_not_verified|google_auth_failed> (failure).
  Build a page at that URL to handle both cases.

POST /auth/google/exchange
  body: { code }   <- the handoff code from the ?code= query param above,
        NOT anything from Google directly
  200: { access_token, refresh_token, token_type: "bearer" }  <- same
       shape as a normal login, use exactly the same post-login logic
  400: invalid/expired/already-used code (codes are single-use, 60s expiry)

--- Users / settings ---

GET /users/me                    (Authorization: Bearer <token>)
PATCH /users/me                  (Authorization: Bearer <token>)
  body: { full_name?, email?, country? }  <- all optional, only provided
        fields change
  200: { id, email, full_name, is_active, is_verified, country, created_at }
  400: new email already taken by another account
  Note: changing email resets is_verified to false and re-triggers the
  verification flow to the NEW address — show a "please re-verify"
  notice rather than silently losing send-money ability.

POST /users/me/change-password    (Authorization: Bearer <token>)
  body: { current_password, new_password }
  204: no content
  400: current_password is wrong
  Note: revokes ALL refresh tokens — this device's own session included.
  After a successful change, immediately redirect through the normal
  login flow again rather than assuming the current session survives.

GET /countries
  No auth needed — call this on the signup page to populate the country
  dropdown.
  200: [{ code: "KE", name: "Kenya" }, ...]  (249 entries)

--- Money: accounts, transfers, transactions ---

GET /accounts/me                 (Authorization: Bearer <token>)
  200: { id, balance, currency, created_at }

POST /transfers                  (Authorization: Bearer <token>)
  body: { to_email, amount, reference_note? }
  201: { id, from_account_id, to_account_id, amount, currency, status, type, reference_note, created_at }
  400: insufficient funds / self-transfer, 404: recipient not found
  403: sender's email isn't verified yet — surface this distinctly from
       the 400/404 cases (e.g. "verify your email to send money" rather
       than a generic error), since it's a different kind of blocker

GET /transactions?page=1&page_size=20   (Authorization: Bearer <token>)
  200: { items: [...], total, page, page_size }
  Note: no search/type filter support server-side — if you want those
  controls, filter client-side over the fetched page.

--- Payment methods (linking cards / M-Pesa numbers) ---

GET /payment-methods              (Authorization: Bearer <token>)
  200: [{ id, provider: "stripe"|"mpesa", type: "card"|"mobile_wallet",
          masked_details, is_default, created_at }, ...]

POST /payment-methods/stripe/setup-intent   (Authorization: Bearer <token>)
  body: none
  200: { client_secret }   <- pass to Stripe.js/Elements client-side to
       collect card details and confirm the SetupIntent. The raw card
       number NEVER touches our backend.

POST /payment-methods/stripe/confirm        (Authorization: Bearer <token>)
  body: { payment_method_id, set_as_default? }  <- the pm_... id Stripe.js
        gives you after confirming the SetupIntent above
  201: { id, provider: "stripe", type: "card", masked_details: "Visa •••• 4242", is_default, created_at }
  400: card belongs to a different Stripe customer (shouldn't happen in
       normal use — a defensive check)

POST /payment-methods/mpesa                 (Authorization: Bearer <token>)
  body: { phone_number, set_as_default? }   <- any common Kenyan format
        works (0712345678, +254712345678, 254712345678)
  201: { id, provider: "mpesa", type: "mobile_wallet", masked_details: "M-Pesa •••• 5678", is_default, created_at }
  400: that number is already linked to this account
  422: not a valid Kenyan mobile number

DELETE /payment-methods/{id}                (Authorization: Bearer <token>)
  204: no content
  404: not found / not yours

--- Deposits (adding real money to your BridgePay wallet) ---

POST /deposits/stripe             (Authorization: Bearer <token>)
  body: { amount, currency? (default "usd"), idempotency_key? }
  200: { client_secret, deposit_id }   <- confirm with Stripe.js
       client-side; the balance is credited ONLY after Stripe's webhook
       confirms success (asynchronous — don't assume the deposit is done
       just because this call returned)
  Note: pass a stable idempotency_key if there's any chance of a retry
  (e.g. a double-tap on "Deposit") — a repeated request with the same
  key returns the SAME PaymentIntent rather than creating a second charge.

POST /deposits/mpesa              (Authorization: Bearer <token>)
  body: { phone_number, amount, idempotency_key? }
  200: { deposit_id, message: "STK push sent — check your phone..." }
       <- also asynchronous; show a "check your phone for the M-Pesa
       prompt" state and poll GET /deposits or wait for a notification
  422: invalid phone number
  502: the STK push request itself failed (gateway/network issue)

POST /deposits/airtel             (Authorization: Bearer <token>)
  body: { phone_number, amount, idempotency_key? }
  200: { deposit_id, message: "Payment request sent — check your phone
        to approve via Airtel Money" }
       <- same asynchronous shape as M-Pesa above — confirmed via
       webhook, not this response. Same "check your phone" UI pattern.
  422: invalid phone number
  502: the Collections request itself failed (gateway/network issue)

GET /deposits?page=1&page_size=20  (Authorization: Bearer <token>)
  200: { items: [{ id, provider: "stripe"|"mpesa"|"airtel",
          status: "pending"|"completed"|"failed", amount, currency,
          exchange_rate, converted_amount, failure_reason, created_at,
          completed_at }], total, page, page_size }
  exchange_rate/converted_amount are null unless the deposit's currency
  differed from the account's own currency (KES by default) — when
  non-null, converted_amount is what was actually credited, not `amount`
  (what the user typed/sent). Show both when present.
  Use this (or notifications) to show deposit status updates, since
  both deposit endpoints return before the money has actually arrived.

--- Payouts (sending real money OUT of BridgePay) ---

POST /payouts/mpesa               (Authorization: Bearer <verified user's token>)
  body: { phone_number, recipient_email, amount, idempotency_key? }
  201: { id, provider: "mpesa", status: "pending", recipient_email, amount, currency, failure_reason, created_at, completed_at }
  400: insufficient funds
  403: sender's email isn't verified (same gate as /transfers)
  422: invalid phone number
  502: gateway request failed — the balance is automatically reversed
       server-side if this happens, no special handling needed beyond
       showing the error
  Note: the balance is deducted IMMEDIATELY (shown via GET /accounts/me
  right after this call), before the payout is confirmed — if it later
  fails (via a background process, not a response you'll see), the
  balance gets credited back and a "payout_reversed" notification fires.
  Don't assume "pending" status means the money hasn't moved yet.

POST /payouts/stripe-card         (Authorization: Bearer <verified user's token>)
  body: { card_token, recipient_email, amount, currency? (default "usd"), idempotency_key? }
  card_token: a Stripe token (tok_...) from tokenizing the RECIPIENT's
  card via Stripe.js — never send a raw card number to this endpoint.
  201: same shape as the M-Pesa payout above, provider: "stripe"
  400: insufficient funds
  403: sender's email isn't verified
  502: Stripe payout failed — balance auto-reversed, same as M-Pesa above

POST /payouts/bank-account        (Authorization: Bearer <verified user's token>)
  body: { bank_account_token, country, recipient_email, amount, currency? (default "usd"), idempotency_key? }
  bank_account_token: a Stripe bank account token (btok_...) from
  tokenizing the RECIPIENT's bank details via Stripe.js — never send a
  raw account number, IBAN, bank code, or SWIFT/BIC to this endpoint.
  Stripe.js's tokenization form already handles the field differences
  between a Kenyan local account (account number + bank code) and an
  international one (IBAN + SWIFT/BIC) — build two Stripe.js Element
  configurations (or one that adapts) based on the `country` the user
  picks, but this backend never sees those raw fields either way.
  country: ISO 3166-1 alpha-2 (e.g. "KE", "US", "GB") — validated
  server-side against the same list GET /countries returns.
  201: same shape as the M-Pesa payout above, provider: "stripe"
  400: insufficient funds
  403: sender's email isn't verified
  422: invalid country code
  502: Stripe payout failed — balance auto-reversed, same as M-Pesa above

POST /payouts/airtel              (Authorization: Bearer <verified user's token>)
  body: { phone_number, recipient_email, amount, idempotency_key? }
  201: same shape as the M-Pesa payout above, provider: "airtel"
  400: insufficient funds
  403: sender's email isn't verified
  422: invalid phone number
  502: gateway request failed — balance auto-reversed, same as M-Pesa above

GET /payouts?page=1&page_size=20  (Authorization: Bearer <token>)
  200: same shape as GET /deposits (including exchange_rate/
       converted_amount — see that note above), provider-appropriate
       fields. provider is one of "mpesa"|"stripe"|"airtel" — a bank
       payout and a card payout are both provider: "stripe"; tell them
       apart by destination_reference's prefix (tok_... vs btok_...) if
       you need to distinguish them in the UI

--- Notifications ---

GET /notifications?page=1&page_size=20&unread_only=false  (Authorization: Bearer <token>)
  200: { items: [{ id, type, title, body, is_read, created_at }], total, unread_count, page, page_size }
  Poll this (or refetch after any money-moving action) for the unread
  badge on the dashboard.

POST /notifications/{id}/read     (Authorization: Bearer <token>)
  204: no content, 404: not found / not yours

POST /notifications/read-all      (Authorization: Bearer <token>)
  204: no content

--- Admin ---

GET /admin/transactions?page=1&page_size=20&user_email=   (admin only)
GET /admin/audit-logs?page=1&page_size=20&action=          (admin only)
  403 for a non-admin token, 401 for no token. There's no self-service
  way to become an admin — ask whoever manages the deployed database to
  run `UPDATE users SET is_admin = true WHERE email = '...'`.
```

## 4. Security notes (frontend side)
- Store the JWT in an httpOnly cookie set by a Next.js route handler, not in
  `localStorage` — keeps it inaccessible to JS/XSS.
- Validate all form input client-side (amount > 0, valid email) as a UX nicety,
  but never trust it — the backend re-validates everything regardless.
- No sensitive data (full account numbers, tokens) ever logged to the browser
  console in production builds.
- Card numbers are NEVER sent to our own backend in any form — always
  tokenized client-side via Stripe.js/Elements first (both for linking a
  card as a payment method and for a Stripe card payout's `card_token`).
  This isn't optional hardening, it's how the backend's endpoints are
  actually shaped — they only accept `pm_...`/`tok_...` ids.

## 5. Current state (as of this rebuild)
Every page previously built on the Stitch UI branch — `(auth)/login`,
`(auth)/register`, `/dashboard`, `/transfer`, `/transactions` +
`/transactions/[id]`, `/admin`, `/topup`, `/profile` — has had its page
content cleared (each is now an empty stub component) so it can be
rebuilt against the backend's current, full surface rather than
patched incrementally. Folders/stub files now also exist for every
page that didn't have one yet: `/verify-email`, `/forgot-password`,
`/reset-password`, `/auth/google/complete`, `/deposit`, `/payout`,
`/notifications`. `/topup`'s folder is left in place (also emptied)
alongside the new `/deposit` — removing it and updating the sidebar's
nav link is part of the `/deposit` rebuild itself, not done here.

Untouched, since none of it is page content: `AuthContext`/`ToastContext`,
`lib/api.ts`, `lib/auth.ts` (httpOnly cookie helpers), `lib/utils.ts`,
`components/`, and the Next.js route handlers under `app/api/`.

## 6. Remaining work
Priority order — later items assume earlier ones exist. See the pages
table in section 3 for what each one actually needs to do; section 3a
for the exact request/response shapes, including the newer Airtel
Money and bank-account payout endpoints.

| # | Item | Depends on |
|---|---|---|
| 1 | Country dropdown on `/register` | `GET /countries` |
| 2 | `/auth/google/complete` page + "Sign in with Google" link on `/login` | — |
| 3 | `/verify-email` (+ resend action), `/forgot-password`, `/reset-password` | — |
| 4 | `/profile`, including the linked payment methods section | — |
| 5 | Payment method linking UI (Stripe Elements card form, M-Pesa phone form) | Item 4 |
| 6 | `/deposit` — Stripe card, M-Pesa, and Airtel Money, replacing `/topup` | Item 5 (a linked card helps but isn't strictly required for M-Pesa/Airtel) |
| 7 | `/payout` — M-Pesa, Stripe card, bank account, and Airtel Money | Item 5 |
| 8 | `/notifications` page + unread-count badge on `/dashboard` | — |
| 9 | `/dashboard`, `/transfer`, `/transactions` + `/transactions/[id]`, `/admin` | — |
| 10 | Polish pass — loading/empty states, error boundaries, responsive layout, the `403`-unverified banner on `/transfer` and `/payout`, sidebar nav updated to point at `/deposit` instead of `/topup` and to include `/payout`/`/notifications` | Items 1-9 |

## 7. Explicitly out of scope for now
- Admin dashboard beyond a read-only list (no fraud-flagging UI — the
  backend has no `is_flagged` concept to flag against, see
  BridgePay-Backend's README Phase 9)
- Mobile app — web only for now

## 8. Path to launch — task division (target: Friday, September 18, 2026)
**Note:** this split was written assuming the partial progress described
in the old section 5 (since replaced — see above). With every page now
reset to an empty stub, the "this week" assignments below no longer
match reality and need re-splitting by whoever's actually picking up
each item; left as-is here rather than guessing a new division.

A suggested split, not a rigid assignment — adjust based on who's
actually free when. Backend is done; everything left is frontend +
credentials + deployment.

**This week (through Sunday, Sept 13)**

| Person | Assigned items | Why |
|---|---|---|
| Franklin | 1-3 (country dropdown, Google OAuth completion page, `/profile` wiring) | Self-contained, lower-risk starting points |
| Mark | 4-5 (payment method linking UI, real deposit page) | Highest-effort, most fiddly (Stripe Elements) — start earliest |
| Abednego | ~~Get real Stripe test-mode, M-Pesa sandbox, and Google OAuth credentials set up~~ **done** (configured locally) — sharing securely with the team and starting Render + Vercel deployment setup are still in progress | So deployment isn't a last-minute scramble |

**Next week (Mon Sept 14 – Fri Sept 18)**

| Day | Task |
|---|---|
| Mon–Tue | Items 6-7 (payout page, notifications) — whoever finishes their "this week" items first picks these up |
| Wed | Item 8 (resend-verification) + item 9 (polish pass) — everyone, split by page |
| Thu | Full end-to-end test pass by all three: register → verify → link a card/M-Pesa number → deposit → transfer → payout → check notifications/admin — using real sandbox credentials, not mocks |
| Fri (Sept 18) | Deploy, final smoke test, launch |

## 9. Folder structure (as built)
```
frontend/
  src/
    app/
      (auth)/
        login/page.tsx               # empty stub
        register/page.tsx            # empty stub
        verify-email/page.tsx        # empty stub
        forgot-password/page.tsx     # empty stub
        reset-password/page.tsx      # empty stub
        auth/google/complete/page.tsx  # empty stub
      (dashboard)/
        dashboard/page.tsx           # empty stub
        transfer/page.tsx            # empty stub
        deposit/page.tsx             # empty stub — replaces topup/, not yet removed
        payout/page.tsx              # empty stub
        notifications/page.tsx       # empty stub
        transactions/page.tsx        # empty stub
        transactions/[id]/page.tsx   # empty stub
        admin/page.tsx                # empty stub
        topup/page.tsx                 # empty stub — superseded by deposit/, kept until nav is updated
        profile/page.tsx                # empty stub
      api/
        auth/
          login/route.ts      # sets httpOnly cookies after login
          logout/route.ts
        me/route.ts
        account/route.ts
        transactions/route.ts
        transfers/route.ts
        admin/
          transactions/route.ts
          audit-logs/route.ts
      layout.tsx
      page.tsx                 # landing / redirect
    components/
      ui/                       # Button, Input, Card, Badge, Modal, Skeleton, Icons
      layout/                   # Sidebar, Header, BottomNav
      *.tsx                     # feature components, flat — BalanceCard, StatCards,
                                 # RecentTransactions, TransactionTable, TransactionFilters, etc.
    hooks/
      useAuth.ts                # re-exports context/AuthContext's hook
      useToast.ts                # re-exports context/ToastContext's hook
    context/
      AuthContext.tsx           # login/logout/register/demoLogin, user+account state
      ToastContext.tsx
    lib/
      api.ts                    # typed backend API client + `api` namespace object
      auth.ts                   # httpOnly cookie helpers
      utils.ts
    types/
      index.ts                  # shared TS types matching backend schemas
  .env.local.example
  PLAN.md
```
