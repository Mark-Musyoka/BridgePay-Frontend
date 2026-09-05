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
  is_active: boolean;
  is_verified: boolean;
  created_at: string; // ISO 8601 datetime from the backend
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

/**
 * NOT YET IMPLEMENTED on the backend — there is no deposit/top-up
 * endpoint yet (see BridgePay-Backend README's "not built" list).
 * Kept here as groundwork for that work, not wired to anything real.
 */
export interface TopUpRequest {
  amount: number;
  currency?: string;
  payment_method?: string;
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
