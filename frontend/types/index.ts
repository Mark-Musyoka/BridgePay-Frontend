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

// ─── Transfers / Transactions ────────────────

/** POST /transfers — request body */
export interface TransferRequest {
  to_email: string;
  amount: number;
  reference_note?: string;
}

/** POST /transfers — 201 response & items inside GET /transactions */
export interface Transaction {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  currency: string;
  status: string;
  type: string;
  reference_note: string | null;
  created_at: string;
}

/** GET /transactions?page=1&page_size=20 — 200 response */
export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

// ─── Errors ──────────────────────────────────

/** Shape used by the API client when a request fails */
export interface ApiError {
  status: number;
  message: string;
}
