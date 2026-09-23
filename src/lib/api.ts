// ──────────────────────────────────────────────
// BridgePay — Typed API client
// Thin fetch wrapper for every backend endpoint.
// ──────────────────────────────────────────────

import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  VerifyEmailRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  GoogleExchangeRequest,
  User,
  Account,
  Country,
  TransferRequest,
  Transaction,
  PaginatedTransactions,
  NotificationListResponse,
  StripeDepositCreate,
  StripeDepositResponse,
  MpesaDepositCreate,
  AirtelDepositCreate,
  MpesaOrAirtelDepositResponse,
  MpesaPayoutCreate,
  AirtelPayoutCreate,
  StripeCardPayoutCreate,
  BankAccountPayoutCreate,
  Payout,
  PayoutListResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PaymentMethod,
  StripeSetupIntentResponse,
  StripeConfirmCardRequest,
  LinkMpesaRequest,
  ApiError,
} from "@/types";

// ─── Base URL ────────────────────────────────

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** BridgePay-Web — the marketing/introduction site on the main domain.
 * "Back to home" links there, not to a route in this app. */
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

// ─── Error class ─────────────────────────────

/**
 * Thrown by every API helper when the backend returns a non-2xx status.
 * Consumers can inspect `.status` and `.message` for error handling.
 */
export class ApiRequestError extends Error implements ApiError {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

// ─── Internal helpers ────────────────────────

/**
 * Core fetch wrapper.
 * - Attaches Authorization header when `token` is provided.
 * - Parses JSON and throws `ApiRequestError` on non-2xx responses.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Default to JSON content type for requests with a body,
  // unless the caller already set one (e.g. form-urlencoded for login).
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content (e.g. logout)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // FastAPI returns { "detail": "..." } for errors
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new ApiRequestError(response.status, message);
  }

  return data as T;
}

// ─── Auth endpoints ──────────────────────────

/**
 * POST /auth/register
 * Creates a new user account.
 */
export async function register(body: RegisterRequest): Promise<User> {
  return request<User>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT.
 * Note: The backend expects form-urlencoded, NOT JSON.
 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", body.username);
  formData.append("password", body.password);

  return request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * POST /api/v1/auth/refresh
 * Exchanges a refresh token for a new access + refresh token pair.
 * The old refresh token is single-use and invalidated after this call.
 */
export async function refresh(body: RefreshRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/logout
 * Revokes the given refresh token server-side.
 */
export async function logout(body: RefreshRequest): Promise<void> {
  return request<void>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/verify-email
 * Confirms a user's email using the token from the (mocked) verification
 * email. 204 on success, 400 if the token is invalid/expired/already used.
 */
export async function verifyEmail(body: VerifyEmailRequest): Promise<void> {
  return request<void>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/password-reset-request
 * Always returns 204, whether or not the email is registered — this is
 * deliberate (prevents an attacker from probing which emails exist), so
 * don't treat the response as confirmation the email exists.
 */
export async function requestPasswordReset(
  body: PasswordResetRequest,
): Promise<void> {
  return request<void>("/api/v1/auth/password-reset-request", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /api/v1/auth/password-reset-confirm
 * On success this revokes ALL of the user's refresh tokens server-side —
 * any other logged-in device/tab gets signed out too.
 */
export async function confirmPasswordReset(
  body: PasswordResetConfirmRequest,
): Promise<void> {
  return request<void>("/api/v1/auth/password-reset-confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /auth/resend-verification
 * Issues a fresh verification token for the logged-in user (requires
 * auth — login isn't gated on verification, so the user can already be
 * logged in when they need this). 400 if already verified.
 */
export async function resendVerification(token: string): Promise<void> {
  return request<void>("/api/v1/auth/resend-verification", { method: "POST" }, token);
}

/**
 * POST /auth/google/exchange
 * Exchanges the short-lived handoff code from the backend's own
 * redirect to /auth/google/complete?code=... (NOT a Google code) for a
 * real access/refresh token pair, same shape as a normal login.
 */
export async function googleExchange(body: GoogleExchangeRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/google/exchange", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Reference data ──────────────────────────

/**
 * GET /countries
 * Public, unauthenticated. Backs the registration country dropdown.
 */
export async function getCountries(): Promise<Country[]> {
  return request<Country[]>("/api/v1/countries", { method: "GET" });
}

// ─── User endpoints ──────────────────────────

/**
 * GET /users/me
 * Returns the currently authenticated user's profile.
 */
export async function getMe(token: string): Promise<User> {
  return request<User>("/api/v1/users/me", { method: "GET" }, token);
}

// ─── Account endpoints ──────────────────────

/**
 * GET /accounts/me
 * Returns the authenticated user's account (balance, currency, etc.).
 */
export async function getAccount(token: string): Promise<Account> {
  return request<Account>("/api/v1/accounts/me", { method: "GET" }, token);
}

// ─── Transfer endpoints ─────────────────────

/**
 * POST /transfers
 * Sends money to another user by email.
 */
export async function createTransfer(
  body: TransferRequest,
  token: string,
): Promise<Transaction> {
  return request<Transaction>(
    "/api/v1/transfers",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token,
  );
}

// ─── Transaction endpoints ──────────────────

/**
 * GET /transactions?page=<n>&page_size=<n>
 * Returns a paginated list of the user's transactions.
 */
export async function getTransactions(
  token: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return request<PaginatedTransactions>(
    `/api/v1/transactions?${params.toString()}`,
    { method: "GET" },
    token,
  );
}

// ─── Profile ──────────────────────────────────

export async function updateProfile(body: UpdateProfileRequest, token: string): Promise<User> {
  return request<User>("/api/v1/users/me", { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function changePassword(body: ChangePasswordRequest, token: string): Promise<void> {
  return request<void>("/api/v1/users/me/change-password", { method: "POST", body: JSON.stringify(body) }, token);
}

// ─── Payment methods ──────────────────────────

export async function getPaymentMethods(token: string): Promise<PaymentMethod[]> {
  return request<PaymentMethod[]>("/api/v1/payment-methods", { method: "GET" }, token);
}

export async function startStripeCardLink(token: string): Promise<StripeSetupIntentResponse> {
  return request<StripeSetupIntentResponse>("/api/v1/payment-methods/stripe/setup-intent", { method: "POST" }, token);
}

export async function confirmStripeCardLink(body: StripeConfirmCardRequest, token: string): Promise<PaymentMethod> {
  return request<PaymentMethod>(
    "/api/v1/payment-methods/stripe/confirm",
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
}

export async function linkMpesaPaymentMethod(body: LinkMpesaRequest, token: string): Promise<PaymentMethod> {
  return request<PaymentMethod>("/api/v1/payment-methods/mpesa", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function unlinkPaymentMethod(methodId: string, token: string): Promise<void> {
  return request<void>(`/api/v1/payment-methods/${methodId}`, { method: "DELETE" }, token);
}

// ─── Deposit endpoints ────────────────────────

export async function createStripeDeposit(body: StripeDepositCreate, token: string): Promise<StripeDepositResponse> {
  return request<StripeDepositResponse>("/api/v1/deposits/stripe", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function createMpesaDeposit(
  body: MpesaDepositCreate,
  token: string,
): Promise<MpesaOrAirtelDepositResponse> {
  return request<MpesaOrAirtelDepositResponse>(
    "/api/v1/deposits/mpesa",
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
}

export async function createAirtelDeposit(
  body: AirtelDepositCreate,
  token: string,
): Promise<MpesaOrAirtelDepositResponse> {
  return request<MpesaOrAirtelDepositResponse>(
    "/api/v1/deposits/airtel",
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
}

// ─── Payout endpoints ─────────────────────────

export async function createMpesaPayout(body: MpesaPayoutCreate, token: string): Promise<Payout> {
  return request<Payout>("/api/v1/payouts/mpesa", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function createAirtelPayout(body: AirtelPayoutCreate, token: string): Promise<Payout> {
  return request<Payout>("/api/v1/payouts/airtel", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function createStripeCardPayout(body: StripeCardPayoutCreate, token: string): Promise<Payout> {
  return request<Payout>("/api/v1/payouts/stripe-card", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function createBankAccountPayout(body: BankAccountPayoutCreate, token: string): Promise<Payout> {
  return request<Payout>("/api/v1/payouts/bank-account", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function getPayouts(token: string, page: number = 1, pageSize: number = 20): Promise<PayoutListResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return request<PayoutListResponse>(`/api/v1/payouts?${params.toString()}`, { method: "GET" }, token);
}

// ─── Notification endpoints ──────────────────

/**
 * GET /notifications?page=<n>&page_size=<n>
 * Includes unread_count in the response, not just the paginated items —
 * that's what a bell-icon badge should read, not items.length (which
 * is just this one page's size).
 */
export async function getNotifications(
  token: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<NotificationListResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return request<NotificationListResponse>(
    `/api/v1/notifications?${params.toString()}`,
    { method: "GET" },
    token,
  );
}

/** POST /notifications/{id}/read — 204 on success */
export async function markNotificationRead(id: string, token: string): Promise<void> {
  return request<void>(`/api/v1/notifications/${id}/read`, { method: "POST" }, token);
}

/** POST /notifications/read-all — 204 on success */
export async function markAllNotificationsRead(token: string): Promise<void> {
  return request<void>("/api/v1/notifications/read-all", { method: "POST" }, token);
}

// ─── Admin endpoints ─────────────────────────
// Both require an admin token — the backend returns 403 for a non-admin
// user and 401 for no token at all.

/**
 * GET /admin/transactions
 * All transactions across all users, optionally filtered to one user's
 * activity via userEmail. There is no "flag a transaction" endpoint or
 * concept on the backend (Transaction has no is_flagged field) — that's
 * UI-only for now.
 */
export async function getAdminTransactions(
  token: string,
  page: number = 1,
  pageSize: number = 20,
  userEmail?: string,
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (userEmail) params.set("user_email", userEmail);

  return request<PaginatedTransactions>(
    `/api/v1/admin/transactions?${params.toString()}`,
    { method: "GET" },
    token,
  );
}

/**
 * GET /admin/audit-logs
 * Login attempts, failed transfers, password resets, etc. — separate
 * from the transaction ledger. Optionally filtered by action type
 * (e.g. "login_failed", "transfer_failed_insufficient_funds").
 */
export async function getAuditLogs(
  token: string,
  page: number = 1,
  pageSize: number = 20,
  action?: string,
): Promise<{
  items: Array<{
    id: string;
    user_id: string | null;
    action: string;
    detail: string | null;
    ip_address: string | null;
    created_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
}> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (action) params.set("action", action);

  return request(`/api/v1/admin/audit-logs?${params.toString()}`, { method: "GET" }, token);
}

// ─── `api` namespace object ──────────────────────────────────────────
// Used by client components (transfer, transactions, transactions/[id],
// admin, topup pages). These call this app's OWN internal API routes
// (/api/transactions, /api/transfers, etc.) via plain fetch — never the
// FastAPI backend directly, and never with a token argument. This
// matches AuthContext.tsx's own refreshUser/refreshAccount pattern
// exactly: the httpOnly access/refresh cookies are invisible to any
// client-side JS by design (see AuthContext.tsx's top comment and
// PLAN.md's security notes) — the internal route handlers read the
// cookie server-side and proxy to the real backend.
//
// Two methods have no real backend endpoint behind them yet — they
// throw a clear, descriptive error instead of silently pretending to
// succeed:
//   - getTransactionById: backend only exposes GET /transactions (a
//     paginated list), no single-item lookup. Implemented as a stopgap
//     by fetching a page and finding the id client-side — genuinely
//     real data, just an inefficient way to get it until a real
//     GET /transactions/{id} endpoint exists.
//   - flagTransaction: Transaction has no is_flagged concept on the
//     backend at all — this was always UI-only, per the comment on
//     getAdminTransactions above.
async function proxyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiRequestError(res.status, body.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getMe: () => proxyFetch<User>("/api/me"),
  getAccount: () => proxyFetch<Account>("/api/account"),

  createTransfer: (body: TransferRequest) =>
    proxyFetch<Transaction>("/api/transfers", { method: "POST", body: JSON.stringify(body) }),

  getTransactions: (opts: { page?: number; page_size?: number } = {}) => {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      page_size: String(opts.page_size ?? 20),
    });
    return proxyFetch<PaginatedTransactions>(`/api/transactions?${params.toString()}`);
  },

  getAdminTransactions: (opts: { page?: number; page_size?: number; user_email?: string } = {}) => {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      page_size: String(opts.page_size ?? 20),
    });
    if (opts.user_email) params.set("user_email", opts.user_email);
    return proxyFetch<PaginatedTransactions>(`/api/admin/transactions?${params.toString()}`);
  },

  getAuditLogs: (opts: { page?: number; page_size?: number; action?: string } = {}) => {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      page_size: String(opts.page_size ?? 20),
    });
    if (opts.action) params.set("action", opts.action);
    return proxyFetch<{
      items: Array<{
        id: string;
        user_id: string | null;
        action: string;
        detail: string | null;
        ip_address: string | null;
        created_at: string;
      }>;
      total: number;
      page: number;
      page_size: number;
    }>(`/api/admin/audit-logs?${params.toString()}`);
  },

  resendVerification: () => proxyFetch<void>("/api/auth/resend-verification", { method: "POST" }),

  getNotifications: (opts: { page?: number; page_size?: number } = {}) => {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      page_size: String(opts.page_size ?? 20),
    });
    return proxyFetch<NotificationListResponse>(`/api/notifications?${params.toString()}`);
  },

  markNotificationRead: (id: string) =>
    proxyFetch<void>(`/api/notifications/${id}/read`, { method: "POST" }),

  markAllNotificationsRead: () => proxyFetch<void>("/api/notifications/read-all", { method: "POST" }),

  async getTransactionById(id: string): Promise<Transaction> {
    const { items } = await api.getTransactions({ page: 1, page_size: 100 });
    const found = items.find((t) => t.id === id);
    if (!found) {
      throw new ApiRequestError(404, "Transaction not found");
    }
    return found;
  },

  updateProfile: (body: UpdateProfileRequest) =>
    proxyFetch<User>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),

  changePassword: (body: ChangePasswordRequest) =>
    proxyFetch<void>('/api/users/me/change-password', { method: 'POST', body: JSON.stringify(body) }),

  getPaymentMethods: () => proxyFetch<PaymentMethod[]>('/api/payment-methods'),

  startStripeCardLink: () => proxyFetch<StripeSetupIntentResponse>('/api/payment-methods/stripe/setup-intent', { method: 'POST' }),

  confirmStripeCardLink: (body: StripeConfirmCardRequest) =>
    proxyFetch<PaymentMethod>('/api/payment-methods/stripe/confirm', { method: 'POST', body: JSON.stringify(body) }),

  linkMpesaPaymentMethod: (body: LinkMpesaRequest) =>
    proxyFetch<PaymentMethod>('/api/payment-methods/mpesa', { method: 'POST', body: JSON.stringify(body) }),

  unlinkPaymentMethod: (methodId: string) =>
    proxyFetch<void>(`/api/payment-methods/${methodId}`, { method: 'DELETE' }),

  createStripeDeposit: (body: StripeDepositCreate) =>
    proxyFetch<StripeDepositResponse>('/api/deposits/stripe', { method: 'POST', body: JSON.stringify(body) }),

  createMpesaDeposit: (body: MpesaDepositCreate) =>
    proxyFetch<MpesaOrAirtelDepositResponse>('/api/deposits/mpesa', { method: 'POST', body: JSON.stringify(body) }),

  createAirtelDeposit: (body: AirtelDepositCreate) =>
    proxyFetch<MpesaOrAirtelDepositResponse>('/api/deposits/airtel', { method: 'POST', body: JSON.stringify(body) }),

  createMpesaPayout: (body: MpesaPayoutCreate) =>
    proxyFetch<Payout>('/api/payouts/mpesa', { method: 'POST', body: JSON.stringify(body) }),

  createAirtelPayout: (body: AirtelPayoutCreate) =>
    proxyFetch<Payout>('/api/payouts/airtel', { method: 'POST', body: JSON.stringify(body) }),

  createStripeCardPayout: (body: StripeCardPayoutCreate) =>
    proxyFetch<Payout>('/api/payouts/stripe-card', { method: 'POST', body: JSON.stringify(body) }),

  createBankAccountPayout: (body: BankAccountPayoutCreate) =>
    proxyFetch<Payout>('/api/payouts/bank-account', { method: 'POST', body: JSON.stringify(body) }),

  getPayouts: (opts: { page?: number; page_size?: number } = {}) => {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      page_size: String(opts.page_size ?? 20),
    });
    return proxyFetch<PayoutListResponse>(`/api/payouts?${params.toString()}`);
  },

  async flagTransaction(_id: string, _flagged: boolean): Promise<never> {
    throw new ApiRequestError(
      501,
      "Flagging isn't supported by the backend yet — Transaction has no is_flagged field.",
    );
  },
};
