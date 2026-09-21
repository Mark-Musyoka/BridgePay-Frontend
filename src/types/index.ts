// ──────────────────────────────────────────────
// BridgePay — shared TypeScript types
// Mirrors the FastAPI backend's request/response schemas exactly.
// ──────────────────────────────────────────────

// ─── Auth ────────────────────────────────────

/** POST /auth/register — request body */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  country: string; // ISO 3166-1 alpha-2, required by the backend
}

/** POST /auth/login — request body (sent as form-urlencoded, NOT JSON) */
export interface LoginRequest {
  username: string; // this is the user's email
  password: string;
}

/**
 * POST /auth/register — 201 response
 * GET  /users/me      — 200 response
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  country: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string; // ISO 8601 datetime from the backend
  // NOTE: the backend's UserResponse has no is_admin field at all — the
  // only way to know if the current user is an admin is to try an
  // admin-only endpoint and see whether it's 200 or 403. The /admin
  // page relies on that, not on any flag here.
}

/** GET /countries — 200 response item. Public, unauthenticated endpoint. */
export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
}

export type RegisterResponse = User;
export type UserResponse = User;

/** POST /auth/login — 200 response */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

/** POST /auth/refresh — request body */
export interface RefreshRequest {
  refresh_token: string;
}

/** POST /auth/verify-email — request body */
export interface VerifyEmailRequest {
  token: string;
}

/** POST /auth/password-reset-request — request body */
export interface PasswordResetRequest {
  email: string;
}

/** POST /auth/password-reset-confirm — request body */
export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

// ─── Accounts ────────────────────────────────

/** GET /accounts/me — 200 response */
export interface Account {
  id: string;
  balance: string; // string representation of a decimal amount
  currency: string;
  created_at: string;
}

export type AccountResponse = Account;

// ─── Deposits ─────────────────────────────────

export interface StripeDepositCreate {
  amount: number;
  currency?: string; // default "usd" on the backend
  idempotency_key?: string;
}

export interface StripeDepositResponse {
  client_secret: string;
  deposit_id: string;
}

export interface MpesaDepositCreate {
  phone_number: string;
  amount: number;
  idempotency_key?: string;
}

export interface AirtelDepositCreate {
  phone_number: string;
  amount: number;
  idempotency_key?: string;
}

export interface MpesaOrAirtelDepositResponse {
  deposit_id: string;
  message: string;
}

// ─── Payouts ──────────────────────────────────

export interface MpesaPayoutCreate {
  phone_number: string;
  recipient_email: string;
  amount: number;
  idempotency_key?: string;
}

export interface AirtelPayoutCreate {
  phone_number: string;
  recipient_email: string;
  amount: number;
  idempotency_key?: string;
}

export interface StripeCardPayoutCreate {
  card_token: string; // tok_... from Stripe.js — never a raw card number
  recipient_email: string;
  amount: number;
  currency?: string; // default "usd" on the backend
  idempotency_key?: string;
}

export interface BankAccountPayoutCreate {
  bank_account_token: string; // btok_... from Stripe.js — never a raw account number
  country: string; // ISO 3166-1 alpha-2
  recipient_email: string;
  amount: number;
  currency?: string; // default "usd" on the backend
  idempotency_key?: string;
}

export interface Payout {
  id: string;
  provider: 'mpesa' | 'stripe' | 'airtel';
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  recipient_email: string;
  amount: string;
  currency: string;
  failure_reason: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PayoutListResponse {
  items: Payout[];
  total: number;
  page: number;
  page_size: number;
}

// ─── Transfers / Transactions ────────────────

/** POST /transfers — request body */
export interface TransferRequest {
  to_email: string;
  amount: number;
  reference_note?: string;
}

// These match the backend's actual enum values exactly
// (app/modules/transactions/models.py). The backend does NOT return
// direction-specific values like "transfer_sent"/"transfer_received" —
// every transfer has type "transfer" regardless of direction; the
// caller must derive direction by comparing from_account_id/
// to_account_id against their own account id. There is also no
// "flagged" status — that's a UI-only concept for now, not something
// the backend tracks on a transaction.
export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionType = "transfer" | "deposit" | "withdrawal";

/** POST /transfers — 201 response & items inside GET /transactions */
export interface Transaction {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: string;
  currency: string;
  status: TransactionStatus | string;
  type: TransactionType | string;
  reference_note: string | null;
  created_at: string;

  // NOT provided by the real backend yet — TransactionResponse only
  // returns account IDs, not the counterparty's email/name. Several UI
  // components (RecentTransactions, TransactionTable) reference these
  // for display; they'll be `undefined` until the backend is enriched
  // to include them (or the frontend does a separate account/user
  // lookup). See TODO comments in those components.
  from_user_email?: string;
  to_user_email?: string;

  // UI-only — the backend's Transaction model has no is_flagged concept
  // at all (see BridgePay-Backend's admin router). The admin page's
  // "flag" action currently always fails with a clear error for this
  // reason; this field only exists so that dead/unreachable optimistic-
  // update code type-checks, not because flagging actually persists.
  is_flagged?: boolean;
}

export type TransferResponse = Transaction;

/**
 * Only page/page_size are actually supported by the real
 * GET /transactions endpoint today. status/type/search are aspirational
 * — sending them currently has no effect server-side.
 */
export interface TransactionsQuery {
  page?: number;
  page_size?: number;
  status?: string;
  type?: string;
  search?: string;
}

/** GET /transactions?page=1&page_size=20 — 200 response */
export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}
export type PaginatedTransactionsResponse = PaginatedTransactions;

// ─── Dashboard / stats (UI-side only) ────────
// Not backed by any real backend endpoint — if used, these must be
// computed client-side from GET /accounts/me + GET /transactions,
// not fetched directly.
export interface DashboardStats {
  current_balance: number;
  currency: string;
  total_sent: number;
  total_received: number;
  transaction_count: number;
  monthly_growth_rate: number;
}

export interface AdminStats {
  total_volume: number;
  total_users: number;
  total_transactions: number;
  flagged_transactions_count: number;
}

// ─── Errors ──────────────────────────────────

/** Shape used by the API client when a request fails */
export interface ApiError {
  status: number;
  message: string;
}

/** Raw FastAPI validation error shape, before lib/api.ts normalizes it into ApiError */
export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
}

// ─── Notifications ───────────────────────────

export type NotificationType =
  | "transfer_sent"
  | "transfer_received"
  | "deposit_completed"
  | "deposit_failed"
  | "payout_sent"
  | "payout_failed"
  | "payout_reversed"
  | "security_alert"
  | "account_update";

/** GET /notifications — item shape */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

/** GET /notifications?page=1&page_size=20 — 200 response */
export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

// ─── Google OAuth ─────────────────────────────

/** POST /auth/google/exchange — request body. `code` is the short-lived
 * handoff code from the backend's own redirect to
 * /auth/google/complete?code=..., NOT a Google authorization code. */
export interface GoogleExchangeRequest {
  code: string;
}
